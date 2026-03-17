import React from "react";

const STATUS_COLOR = {
  ok: "#48bb78",
  dry: "#f6ad55",
  shaded: "#63b3ed",
  unknown: "#718096",
};

const styles = {
  panel: {
    background: "#1a1f2e",
    borderRadius: 8,
    padding: "16px 20px",
    border: "1px solid #2d3748",
  },
  title: { fontSize: 13, color: "#718096", marginBottom: 12, letterSpacing: "0.05em" },
  grid: { display: "flex", gap: 10, flexWrap: "wrap" },
  card: (status) => ({
    background: "#0f1117",
    border: `1px solid ${STATUS_COLOR[status] || STATUS_COLOR.unknown}`,
    borderRadius: 6,
    padding: "10px 14px",
    minWidth: 100,
    flex: "1 1 100px",
  }),
  zoneId: { fontSize: 16, fontWeight: 700, color: "#e2e8f0" },
  status: (status) => ({
    fontSize: 11,
    color: STATUS_COLOR[status] || STATUS_COLOR.unknown,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginTop: 2,
  }),
  metric: { fontSize: 11, color: "#718096", marginTop: 4 },
};

export default function ZoneGrid({ data }) {
  if (!data) return null;
  const zones = data.zones || [];
  return (
    <div style={styles.panel}>
      <div style={styles.title}>ZONES</div>
      <div style={styles.grid}>
        {zones.map((z) => (
          <div key={z.id} style={styles.card(z.status)}>
            <div style={styles.zoneId}>{z.id}</div>
            <div style={styles.status(z.status)}>● {z.status || "unknown"}</div>
            <div style={styles.metric}>Soil: {z.soilMoisturePct}%</div>
            <div style={styles.metric}>Light: {z.lightPct}%</div>
          </div>
        ))}
        {zones.length === 0 && (
          <div style={{ color: "#718096", fontSize: 13 }}>No zone data</div>
        )}
      </div>
    </div>
  );
}
