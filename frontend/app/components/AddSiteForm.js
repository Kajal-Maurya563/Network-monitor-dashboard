"use client";
import { useState } from "react";

export default function AddSiteForm({ onAdd }) {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return alert("Please enter a valid URL");

    try {
      const res = await fetch("http://localhost:5000/api/add-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setUrl("");
        onAdd(); // refresh list
      } else {
        alert(data.error || "Error adding URL");
      }
    } catch (error) {
      alert("Server not reachable");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-6 mb-6">
      <input
        type="text"
        placeholder="Enter site to monitor (e.g. youtube.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border border-gray-400 rounded-lg px-3 py-2 w-full"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Add
      </button>
    </form>
  );
}
