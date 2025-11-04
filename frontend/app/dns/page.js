"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import AlertBox from "../components/AlertBox";
import AddSiteForm from "../components/AddSiteForm"; // Using your original form

export default function DNSPage() {
  const [records, setRecords] = useState(null);
  const [error, setError] = useState(null);

  // AddSiteForm calls onSelect, so we'll rename our handler
  const handleLookup = async (url) => {
    setError(null);
    setRecords(null);
    try {
      const res = await fetch("http://localhost:5000/api/dns-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Lookup failed");
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white p-6">
      <Navbar />
      <h1 className="text-4xl font-bold text-center mb-6">DNS Lookup Tool</h1>
      <p className="text-center text-gray-400 mb-8">
        Enter a domain to resolve its DNS records.
      </p>
      
      {/* We re-use your AddSiteForm here, but onSelect just runs the lookup */}
      {/* It will use the database for history, just as you wanted */}
      <AddSiteForm onSelect={handleLookup} />

      {error && (
        <div className="w-full max-w-xl mx-auto mt-4">
          <AlertBox message={error} />
        </div>
      )}
      {records && (
        <div className="w-full max-w-xl mx-auto mt-8 bg-gray-800 p-6 rounded-lg">
          <DnsRecord title="A Records (IPv4)" records={records.a} />
          <DnsRecord title="AAAA Records (IPv6)" records={records.aaaa} />
          <DnsRecord title="CNAME Records" records={records.cname} />
          <DnsRecord title="MX Records (Mail)" records={records.mx} />
        </div>
      )}
    </div>
  );
}

function DnsRecord({ title, records }) {
  if (!records || records.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-blue-400 border-b border-gray-600 pb-1 mb-2">
        {title}
      </h3>
      <ul className="list-disc list-inside">
        {records.map((rec, i) => (
          <li key={i} className="font-mono">
            {typeof rec === "object" ? rec.exchange : rec}
          </li>
        ))}
      </ul>
    </div>
  );
}