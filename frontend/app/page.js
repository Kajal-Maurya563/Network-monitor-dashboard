"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import AddSiteForm from "./components/AddSiteForm";
import ChartComponent from "./components/ChartComponent";
import Navbar from "./components/Navbar";
import AlertBox from "./components/AlertBox";

let socket;

export default function Home() {
  const [selectedSite, setSelectedSite] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Socket connected");
      setError(null);
    });

    socket.on("connect_error", () => {
      setError("Failed to connect to real-time server. Is backend running?");
    });

    // Listen for new monitor stats from the server
    socket.on("new-monitor-stat", (stat) => {
      // Check if the stat is for the site we are currently watching
      if (stat.url === selectedSite) {
        setHistory((prevHistory) => {
          const updatedHistory = [...prevHistory, stat];
          return updatedHistory.slice(-20); // Keep last 20 points
        });
      }
    });
    
    // Listen for confirmation that monitoring has stopped
    socket.on("monitoring-stopped", () => {
      setSelectedSite(null);
      setHistory([]);
    });

    // Cleanup on component unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, [selectedSite]); // Re-run if selectedSite changes

  // Fetch initial history when site is selected
  const fetchHistory = async (url) => {
    try {
      const res = await fetch(`http://localhost:5000/api/history/${url}`);
      const data = await res.json();
      setHistory(data);
    } catch {
      console.error("Failed to fetch history");
      setError("Failed to fetch initial history.");
    }
  };

  const handleSelectSite = (url) => {
    setHistory([]); // Clear old history
    setSelectedSite(url);
    fetchHistory(url); // Fetch initial data
    if (socket) socket.emit("set-active-url", url); // Tell backend to start monitoring
  };

  // Stop monitoring
  const stopMonitoring = () => {
    if (socket) socket.emit("stop-monitoring");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white p-6">
      <Navbar />

      {error && (
        <div className="mb-4 max-w-2xl mx-auto">
          <AlertBox message={error} />
        </div>
      )}

      {/* This is your original form component */}
      <AddSiteForm onSelect={handleSelectSite} />

      {selectedSite ? (
        <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-md max-w-4xl mx-auto w-full">
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
          {/* This is your original 4-chart component */}
          <ChartComponent data={history} />
        </div>
      ) : (
        <p className="text-gray-400 text-center mt-10">
          Enter or select a site to start live monitoring.
        </p>
      )}
    </div>
  );
}