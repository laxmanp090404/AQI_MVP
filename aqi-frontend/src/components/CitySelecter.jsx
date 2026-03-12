import { cities } from "../utils/cities";

export default function CitySelector({ city, setCity }) {
  return (
    <select
      className="border p-2 rounded"
      value={city}
      onChange={(e) => setCity(e.target.value)}
    >
      <option>Select City</option>

      {Object.keys(cities).map((c) => (
        <option key={c}>{c}</option>
      ))}
    </select>
  );
}