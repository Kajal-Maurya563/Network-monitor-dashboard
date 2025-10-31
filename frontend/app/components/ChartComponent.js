// "use client";
// import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

// export default function ChartComponent({ data }) {
//   const formatted = data.map((d, i) => ({
//     id: i + 1,
//     Ping: d.ping,
//     Download: d.download,
//     Upload: d.upload,
//   }));

//   return (
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={formatted}>
//         <XAxis dataKey="id" />
//         <YAxis />
//         <Tooltip />
//         <Legend />
//         <Line type="monotone" dataKey="Ping" stroke="#22d3ee" />
//         <Line type="monotone" dataKey="Download" stroke="#4ade80" />
//         <Line type="monotone" dataKey="Upload" stroke="#f97316" />
//       </LineChart>
//     </ResponsiveContainer>
//   );
// }

"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ChartComponent({ data }) {
  if (!data || data.length === 0)
    return <p className="text-gray-400">No data yet. Wait a few seconds...</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis
          dataKey="timestamp"
          tickFormatter={(t) => new Date(t).toLocaleTimeString()}
          stroke="#ccc"
        />
        <YAxis stroke="#ccc" />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="ping"
          stroke="#00C49F"
          dot={false}
          name="Ping (ms)"
        />
        <Line
          type="monotone"
          dataKey="download"
          stroke="#0088FE"
          dot={false}
          name="Download (Mbps)"
        />
        <Line
          type="monotone"
          dataKey="upload"
          stroke="#FFBB28"
          dot={false}
          name="Upload (Mbps)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

