"use client";
import React, { useState, useEffect, useRef } from "react";

export default function AddSiteForm({ onSelect }) {
  const [url, setUrl] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Fetch previously searched URLs
  const fetchSuggestions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/all-urls");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Failed to load previous URLs", err);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleOutside);
    return () => document.removeEventListener("click", handleOutside);
  }, []);

  // Start monitoring (add to DB if new + set active)
  const startMonitoring = async (selectedUrl) => {
    const cleaned = selectedUrl?.trim();
    if (!cleaned) return;

    try {
      // Save to history (idempotent)
      await fetch("http://localhost:5000/api/add-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleaned }),
      });

      // This prop is passed by the page to tell the backend
      // to start monitoring
      onSelect(cleaned);
      
      setUrl("");
      setOpen(false);
      fetchSuggestions(); // Refresh list
    } catch (err) {
      console.error("Failed to start monitoring", err);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    startMonitoring(url);
  };

  return (
    <div className="w-full max-w-2xl mx-auto" ref={wrapperRef}>
      <form onSubmit={onSubmit} className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter or select site (e.g. google.com)"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
              fetchSuggestions(); // Refresh on focus
            }}
            className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={open}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
          >
            Monitor
          </button>
        </div>

        {/* Dropdown — absolutely positioned, scrollable after ~7 items */}
        {open && suggestions.length > 0 && (
          <div
            role="listbox"
            className="absolute left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-md shadow-lg overflow-y-auto"
            style={{ maxHeight: "14rem" }} // ~7 items depending on padding/line-height
          >
            {suggestions
              .filter(s => s.toLowerCase().includes(url.toLowerCase()))
              .map((s, i) => (
              <div
                key={`${s}-${i}`}
                role="option"
                onClick={() => startMonitoring(s)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-900"
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}