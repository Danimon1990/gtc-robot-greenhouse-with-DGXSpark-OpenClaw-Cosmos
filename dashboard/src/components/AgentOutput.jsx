import React from "react";

const ACTION_COLOR = {
  set_fan: "#63b3ed",
  set_door: "#9f7aea",
  send_alert: "#f6ad55",
  no_action: "#718096",
};

const styles = {
  panel: {
    background: "#1a1f2e",
    borderRadius: 8,
    padding: "16px 20px",
    border: "1px solid #2d3748",
  },
  title: { fontSize: 13, color: "#718096", marginBottom: 12, letterSpacing: "0.05em" },
  explanation: {
    fontSize: 13,
    color: "#cbd5e0",
    lineHeight: 1.6,
    marginBottom: 16,
    padding: "10px 14px",
    background: "#0f1117",
    borderRadius: 6,
    borderLeft: "3px solid #48bb78",
  },
  recsTitle: { fontSize: 12, color: "#718096", marginBottom: 8 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    textAlign: "left",
    padding: "6px 8px",
    color: "#718096",
    borderBottom: "1px solid #2d3748",
  },
  td: { padding: "6px 8px", color: "#a0aec0", borderBottom: "1px solid #1a1f2e" },
  badge: (action) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    background: ACTION_COLOR[action] || "#718096",
    color: "#fff",
    fontWeight: 700,
    fontSize: 11,
  }),
  empty: { color: "#4a5568", fontSize: 13, fontStyle: "italic" },
};

export default function AgentOutput({ result }) {
  if (!result) {
    return (
      <div style={styles.panel}>
        <div style={styles.title}>COSMOS AGENT OUTPUT</div>
        <div style={styles.empty}>Run the agent to see results.</div>
      </div>
    );
  }

  const recs = result.recommendations || [];
  const ts = result.timestamp
    ? new Date(result.timestamp).toLocaleString()
    : null;

  return (
    <div style={styles.panel}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={styles.title}>COSMOS AGENT OUTPUT</span>
        {ts && <span style={{ fontSize: 11, color: "#4a5568" }}>{ts}</span>}
      </div>

      {result.explanation && (
        <div style={styles.explanation}>{result.explanation}</div>
      )}

      {recs.length > 0 && (
        <>
          <div style={styles.recsTitle}>RECOMMENDATIONS</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>Value</th>
                <th style={styles.th}>Confidence</th>
                <th style={styles.th}>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {recs.map((r, i) => (
                <tr key={i}>
                  <td style={styles.td}>
                    <span style={styles.badge(r.action)}>{r.action}</span>
                  </td>
                  <td style={styles.td}>
                    {r.value !== null && r.value !== undefined
                      ? typeof r.value === "boolean"
                        ? r.value ? "true" : "false"
                        : r.value
                      : "—"}
                  </td>
                  <td style={styles.td}>
                    {r.confidence !== undefined
                      ? `${(r.confidence * 100).toFixed(0)}%`
                      : "—"}
                  </td>
                  <td style={{ ...styles.td, color: "#718096" }}>{r.why || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
