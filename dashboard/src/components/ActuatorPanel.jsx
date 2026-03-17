import React, { useState } from "react";
import { setFan, setDoor } from "../api.js";

const styles = {
  panel: {
    background: "#1a1f2e",
    borderRadius: 8,
    padding: "16px 20px",
    border: "1px solid #2d3748",
  },
  title: { fontSize: 13, color: "#718096", marginBottom: 12, letterSpacing: "0.05em" },
  row: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  label: { fontSize: 13, color: "#a0aec0", width: 60 },
  btn: (active, color = "#48bb78") => ({
    padding: "6px 16px",
    borderRadius: 5,
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    background: active ? color : "#2d3748",
    color: active ? "#fff" : "#718096",
    transition: "all 0.15s",
  }),
  slider: { flex: 1, accentColor: "#48bb78" },
  value: { fontSize: 12, color: "#a0aec0", width: 36, textAlign: "right" },
};

export default function ActuatorPanel({ data, onUpdate }) {
  const devices = data?.devices || {};
  const [fanPower, setFanPower] = useState(devices.fanPower ?? 0);
  const [doorOpen, setDoorOpen] = useState(devices.doorOpen ?? false);
  const [loading, setLoading] = useState(false);

  const handleFan = async (power) => {
    setFanPower(power);
    setLoading(true);
    try {
      await setFan(power);
      onUpdate?.();
    } finally {
      setLoading(false);
    }
  };

  const handleDoor = async (open) => {
    setDoorOpen(open);
    setLoading(true);
    try {
      await setDoor(open);
      onUpdate?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.panel}>
      <div style={styles.title}>ACTUATORS</div>

      <div style={styles.row}>
        <span style={styles.label}>Fan</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={fanPower}
          style={styles.slider}
          onChange={(e) => setFanPower(parseFloat(e.target.value))}
          onMouseUp={(e) => handleFan(parseFloat(e.target.value))}
          onTouchEnd={(e) => handleFan(parseFloat(e.target.value))}
          disabled={loading}
        />
        <span style={styles.value}>{(fanPower * 100).toFixed(0)}%</span>
        <button style={styles.btn(fanPower === 0)} onClick={() => handleFan(0)} disabled={loading}>
          OFF
        </button>
        <button style={styles.btn(fanPower > 0)} onClick={() => handleFan(0.5)} disabled={loading}>
          ON
        </button>
      </div>

      <div style={styles.row}>
        <span style={styles.label}>Door</span>
        <button
          style={styles.btn(!doorOpen, "#63b3ed")}
          onClick={() => handleDoor(false)}
          disabled={loading}
        >
          CLOSED
        </button>
        <button
          style={styles.btn(doorOpen, "#63b3ed")}
          onClick={() => handleDoor(true)}
          disabled={loading}
        >
          OPEN
        </button>
      </div>
    </div>
  );
}
