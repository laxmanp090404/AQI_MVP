import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import ExtensiveReport from "./pages/ExtensiveReport"

export default function App() {

  return (
    <BrowserRouter>

      <nav className="p-4 flex gap-6 bg-gray-100">

        <Link to="/">Dashboard</Link>

        <Link to="/map">Map</Link>
        <Link to="/extensive-report">
 Extensive Report
</Link>


      </nav>

      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/map" element={<MapPage />} />
        <Route path="/extensive-report" element={<ExtensiveReport/>} />

      </Routes>

    </BrowserRouter>
  );
}