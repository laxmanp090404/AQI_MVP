import { useState, useEffect, useMemo } from "react";

import CitySelector from "../components/CitySelecter";
import PredictionCard from "../components/PredictionCard";
import Loader from "../components/Loader";
import AQITrendChart from "../components/AQITrendChart";

import {
  predictAQI,
  getHistory,
  getLatestPredictions
} from "../services/api";

export default function Dashboard() {

  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [cards, setCards] = useState([]);

  // Load latest predictions for cards
  const loadLatest = async () => {
    try {
      const res = await getLatestPredictions();
      setCards(res);
    } catch {
      setError("Could not load latest predictions.");
    }
  };

  useEffect(() => {
    loadLatest();
  }, []);

  // Load history for chart
  const loadHistory = async (city) => {
    try {
      const res = await getHistory(city);
      setHistory(res);
    } catch {
      setHistory([]);
    }
  };

  // Handle prediction button
  const handlePredict = async () => {

    if (!city) return;

    try {
      setLoading(true);
      setError("");

      const result = await predictAQI(city);
      setData(result);

      await loadHistory(city);
      await loadLatest();
    } catch {
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const avgAqi =
    cards.length > 0
      ? (cards.reduce((acc, card) => acc + card.aqi, 0) / cards.length).toFixed(1)
      : "-";

  const moderateOrAbove = cards.filter((card) => card.aqi >= 100).length;
  const cleanCities = cards.filter((card) => card.aqi < 50).length;

  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      const aTime = a?.predicted_for ? new Date(a.predicted_for).getTime() : 0;
      const bTime = b?.predicted_for ? new Date(b.predicted_for).getTime() : 0;
      return bTime - aTime;
    });
  }, [cards]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-slate-50 to-emerald-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl bg-slate-900 p-7 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-widest text-cyan-300">AQI Command Center</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Air Quality Dashboard</h1>
          <p className="mt-2 max-w-2xl text-slate-200">
            Forecast city-level AQI, monitor risk signals, and compare the latest PM2.5 trends.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Cities Tracked</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{cards.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Average AQI</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{avgAqi}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Moderate+ / Good Cities</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {moderateOrAbove} / {cleanCities}
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Run New Prediction</h2>
              <p className="text-sm text-slate-500">
                Choose a city and generate the latest AQI projection.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <CitySelector city={city} setCity={setCity} />
              <button
                className="rounded-lg bg-cyan-600 px-6 py-2 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handlePredict}
                disabled={loading || !city}
              >
                {loading ? "Predicting..." : "Predict AQI"}
              </button>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {loading && <Loader />}
          {!loading && data && (
            <div className="mt-6 max-w-sm">
              <PredictionCard data={data} />
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Latest AQI Predictions</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sortedCards.map((card) => (
              <PredictionCard key={card.city} data={card} />
            ))}
          </div>
        </section>

        {history.length > 0 && (
          <section className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">AQI Trend for {city}</h2>
              <p className="text-sm text-slate-500">Historical prediction trend from stored runs.</p>
            </div>
            <AQITrendChart data={history} />
          </section>
        )}
      </div>
    </div>
  );
}