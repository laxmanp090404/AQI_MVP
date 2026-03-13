export default function PredictionCard({ data }) {

  if (!data) return null;

  return (
    <div
      className="p-6 shadow-lg rounded text-white w-80"
      style={{ background: data.color }}
    >
      <h2 className="text-xl font-bold">{data.city}</h2>

      <p className="text-3xl font-bold">{data.aqi}</p>

      <p>{data.category}</p>

      <p>PM2.5: {data.predicted_pm25}</p>

      <p>Prediction for: {data.predicted_for}</p>
    </div>
  );
}