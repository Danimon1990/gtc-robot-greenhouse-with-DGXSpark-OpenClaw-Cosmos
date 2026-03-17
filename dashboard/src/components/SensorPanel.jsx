import React from "react";

const MOCK = {
  temperatureC: 24.3,
  humidityPct: 65.0,
  outsideTempC: 18.7,
  outsideHumidityPct: 52.0,
  co2Ppm: 812,
  areas: {
    northWing: { temperatureC: 23.8, humidityPct: 63.0 },
    southWing: { temperatureC: 25.1, humidityPct: 67.0 },
    centerAisle: { temperatureC: 24.5, humidityPct: 64.5 },
  },
};

const s = {
  panel: {
    background: "#1a1f2e",
    borderRadius: 8,
    padding: "16px 20px",
    border: "1px solid #2d3748",
  },
  title: { fontSize: 13, color: "#718096", marginBottom: 14, letterSpacing: "0.05em" },
  section: { marginBottom: 14 },
  sectionLabel: {
    fontSize: 11,
    color: "#4a5568",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
    borderBottom: "1px solid #2d3748",
    paddingBottom: 4,
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 },
  metric: { display: "flex", flexDirection: "column", gap: 2 },
  label: { fontSize: 11, color: "#718096" },
  value: { fontSize: 20, fontWeight: 700, color: "#e2e8f0" },
  unit: { fontSize: 12, color: "#a0aec0", marginLeft: 2 },
  areaCard: {
    background: "#0f1117",
    borderRadius: 6,
    padding: "8px 10px",
    border: "1px solid #2d3748",
  },
  areaName: { fontSize: 11, color: "#718096", marginBottom: 4 },
  areaRow: { display: "flex", gap: 12 },
  areaVal: { fontSize: 14, fontWeight: 700, color: "#e2e8f0" },
  areaUnit: { fontSize: 11, color: "#718096" },
  badge: (ok) => ({
    display: "inline-block",
    fontSize: 10,
    padding: "1px 6px",
    borderRadius: 10,
    background: ok ? "#276749" : "#744210",
    color: ok ? "#9ae6b4" : "#fbd38d",
    marginLeft: 6,
  }),
};

function Metric({ label, value, unit }) {
  return (
    <div style={s.metric}>
      <span style={s.label}>{label}</span>
      <span style={s.value}>
        {value ?? "—"}<span style={s.unit}>{unit}</span>
      </span>
    </div>
  );
}

export default function SensorPanel({ data }) {
  const sensors = data?.sensors ?? MOCK;
  const ts = data?.timestamp;
  const areas = sensors.areas ?? MOCK.areas;

  const insideOk = sensors.temperatureC >= 18 && sensors.temperatureC <= 28;
  const humidOk = sensors.humidityPct >= 50 && sensors.humidityPct <= 75;

  return (
    <div style={s.panel}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={s.title}>ENVIRONMENT</span>
        {ts && <span style={{ fontSize: 10, color: "#4a5568" }}>{new Date(ts).toLocaleTimeString()}</span>}
      </div>

      {/* Inside vs Outside */}
      <div style={s.section}>
        <div style={s.sectionLabel}>Inside / Outside</div>
        <div style={s.grid2}>
          <Metric
            label={<>Inside Temp <span style={s.badge(insideOk)}>{insideOk ? "OK" : "WARN"}</span></>}
            value={sensors.temperatureC?.toFixed(1)}
            unit="°C"
          />
          <Metric label="Outside Temp" value={sensors.outsideTempC?.toFixed(1)} unit="°C" />
          <Metric
            label={<>Air Humidity <span style={s.badge(humidOk)}>{humidOk ? "OK" : "WARN"}</span></>}
            value={sensors.humidityPct?.toFixed(0)}
            unit="%"
          />
          <Metric label="Outside Humidity" value={sensors.outsideHumidityPct?.toFixed(0)} unit="%" />
        </div>
      </div>

      {/* CO2 */}
      <div style={s.section}>
        <div style={s.sectionLabel}>Air Quality</div>
        <div style={s.grid2}>
          <Metric label="CO₂" value={sensors.co2Ppm?.toFixed(0)} unit=" ppm" />
          <Metric label="Global Soil Moisture" value={sensors.soilMoisturePct?.toFixed(0)} unit="%" />
        </div>
      </div>

      {/* Area Temperatures */}
      <div style={s.section}>
        <div style={s.sectionLabel}>Zone Temperatures</div>
        <div style={s.grid3}>
          {Object.entries(areas).map(([name, vals]) => (
            <div key={name} style={s.areaCard}>
              <div style={s.areaName}>{name.replace(/([A-Z])/g, " $1").trim()}</div>
              <div style={s.areaRow}>
                <span style={s.areaVal}>{vals.temperatureC?.toFixed(1)}<span style={s.areaUnit}>°C</span></span>
                <span style={{ ...s.areaVal, color: "#63b3ed" }}>{vals.humidityPct?.toFixed(0)}<span style={s.areaUnit}>%</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
