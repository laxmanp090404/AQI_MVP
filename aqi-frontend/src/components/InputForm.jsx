import React, { useState } from 'react';

const InputForm = ({ onPredict, selectedCity }) => {
  // Initial values based on common Indian city medians
  const [formData, setFormData] = useState({
    pm25: 85.0,
    pm25_lag_1: 82.0,
    pm25_roll_mean_7d: 78.0,
    temperature: 28.0,
    humidity: 50.0,
    wind_speed: 4.5,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Constructing the 59-feature payload
    const payload = {
      city_name: selectedCity,
      "PM2.5": formData.pm25,
      "PM2.5_lag_1": formData.pm25_lag_1,
      "PM2.5_roll_mean_7d": formData.pm25_roll_mean_7d,
      "Temperature": formData.temperature,
      "Humidity": formData.humidity,
      "Wind_Speed": formData.wind_speed,
      "month": new Date().getMonth() + 1,
      "day_of_week": new Date().getDay(),
      "is_weekend": [0, 6].includes(new Date().getDay()) ? 1 : 0,
      [`City_${selectedCity}`]: 1 // One-Hot Encoding for the target city
    };

    console.log("📤 [FRONTEND] Sending Data to Node.js Backend:", payload);
    onPredict(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="prediction-form">
      <div className="input-grid">
        <div className="form-group">
          <label>Today's PM2.5</label>
          <input type="number" name="pm25" placeholder="e.g. 85.5" onChange={handleChange} value={formData.pm25} required />
        </div>
        <div className="form-group">
          <label>Yesterday's PM2.5 (Lag 1)</label>
          <input type="number" name="pm25_lag_1" placeholder="e.g. 82.0" onChange={handleChange} value={formData.pm25_lag_1} required />
        </div>
        <div className="form-group">
          <label>7-Day Average (Roll Mean)</label>
          <input type="number" name="pm25_roll_mean_7d" placeholder="e.g. 78.5" onChange={handleChange} value={formData.pm25_roll_mean_7d} required />
        </div>
        <div className="form-group">
          <label>Temperature (°C)</label>
          <input type="number" name="temperature" placeholder="e.g. 28" onChange={handleChange} value={formData.temperature} required />
        </div>
        <div className="form-group">
          <label>Humidity (%)</label>
          <input type="number" name="humidity" placeholder="e.g. 50" onChange={handleChange} value={formData.humidity} required />
        </div>
        <div className="form-group">
          <label>Wind Speed (m/s)</label>
          <input type="number" name="wind_speed" placeholder="e.g. 5.2" onChange={handleChange} value={formData.wind_speed} required />
        </div>
      </div>
      <button type="submit" className="predict-btn">Get 24-Hour Forecast</button>
      
      <style>{`
        .prediction-form { background: #fdfdfd; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .form-group label { display: block; font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #555; }
        .form-group input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .predict-btn { width: 100%; padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .predict-btn:hover { background-color: #0056b3; }
      `}</style>
    </form>
  );
};

export default InputForm;