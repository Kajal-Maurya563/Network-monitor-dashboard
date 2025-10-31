"use client";
import { useState, useEffect, useRef } from "react";
import AddSiteForm from "./components/AddSiteForm";
import ChartComponent from "./components/ChartComponent";

export default function Home() {
  const [selectedSite, setSelectedSite] = useState(null);
  const [history, setHistory] = useState([]);
  const intervalRef = useRef(null);

  // Fetch history for current site
  const fetchHistory = async (url) => {
    try {
      const res = await fetch(`http://localhost:5000/api/history/${url}`);
      const data = await res.json();
      setHistory(data);
    } catch {
      console.error("Failed to fetch history");
    }
  };

  // Auto-refresh every 10s
  useEffect(() => {
    if (!selectedSite) return;
    fetchHistory(selectedSite);

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchHistory(selectedSite), 10000);

    return () => clearInterval(intervalRef.current);
  }, [selectedSite]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🌐 Network Monitor</h1>

      <AddSiteForm onSelect={setSelectedSite} />

      {selectedSite ? (
        <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">
            📊 Monitoring: {selectedSite}
          </h2>
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





