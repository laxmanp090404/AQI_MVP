import { useState } from "react";
import CitySelector from "../components/CitySelecter";
import PredictionCard from "../components/PredictionCard";
import Loader from "../components/Loader";
import { predictAQI } from "../services/api";

export default function Dashboard() {

  const [city, setCity] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {

    if (!city) return;

    setLoading(true);

    const result = await predictAQI(city);

    setData(result);

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-10">

      <CitySelector city={city} setCity={setCity} />

      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={handlePredict}
      >
        Predict AQI
      </button>

      {loading && <Loader />}

      {!loading && <PredictionCard data={data} />}

    </div>
  );
}