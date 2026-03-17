CREATE TABLE IF NOT EXISTS sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    temperature_c REAL,
    humidity_pct REAL,
    soil_moisture_pct REAL
);

CREATE TABLE IF NOT EXISTS zone_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    zone_id TEXT NOT NULL,
    soil_moisture_pct REAL,
    light_pct REAL,
    health_score REAL,
    status TEXT
);

CREATE TABLE IF NOT EXISTS agent_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    image_path TEXT,
    explanation TEXT,
    recommendations TEXT
);

CREATE TABLE IF NOT EXISTS actuator_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    agent_run_id INTEGER,
    action TEXT,
    value REAL,
    applied INTEGER DEFAULT 0
);
