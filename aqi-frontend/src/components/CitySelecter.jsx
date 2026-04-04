import { cities } from "../utils/cities";

export default function CitySelector({ city, setCity }) {
  return (
    <select
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm md:w-64"
      value={city}
      onChange={(e) => setCity(e.target.value)}
    >
      <option value="">Select City</option>

      {Object.keys(cities).map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}