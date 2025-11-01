

//     const testSpeed = async () => {
//         try {
//             const res = await fetch("http://localhost:5000/api/speed-test");
//             const data = await res.json();
//             if (!res.ok) throw new Error("Speed test failed");

//             const mbps = parseFloat(data.speed);
//             setSpeed(Number(mbps.toFixed(2)));

//             const capped = Math.min(mbps, 100);
//             setData([
//                 { name: "Speed", value: capped },
//                 { name: "Remaining", value: 100 - capped },
//             ]);
//         } catch (err) {
//             console.error("Speed test failed:", err);
//             setStatus("Error");
//         }
//     };


//     const startLiveTest = () => {
//         setStatus("Testing...");
//         if (intervalRef.current) clearInterval(intervalRef.current);
//         testSpeed();
//         intervalRef.current = setInterval(testSpeed, 5000);
//     };

//     const stopLiveTest = () => {
//         setStatus("Stopped");
//         clearInterval(intervalRef.current);
//     };

//     useEffect(() => {
//         return () => clearInterval(intervalRef.current);
//     }, []);

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <Navbar />

//             <div className="flex flex-col items-center justify-center mt-16">
//                 <h1 className="text-3xl font-bold mb-6 text-gray-800">
//                     Real-Time Internet Speed Test
//                 </h1>

//                 <div className="flex gap-4 mb-6">
//                     <button
//                         onClick={startLiveTest}
//                         className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
//                     >
//                         Start Test
//                     </button>
//                     <button
//                         onClick={stopLiveTest}
//                         className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
//                     >
//                         Stop Test
//                     </button>
//                 </div>

//                 <p className="text-lg text-gray-700 mb-2">Status: {status}</p>

//                 <PieChart width={280} height={280} key={speed}>
//                     <Pie
//                         data={data}
//                         cx="50%"
//                         cy="50%"
//                         labelLine={false}
//                         outerRadius={120}
//                         fill="#8884d8"
//                         dataKey="value"
//                         isAnimationActive={true}
//                         animationDuration={800}
//                         animationEasing="ease-in-out"
//                     >
//                         {data.map((entry, index) => (
//                             <Cell
//                                 key={`cell-${index}`}
//                                 fill={COLORS[index % COLORS.length]}
//                             />
//                         ))}
//                     </Pie>
//                     <Tooltip />
//                     <Legend />
//                 </PieChart>

//                 <p className="mt-4 text-2xl font-semibold text-green-600">
//                     Download Speed: {speed.toFixed(2)} Mbps
//                 </p>
//             </div>
//         </div>
//     );
// }


"use client";
import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function SpeedTestPage() {
    const [speed, setSpeed] = useState(0);
    const [isTesting, setIsTesting] = useState(false);
    const intervalRef = useRef(null);

    const COLORS = ["#00C49F", "#FF8042"];

    const fetchSpeed = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/speed-test");
            const data = await res.json();
            if (data.speed) setSpeed(parseFloat(data.speed));
        } catch (err) {
            console.error("Speed test failed:", err.message);
        }
    };

    const startTest = () => {
        if (isTesting) return;
        setIsTesting(true);
        fetchSpeed(); // run once immediately
        intervalRef.current = setInterval(fetchSpeed, 5000); // every 5 sec
    };

    const stopTest = () => {
        setIsTesting(false);
        clearInterval(intervalRef.current);
    };

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    const data = [
        { name: "Speed", value: speed },
        { name: "Idle", value: 100 - Math.min(speed, 100) },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
            <nav className="absolute top-0 left-0 w-full bg-gray-900 p-4 text-center shadow-lg">
                <a href="/" className="text-xl font-semibold hover:text-blue-400">
                    ← Back to Dashboard
                </a>
            </nav>

            <h1 className="text-4xl font-bold mb-8 mt-20">Real-Time Internet Speed Test</h1>

            <PieChart width={300} height={300}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(2)} Mbps`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>

            <p className="mt-6 text-2xl">
                Current Speed: <span className="text-blue-400">{speed.toFixed(2)} Mbps</span>
            </p>

            <div className="mt-8 space-x-4">
                {!isTesting ? (
                    <button
                        onClick={startTest}
                        className="px-6 py-3 bg-green-600 rounded-xl hover:bg-green-700"
                    >
                        Start Testing
                    </button>
                ) : (
                    <button
                        onClick={stopTest}
                        className="px-6 py-3 bg-red-600 rounded-xl hover:bg-red-700"
                    >
                        Stop Testing
                    </button>
                )}
            </div>
        </div>
    );
}
