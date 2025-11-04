"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ChartComponent({ data }) {
  if (!data || data.length === 0)
    return <p className="text-gray-400">No data yet. Wait a few seconds...</p>;

  const charts = [
    { key: "ping", color: "#00C49F", label: "Ping (ms)" },
    { key: "download", color: "#0088FE", label: "Download (Mbps)" },
    // { key: "upload", color: "#FFBB28", label: "Upload (Mbps)" }, // Removed as server monitor doesn't test this
    { key: "packetLoss", color: "#FF4444", label: "Packet Loss (%)" },
  ];

  return (
    // --- THIS IS THE CHANGE ---
    // It's now a column by default, but a row on medium (md) screens and up
    <div className="flex flex-col md:flex-row gap-8">
      {charts.map((chart) => (
        <div
          key={chart.key}
          // --- THIS IS THE CHANGE ---
          // It's full-width by default, but 1/3 width on medium screens
          className="w-full md:w-1/3 bg-gray-900 p-4 rounded-lg shadow-md border border-gray-700"
        >
          <h3 className="text-xl font-semibold mb-3 text-center text-blue-400">
            {chart.label}
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                stroke="#ccc"
              />
      
              <YAxis stroke="#ccc" domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                }}
                labelFormatter={(t) => new Date(t).toLocaleTimeString()}
              />
              <Line
                type="monotone"
                dataKey={chart.key}
                stroke={chart.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}