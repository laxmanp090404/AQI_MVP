import { useState, useEffect } from "react";

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
  const [history, setHistory] = useState([]);
  const [cards, setCards] = useState([]);

  // Load latest predictions for cards
  const loadLatest = async () => {
    const res = await getLatestPredictions();
    setCards(res);
  };

  useEffect(() => {
    loadLatest();
  }, []);

  // Load history for chart
  const loadHistory = async (city) => {
    const res = await getHistory(city);
    setHistory(res);
  };

  // Handle prediction button
  const handlePredict = async () => {

    if (!city) return;

    setLoading(true);

    const result = await predictAQI(city);

    setData(result);

    await loadHistory(city);

    await loadLatest(); // refresh cards

    setLoading(false);
  };

  return (
    <div className="p-10 space-y-10">

      {/* Prediction Section */}

      <div className="flex flex-col items-center gap-6">

        <CitySelector city={city} setCity={setCity} />

        <button
          className="bg-green-600 text-white px-6 py-2 rounded"
          onClick={handlePredict}
        >
          Predict AQI
        </button>

        {loading && <Loader />}

        {!loading && data && <PredictionCard data={data} />}

      </div>

      {/* Latest Predictions Cards */}

      <div>

        <h1 className="text-2xl font-bold mb-6">
          Latest AQI Predictions
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {cards.map(card => (
            <PredictionCard key={card.city} data={card} />
          ))}

        </div>

      </div>

      {/* Trend Chart */}

      {/* {history.length > 0 && (
        <div className="flex justify-center">

          <AQITrendChart data={history} />

        </div>
      )} */}

    </div>
  );
}