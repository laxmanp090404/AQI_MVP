import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import ExtensiveReport from "./pages/ExtensiveReport"

export default function App() {

  const navItemClass = ({ isActive }) =>
    [
      "rounded-full px-4 py-2 text-sm font-semibold transition",
      isActive
        ? "bg-cyan-500 text-white shadow-md"
        : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
    ].join(" ");

  return (
    <BrowserRouter>

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 shadow-lg" />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">AQI Platform</p>
              <h1 className="text-base font-bold text-slate-900 md:text-lg">Prediction Pipeline</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-100/70 p-1">
            <NavLink to="/" className={navItemClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/map" className={navItemClass}>
              Map View
            </NavLink>
            <NavLink to="/extensive-report" className={navItemClass}>
              Extensive Report
            </NavLink>
          </div>
        </nav>
      </header>

      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/map" element={<MapPage />} />
        <Route path="/extensive-report" element={<ExtensiveReport/>} />

      </Routes>

    </BrowserRouter>
  );
}