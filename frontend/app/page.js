"use client";
import { useState, useEffect } from "react";
import AddSiteForm from "./components/AddSiteForm";
import ChartComponent from "./components/ChartComponent";

export default function Home() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch all unique monitored sites
  const fetchSites = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/history");
      const data = await res.json();
      const uniqueSites = [...new Set(data.map((d) => d.url))];
      setSites(uniqueSites);
    } catch {
      console.error("Failed to load sites");
    }
  };

  // Fetch metric history for a specific URL
  const fetchHistory = async (url) => {
    try {
      const res = await fetch("http://localhost:5000/api/history");
      const data = await res.json();
      const filtered = data.filter((item) => item.url === url);
      setHistory(filtered.reverse()); // latest last
      setSelectedSite(url);
    } catch {
      console.error("Failed to fetch history");
    }
  };

  // Initial load
  useEffect(() => {
    fetchSites();
  }, []);

  // Auto-refresh selected site's graph every 10 seconds
  useEffect(() => {
    if (!selectedSite) return;
    const interval = setInterval(() => fetchHistory(selectedSite), 10000);
    return () => clearInterval(interval);
  }, [selectedSite]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900 text-white">
      {/* Left sidebar */}
      <div className="md:w-1/4 w-full border-r border-gray-700 p-6 bg-gray-800">
        <h1 className="text-2xl font-bold mb-4 text-center md:text-left">
          🌐 Network Monitor
        </h1>

        <AddSiteForm onAdd={fetchSites} />

        <div className="mt-4 space-y-2 overflow-y-auto max-h-[70vh]">
          {sites.length === 0 && (
            <p className="text-gray-400 text-center">No sites yet</p>
          )}
          {sites.map((url, i) => (
            <div
              key={`${url}-${i}`}
              onClick={() => fetchHistory(url)}
              className={`p-3 rounded-lg cursor-pointer transition text-sm ${
                selectedSite === url
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {url}
            </div>
          ))}
        </div>
      </div>

      {/* Right content area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedSite ? (
          <div className="bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">
              📊 {selectedSite} Metrics
            </h2>
            <ChartComponent data={history} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a site from the left to view details
          </div>
        )}
      </div>
    </div>
  );
}



// "use client";
// import { useState, useEffect } from "react";
// import AddSiteForm from "./components/AddSiteForm";
// import ChartComponent from "./components/ChartComponent";

// export default function Home() {
//   const [sites, setSites] = useState([]);
//   const [selectedSite, setSelectedSite] = useState(null);
//   const [history, setHistory] = useState([]);

//   // Fetch all unique monitored sites
//   const fetchSites = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/history");
//       const data = await res.json();
//       const uniqueSites = [...new Set(data.map((d) => d.url))];
//       setSites(uniqueSites);
//     } catch {
//       console.error("Failed to load sites");
//     }
//   };

//   // Fetch metric history for a specific URL
//   const fetchHistory = async (url) => {
//     try {
//       const res = await fetch("http://localhost:5000/api/history");
//       const data = await res.json();
//       const filtered = data.filter((item) => item.url === url);
//       setHistory(filtered.reverse()); // latest last
//       setSelectedSite(url);
//     } catch {
//       console.error("Failed to fetch history");
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     fetchSites();
//   }, []);

//   // Auto-refresh selected site's graph every 10 seconds
//   useEffect(() => {
//     if (!selectedSite) return;
//     const interval = setInterval(() => fetchHistory(selectedSite), 10000);
//     return () => clearInterval(interval);
//   }, [selectedSite]);

//   return (
//     <div className="p-6 min-h-screen bg-gray-900 text-white">
//       <h1 className="text-3xl font-bold mb-4 text-center">
//         🌐 Network Monitoring Dashboard
//       </h1>

//       <AddSiteForm onAdd={fetchSites} />

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//         {sites.length === 0 && (
//           <p className="text-gray-400">No sites are being monitored yet.</p>
//         )}
//         {sites.map((url, i) => (
//           <div
//             key={`${url}-${i}`}
//             className={`p-4 border rounded-xl cursor-pointer transition ${selectedSite === url
//                 ? "border-blue-500 bg-gray-800"
//                 : "border-gray-600 bg-gray-700 hover:bg-gray-800"
//               }`}
//             onClick={() => fetchHistory(url)}
//           >
//             <h2 className="text-lg font-semibold">{url}</h2>
//             <p className="text-gray-400 text-sm">Click to view performance graph</p>
//           </div>
//         ))}
//       </div>

//       {selectedSite && (
//         <div className="mt-10 bg-gray-800 p-6 rounded-xl shadow-md">
//           <h2 className="text-2xl font-bold mb-4 text-blue-400">
//             📊 {selectedSite} Metrics
//           </h2>
//           <ChartComponent data={history} />
//         </div>
//       )}
//     </div>
//   );
// }




