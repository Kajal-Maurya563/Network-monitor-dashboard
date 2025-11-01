"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md rounded-lg mb-6">
      <h1 className="text-2xl font-bold text-blue-400">🌐 Network Monitor</h1>
      <div className="flex gap-6">
        <Link
          href="/"
          className="hover:text-blue-400 transition-colors duration-200"
        >
          Dashboard
        </Link>
        <Link
          href="/speedtest"
          className="hover:text-blue-400 transition-colors duration-200"
        >
          Speed Test
        </Link>
      </div>
    </nav>
  );
}
