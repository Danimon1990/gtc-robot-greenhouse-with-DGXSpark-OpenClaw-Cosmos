import React from "react";

const styles = {
  panel: {
    background: "#1a1f2e",
    borderRadius: 8,
    padding: "16px 20px",
    border: "1px solid #2d3748",
  },
  title: { fontSize: 13, color: "#718096", marginBottom: 12, letterSpacing: "0.05em" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  metric: { display: "flex", flexDirection: "column", gap: 2 },
  label: { fontSize: 11, color: "#718096" },
  value: { fontSize: 22, fontWeight: 700, color: "#e2e8f0" },
  unit: { fontSize: 13, color: "#a0aec0", marginLeft: 2 },
};

export default function SensorPanel({ data }) {
  if (!data) return <div style={styles.panel}>Loading sensors…</div>;
  const s = data.sensors || {};
  return (
    <div style={styles.panel}>
      <div style={styles.title}>SENSORS</div>
      <div style={styles.grid}>
        <div style={styles.metric}>
          <span style={styles.label}>Temperature</span>
          <span style={styles.value}>
            {s.temperatureC?.toFixed(1) ?? "—"}<span style={styles.unit}>°C</span>
          </span>
        </div>
        <div style={styles.metric}>
          <span style={styles.label}>Humidity</span>
          <span style={styles.value}>
            {s.humidityPct?.toFixed(0) ?? "—"}<span style={styles.unit}>%</span>
          </span>
        </div>
        <div style={styles.metric}>
          <span style={styles.label}>Soil Moisture</span>
          <span style={styles.value}>
            {s.soilMoisturePct?.toFixed(0) ?? "—"}<span style={styles.unit}>%</span>
          </span>
        </div>
        <div style={styles.metric}>
          <span style={styles.label}>Updated</span>
          <span style={{ ...styles.value, fontSize: 11, color: "#718096", paddingTop: 4 }}>
            {data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
