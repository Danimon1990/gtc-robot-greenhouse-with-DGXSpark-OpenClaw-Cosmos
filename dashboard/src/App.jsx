import React, { useState, useEffect, useCallback } from "react";
import { getSensors, runAgent } from "./api.js";
import SensorPanel from "./components/SensorPanel.jsx";
import ZoneGrid from "./components/ZoneGrid.jsx";
import ActuatorPanel from "./components/ActuatorPanel.jsx";
import VideoFeed from "./components/VideoFeed.jsx";
import AgentOutput from "./components/AgentOutput.jsx";

const styles = {
  root: { minHeight: "100vh", background: "#0f1117", color: "#e2e8f0" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    borderBottom: "1px solid #2d3748",
    background: "#1a1f2e",
  },
  headerTitle: { fontSize: 18, fontWeight: 700, letterSpacing: "0.02em" },
  headerBadge: {
    fontSize: 12,
    padding: "3px 10px",
    borderRadius: 20,
    background: "#276749",
    color: "#9ae6b4",
    fontWeight: 600,
  },
  headerRight: { fontSize: 12, color: "#718096" },
  main: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    padding: 20,
    maxWidth: 1200,
    margin: "0 auto",
  },
  left: { display: "flex", flexDirection: "column", gap: 16 },
  right: { display: "flex", flexDirection: "column", gap: 16 },
  fullWidth: { gridColumn: "1 / -1" },
  runBtn: (loading) => ({
    padding: "12px 0",
    borderRadius: 8,
    border: "none",
    background: loading ? "#276749" : "#38a169",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: loading ? "not-allowed" : "pointer",
    width: "100%",
    letterSpacing: "0.03em",
    transition: "background 0.2s",
  }),
};

export default function App() {
  const [sensorData, setSensorData] = useState(null);
  const [agentResult, setAgentResult] = useState(null);
  const [pendingFrame, setPendingFrame] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const fetchSensors = useCallback(() => {
    getSensors()
      .then(setSensorData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSensors();
    const id = setInterval(fetchSensors, 5000);
    return () => clearInterval(id);
  }, [fetchSensors]);

  const handleFrameReady = useCallback((blob) => {
    setPendingFrame(blob);
  }, []);

  const handleRunAgent = async () => {
    if (!pendingFrame) {
      setError("Capture or upload a frame first.");
      return;
    }
    setError(null);
    setRunning(true);
    try {
      const result = await runAgent(pendingFrame, true);
      setAgentResult(result);
      fetchSensors(); // refresh state after actuation
    } catch (e) {
      setError("Agent call failed: " + e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.headerTitle}>Greenhouse Agent</span>
        <span style={styles.headerBadge}>● LIVE</span>
        <span style={styles.headerRight}>GTC 2026 · Cosmos Reason 2</span>
      </header>

      <div style={styles.main}>
        <div style={styles.left}>
          <VideoFeed onFrameReady={handleFrameReady} />
          {pendingFrame && (
            <div style={{ fontSize: 12, color: "#48bb78" }}>
              ✓ Frame ready — click Run to analyze
            </div>
          )}
        </div>

        <div style={styles.right}>
          <SensorPanel data={sensorData} />
          <ActuatorPanel data={sensorData} onUpdate={fetchSensors} />
        </div>

        <div style={styles.fullWidth}>
          <ZoneGrid data={sensorData} />
        </div>

        <div style={styles.fullWidth}>
          <button style={styles.runBtn(running)} onClick={handleRunAgent} disabled={running}>
            {running ? "Running Cosmos Agent…" : "▶ Run Cosmos Agent"}
          </button>
          {error && (
            <div style={{ color: "#fc8181", fontSize: 12, marginTop: 6 }}>{error}</div>
          )}
        </div>

        <div style={styles.fullWidth}>
          <AgentOutput result={agentResult} />
        </div>
      </div>
    </div>
  );
}
