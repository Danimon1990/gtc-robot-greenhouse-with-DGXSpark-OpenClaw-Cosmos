import React, { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "Which beds need watering right now?",
  "Is the temperature optimal for leafy greens?",
  "What was the last action taken by the agent?",
  "Are there any shaded zones?",
  "Should I open the door to reduce humidity?",
];

const MOCK_REPLIES = {
  "Which beds need watering right now?":
    "Beds 2 and 5 currently show soil moisture below 25% — both flagged as DRY. I recommend irrigating Bed 2 first (22%) then Bed 5 (19%).",
  "Is the temperature optimal for leafy greens?":
    "Yes. Inside temperature is 24.3°C, which is within the ideal range of 18–26°C for leafy greens. The south wing is slightly warmer at 25.1°C — monitor if it climbs further.",
  "What was the last action taken by the agent?":
    "The last Cosmos run detected dry zones in Bed 2 and Bed 5. The agent set fan power to 0.0 (humidity nominal) and sent an alert for manual irrigation check.",
  "Are there any shaded zones?":
    "Bed 3 is currently receiving only 35% light — below the 40% threshold. Check for physical obstructions or adjust the supplemental lighting schedule.",
  "Should I open the door to reduce humidity?":
    "Current inside humidity is 65% — within the acceptable 50–75% range. Opening the door is not necessary right now. If humidity rises above 78%, I'll recommend ventilation.",
};

function getReply(text) {
  const match = Object.keys(MOCK_REPLIES).find((k) =>
    text.toLowerCase().includes(k.toLowerCase().slice(0, 15))
  );
  return (
    match
      ? MOCK_REPLIES[match]
      : "I'm analyzing the current sensor data and greenhouse state. Based on the telemetry, all critical parameters are within normal range. Run the Cosmos agent with a camera frame for a full visual analysis."
  );
}

const s = {
  panel: {
    background: "#1a1f2e",
    borderRadius: 8,
    border: "1px solid #2d3748",
    display: "flex",
    flexDirection: "column",
    height: 380,
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid #2d3748",
    fontSize: 13,
    color: "#718096",
    letterSpacing: "0.05em",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#48bb78",
    display: "inline-block",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  msg: (role) => ({
    maxWidth: "80%",
    alignSelf: role === "user" ? "flex-end" : "flex-start",
    background: role === "user" ? "#2b6cb0" : "#2d3748",
    borderRadius: role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
    padding: "8px 12px",
    fontSize: 13,
    color: "#e2e8f0",
    lineHeight: 1.5,
  }),
  agentLabel: {
    fontSize: 10,
    color: "#48bb78",
    marginBottom: 2,
    fontWeight: 600,
    letterSpacing: "0.05em",
  },
  suggestions: {
    padding: "8px 16px",
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    borderTop: "1px solid #2d3748",
  },
  chip: {
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 12,
    border: "1px solid #4a5568",
    background: "transparent",
    color: "#a0aec0",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "10px 16px",
    borderTop: "1px solid #2d3748",
  },
  input: {
    flex: 1,
    background: "#0f1117",
    border: "1px solid #4a5568",
    borderRadius: 6,
    padding: "8px 12px",
    color: "#e2e8f0",
    fontSize: 13,
    outline: "none",
  },
  sendBtn: {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    background: "#38a169",
    color: "#fff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
};

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      text: "Hello! I'm the Greenhouse AI Agent powered by Cosmos Reason 2. Ask me about your crops, sensor readings, or let me analyze a camera feed.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text) => {
    const q = text.trim();
    if (!q) return;
    const userMsg = { role: "user", text: q };
    const agentMsg = { role: "agent", text: getReply(q) };
    setMessages((m) => [...m, userMsg, agentMsg]);
    setInput("");
  };

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <span style={s.dot} />
        GREENHOUSE AGENT CHAT
      </div>

      <div style={s.messages}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
            {m.role === "agent" && <div style={s.agentLabel}>COSMOS AGENT</div>}
            <div style={s.msg(m.role)}>{m.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={s.suggestions}>
        {SUGGESTIONS.slice(0, 3).map((q) => (
          <button key={q} style={s.chip} onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>

      <div style={s.inputRow}>
        <input
          style={s.input}
          placeholder="Ask about your greenhouse…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
        />
        <button style={s.sendBtn} onClick={() => send(input)}>Send</button>
      </div>
    </div>
  );
}
