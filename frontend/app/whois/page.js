// "use client";
// import { useState } from "react";
// import Navbar from "../components/Navbar";
// import AlertBox from "../components/AlertBox";

// export default function WhoisPage() {
//   const [url, setUrl] = useState("");
//   const [data, setData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleLookup = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);
//     setData(null);

//     try {
//       const res = await fetch("http://localhost:5000/api/whois", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ url }),
//       });
//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.error || "Whois lookup failed");
//       }
//       const whoisData = await res.json();
//       setData(whoisData);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-950 text-white p-6">
//       <Navbar />
//       <h1 className="text-4xl font-bold text-center mb-6">Whois Lookup Tool</h1>
//       <p className="text-center text-gray-400 mb-8">
//         Get domain registration information.
//       </p>

//       <form onSubmit={handleLookup} className="w-full max-w-xl mx-auto">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             placeholder="e.g. google.com"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//           />
//           <button
//             type="submit"
//             className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
//             disabled={isLoading}
//           >
//             {isLoading ? "Looking up..." : "Lookup"}
//           </button>
//         </div>
//       </form>

//       {error && (
//         <div className="w-full max-w-xl mx-auto mt-4">
//           <AlertBox message={error} />
//         </div>
//       )}

//       {data && (
//         <div className="w-full max-w-xl mx-auto mt-8 bg-gray-800 p-6 rounded-lg font-mono text-sm">
//           <h2 className="text-xl font-bold text-blue-400 mb-4">
//             Results for: {data.domainName || url}
//           </h2>
//           <pre className="whitespace-pre-wrap wrap-break-words">
//             {/* The whois-json package returns a big JSON object. 
//                 We can just stringify it, or pull out keys.
//                 For simplicity, we'll just display the keys we know.
//             */}
//             <InfoRow label="Domain" value={data.domainName} />
//             <InfoRow label="Registrar" value={data.registrar} />
//             <InfoRow
//               label="Registration Date"
//               value={new Date(data.creationDate).toLocaleString()}
//             />
//             <InfoRow
//               label="Expiration Date"
//               value={new Date(data.registryExpiryDate).toLocaleString()}
//             />
//             <InfoRow label="Registrant" value={data.registrantOrganization} />
//             <InfoRow label="Country" value={data.registrantCountry} />
//             <InfoRow label="State" value={data.registrantState} />
//             <InfoRow
//               label="Name Servers"
//               value={data.nameServer?.join("\n")}
//             />
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// }

// function InfoRow({ label, value }) {
//   if (!value) return null;
//   return (
//     <div className="mb-3 border-b border-gray-700 pb-2">
//       <strong className="text-gray-400 block mb-1">{label}:</strong>
//       <span className="whitespace-pre-wrap">{value}</span>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import AlertBox from "../components/AlertBox";
import AddSiteForm from "../components/AddSiteForm"; // Using your original form

export default function WhoisPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("");

  const handleLookup = async (url) => {
    setError(null);
    setData(null);
    setCurrentUrl(url);
    try {
      const res = await fetch("http://localhost:5000/api/whois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Whois lookup failed");
      }
      const whoisData = await res.json();
      setData(whoisData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white p-6">
      <Navbar />
      <h1 className="text-4xl font-bold text-center mb-6">Whois Lookup Tool</h1>
      <p className="text-center text-gray-400 mb-8">
        Get domain registration information.
      </p>
      
      {/* We re-use your AddSiteForm here */}
      {/* It will use the database for history, just as you wanted */}
      <AddSiteForm onSelect={handleLookup} />

      {error && (
        <div className="w-full max-w-xl mx-auto mt-4">
          <AlertBox message={error} />
        </div>
      )}
      {data && (
        <div className="w-full max-w-4xl mx-auto mt-8 bg-gray-800 p-6 rounded-lg font-mono text-sm">
          <h2 className="text-xl font-bold text-blue-400 mb-4">
            Results for: {currentUrl}
          </h2>
          <pre className="whitespace-pre-wrap wrap-break-wordbreak-words">{data}</pre>
        </div>
      )}
    </div>
  );
}