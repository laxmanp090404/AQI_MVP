import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AQIMap from './components/AQIMap';
import InputForm from './components/InputForm';
import { cityCoords } from './utils/aqiHelpers';

const API_BASE = import.meta.env.VITE_API_URL;

function App() {
  const [selectedCity, setSelectedCity] = useState("Delhi");
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (err) { console.error("❌ Failed to fetch history", err); }
  };

  const handlePredict = async (payload) => {
    try {
      const res = await axios.post(`${API_BASE}/forecast`, payload);
      
      // LOGGING THE OUTPUT
      console.log("📥 [BACKEND] Response Received:", res.data);
      
      setCurrentResult(res.data);
      fetchHistory();
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      alert("Error calculating forecast. Check console for details.");
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h1>AQI Ensemble Prediction System</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        <main>
          <div style={{ marginBottom: '20px' }}>
            <label><strong>Target City: </strong></label>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              {Object.keys(cityCoords).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <InputForm onPredict={handlePredict} selectedCity={selectedCity} />
          <AQIMap activeCity={selectedCity} aqiData={currentResult} />
        </main>
        <aside>
          <h3>Search Logs</h3>
          <div style={{ maxHeight: '550px', overflowY: 'auto' }}>
            {history.map(h => (
              <div key={h._id} style={{ 
                borderLeft: `5px solid ${h.last_color}`, 
                padding: '10px', 
                background: '#f9f9f9', 
                marginBottom: '10px',
                borderRadius: '4px'
              }}>
                <strong>{h.city}</strong>: {h.last_prediction.toFixed(2)} AQI
                <br/><small>{h.last_category} • {new Date(h.last_updated).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;