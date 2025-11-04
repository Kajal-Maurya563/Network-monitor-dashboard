"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Network Monitor" },
    { href: "/speedtest", label: "Speed Test" },
    { href: "/dns", label: "DNS Lookup" },
    { href: "/whois", label: "Whois Lookup" },
  ];

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md rounded-lg mb-6">
      <h1 className="text-2xl font-bold text-blue-400">🌐 Network Monitor</h1>
      <div className="flex gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${
              pathname === link.href ? "text-blue-400" : "hover:text-blue-400"
            } transition-colors duration-200`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}