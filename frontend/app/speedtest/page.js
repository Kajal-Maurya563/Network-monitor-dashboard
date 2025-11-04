"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";
import { ArrowDown, ArrowUp, Wifi } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Label,
  ResponsiveContainer
} from "recharts";

let socket;
const PING_COUNT_FOR_TEST = 10;
const DOWNLOAD_FILE_URL = "https://speed.cloudflare.com/__down";
const DOWNLOAD_FILE_SIZE_MB = 25;
const DOWNLOAD_FILE_SIZE_BYTES = DOWNLOAD_FILE_SIZE_MB * 1024 * 1024;
const UPLOAD_FILE_SIZE_MB = 10;
const UPLOAD_ENDPOINT = "http://localhost:5000/api/upload-test";

// --- Config for Donut Charts ---
const PING_MAX = 150; // 150ms will be the 'full' gauge
const DOWNLOAD_MAX = 200; // 200 Mbps will be the 'full' gauge
const UPLOAD_MAX = 100; // 100 Mbps will be the 'full' gauge

export default function SpeedTestPage() {
  // State for the test
  const [testState, setTestState] = useState("idle"); // idle, ping, download, upload, monitoring, done
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [download, setDownload] = useState(0);
  const [upload, setUpload] = useState(0);
  
  const pingTimes = useRef([]);
  const livePingIntervalRef = useRef(null);
  const testStateRef = useRef(testState); // Ref to hold current state for listeners

  // Keep ref in sync with state
  useEffect(() => {
    testStateRef.current = testState;
  }, [testState]);

  // This useEffect now runs ONLY ONCE on mount
  useEffect(() => {
    socket = io("http://localhost:5000");
    socket.on("connect", () => console.log("Socket connected"));
    socket.on("connect_error", () => console.error("Socket connection error"));

    // This listener stays active for the component's lifetime
    socket.on("server-pong", (startTime) => {
      const latency = Date.now() - startTime;
      const currentState = testStateRef.current; // Read from the ref

      if (currentState === "ping") {
        pingTimes.current.push(latency);
        const sum = pingTimes.current.reduce((a, b) => a + b, 0);
        const avgPing = sum / pingTimes.current.length;
        setPing(avgPing); // Update ping chart live
      } else if (currentState === "monitoring") {
        setPing(latency); // Update ping chart live
      }
    });

    return () => {
      if (socket) socket.disconnect();
      if (livePingIntervalRef.current) clearInterval(livePingIntervalRef.current);
    };
  }, []); // <-- EMPTY DEPENDENCY ARRAY. This is the fix.

  // --- Logic for the Full Test ---

  // Stage 1: Run the 10-packet Ping/Jitter test
  const runPingTest = () => {
    return new Promise((resolve) => {
      setTestState("ping");
      pingTimes.current = [];
      let pingsSent = 0;
      const interval = setInterval(() => {
        if (pingsSent >= PING_COUNT_FOR_TEST) {
          clearInterval(interval);
          
          const sum = pingTimes.current.reduce((a, b) => a + b, 0);
          const avgPing = sum / pingTimes.current.length;
          setPing(avgPing || 0);

          if (pingTimes.current.length > 1) {
            let sumOfSquares = 0;
            for (let i = 0; i < pingTimes.current.length - 1; i++) {
              sumOfSquares += Math.pow(
                pingTimes.current[i + 1] - pingTimes.current[i],
                2
              );
            }
            const avgJitter = Math.sqrt(
              sumOfSquares / (pingTimes.current.length - 1)
            );
            setJitter(avgJitter);
          } else {
            setJitter(0);
          }
          resolve();
          return;
        }
        if (socket) socket.emit("client-ping", Date.now());
        pingsSent++;
      }, 500);
    });
  };

  // Stage 2: Run Download Test (with LIVE updates)
  const runDownloadTest = async () => {
    setTestState("download");
    const url = `${DOWNLOAD_FILE_URL}?bytes=${DOWNLOAD_FILE_SIZE_BYTES}&_=${new Date().getTime()}`;
    
    const response = await fetch(url);
    const reader = response.body.getReader();
    let receivedLength = 0;
    const startTime = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedLength += value.length;
      const durationInSeconds = (Date.now() - startTime) / 1000;
      if (durationInSeconds === 0) continue; // Avoid divide by zero
      
      const bitsLoaded = receivedLength * 8;
      const mbps = (bitsLoaded / durationInSeconds / 1024 / 1024);
      
      setDownload(mbps); // <-- THIS UPDATES THE DONUT CHART LIVE
    }

    // Final calculation for accuracy
    const durationInSeconds = (Date.now() - startTime) / 1000;
    const mbps = (DOWNLOAD_FILE_SIZE_BYTES * 8) / durationInSeconds / 1024 / 1024;
    setDownload(mbps);
  };

  // Stage 3: Run Upload Test (with LIVE updates)
  const runUploadTest = () => {
    return new Promise((resolve, reject) => {
      setTestState("upload");
      
      const dataSize = UPLOAD_FILE_SIZE_MB * 1024 * 1024;
      const buffer = new Uint8Array(dataSize);
      for (let i = 0; i < dataSize; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      
      const xhr = new XMLHttpRequest();
      xhr.open("POST", UPLOAD_ENDPOINT, true);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      const startTime = Date.now();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const bytesSent = event.loaded;
          const durationInSeconds = (Date.now() - startTime) / 1000;
          if (durationInSeconds === 0) return;
          
          const bitsLoaded = bytesSent * 8;
          const mbps = (bitsLoaded / durationInSeconds / 1024 / 1024);
          
          setUpload(mbps); // <-- THIS UPDATES THE DONUT CHART LIVE
        }
      };
      
      xhr.onload = () => {
        const durationInSeconds = (Date.now() - startTime) / 1000;
        const mbps = (dataSize * 8) / durationInSeconds / 1024 / 1024;
        setUpload(mbps);
        resolve();
      };
      
      xhr.onerror = () => {
        reject(new Error("Upload failed"));
      };

      xhr.send(buffer);
    });
  };

  // Stage 4: Start Live Monitoring
  const startLiveMonitoring = () => {
    setTestState("monitoring");
    livePingIntervalRef.current = setInterval(() => {
      if (socket) socket.emit("client-ping", Date.now());
    }, 2000); // Send a live ping every 2 seconds
  };
  
  // Stop the live monitoring
  const stopTest = () => {
    if (livePingIntervalRef.current) {
      clearInterval(livePingIntervalRef.current);
      livePingIntervalRef.current = null;
    }
    setTestState("done");
  }

  // Main function to run the test
  const startFullTest = async () => {
    setTestState("idle");
    setPing(0);
    setJitter(0);
    setDownload(0);
    setUpload(0);
    
    await runPingTest();
    await runDownloadTest();
    await runUploadTest();
    
    startLiveMonitoring();
  };

  const getButtonText = () => {
    switch (testState) {
      case "ping": return "Testing Ping...";
      case "download": return "Testing Download...";
      case "upload": return "Testing Upload...";
      case "monitoring": return "Stop Test";
      case "done": return "Run Test Again";
      default: return "Start Test";
    }
  };
  
  const handleButtonClick = () => {
    if (testState === 'idle' || testState === 'done') {
      startFullTest();
    } else if (testState === 'monitoring') {
      stopTest();
    }
  }
  
  const isButtonDisabled = () => {
    return testState === 'ping' || testState === 'download' || testState === 'upload';
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white p-6">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-10">
          Client Speed Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
          <DonutChartBox
            icon={<Wifi />}
            title="Ping"
            value={ping}
            unit="ms"
            max={PING_MAX}
            color="#00C49F"
            testState={testState}
          />
          <DonutChartBox
            icon={<ArrowDown />}
            title="Download"
            value={download}
            unit="Mbps"
            max={DOWNLOAD_MAX}
            color="#0088FE"
            testState={testState}
          />
          <DonutChartBox
            icon={<ArrowUp />}
            title="Upload"
            value={upload}
            unit="Mbps"
            max={UPLOAD_MAX}
            color="#FFBB28"
            testState={testState}
          />
        </div>
        
        {jitter > 0 && (
          <p className="text-lg text-gray-400 mb-10">
            Jitter: <span className="text-blue-400">{jitter.toFixed(2)} ms</span>
            <span className="ml-4">(Ping Stability)</span>
          </p>
        )}
        
        <div className="flex gap-4">
          <button
            onClick={handleButtonClick}
            disabled={isButtonDisabled()}
            className={`px-10 py-5 text-white rounded-xl text-xl font-semibold transition ${
              isButtonDisabled()
                ? "bg-gray-600 cursor-not-allowed"
                : testState === 'monitoring'
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Donut Chart Component ---
function DonutChartBox({ icon, title, value, unit, max, color, testState }) {
  const displayValue = value.toFixed(unit === "ms" ? 0 : 2);
  const data = [
    { name: "value", value: Math.min(value, max) }, 
    { name: "remaining", value: Math.max(0, max - value) },
  ];
  const colors = [color, "#374151"]; 

  return (
    <div className="bg-gray-800 p-6 rounded-lg flex flex-col items-center shadow-lg border border-gray-700">
      <div className="flex items-center text-gray-400 mb-4">
        {icon}
        <span className="ml-2 text-xl">{title}</span>
      </div>
      <div style={{ width: "100%", height: 120 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              stroke="none"
              // THIS IS THE FIX: Only animate when the test is idle or done.
              isAnimationActive={testState === 'idle' || testState === 'done'}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index]} />
              ))}
              <Label
                value={displayValue}
                position="center"
                dy={-5}
                fill={color}
                className="text-3xl font-bold"
              />
              <Label
                value={unit}
                position="center"
                dy={20}
                fill="#9ca3af" // gray-400
                className="text-sm"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}