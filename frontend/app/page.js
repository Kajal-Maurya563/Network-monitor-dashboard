"use client";
import { useState, useEffect, useRef } from "react";
import AddSiteForm from "./components/AddSiteForm";
import ChartComponent from "./components/ChartComponent";
import Navbar from "./components/Navbar";

export default function Home() {
  const [selectedSite, setSelectedSite] = useState(null);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);

  const fetchHistory = async (url) => {
    try {
      const res = await fetch(`http://localhost:5000/api/history/${url}`);
      const data = await res.json();
      setHistory(data);
    } catch {
      console.error("Failed to fetch history");
    }
  };

  // Stop monitoring
  const stopMonitoring = async () => {
    try {
      await fetch("http://localhost:5000/api/stop-monitoring", { method: "POST" });
      setSelectedSite(null);
      clearInterval(intervalRef.current);
      alert("🛑 Monitoring stopped.");
    } catch {
      alert("Failed to stop monitoring.");
    }
  };

  // Auto refresh every 10s
  useEffect(() => {
    if (!selectedSite) return;
    fetchHistory(selectedSite);

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchHistory(selectedSite), 10000);

    return () => clearInterval(intervalRef.current);
  }, [selectedSite]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6">
      <Navbar />

      <AddSiteForm onSelect={setSelectedSite} />

      {selectedSite ? (
        <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-blue-400">
              📊 Monitoring: {selectedSite}
            </h2>
            <button
              onClick={stopMonitoring}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Stop Monitoring
            </button>
          </div>
          <ChartComponent data={history} />
        </div>
      ) : (
        <p className="text-gray-400 text-center mt-10">
          Enter or select a site to start monitoring.
        </p>
      )}
    </div>
  );
}
