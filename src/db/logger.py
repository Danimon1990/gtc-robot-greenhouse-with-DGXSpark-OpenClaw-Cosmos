"""
Database logger for greenhouse agent.
SQLite by default — swap get_connection() to change backend.
"""

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).parent / "greenhouse.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _ensure_tables() -> None:
    schema = (Path(__file__).parent / "schema.sql").read_text()
    with get_connection() as conn:
        conn.executescript(schema)


def log_sensor(snapshot: dict) -> None:
    sensors = snapshot.get("sensors", {})
    ts = snapshot.get("timestamp", datetime.now(timezone.utc).isoformat())
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO sensor_readings (timestamp, temperature_c, humidity_pct, soil_moisture_pct) VALUES (?, ?, ?, ?)",
            (ts, sensors.get("temperatureC"), sensors.get("humidityPct"), sensors.get("soilMoisturePct")),
        )
        for zone in snapshot.get("zones", []):
            conn.execute(
                "INSERT INTO zone_readings (timestamp, zone_id, soil_moisture_pct, light_pct, health_score, status) VALUES (?, ?, ?, ?, ?, ?)",
                (ts, zone.get("id"), zone.get("soilMoisturePct"), zone.get("lightPct"), zone.get("healthScore"), zone.get("status")),
            )
        conn.commit()


def log_agent_run(result: dict) -> int:
    ts = result.get("timestamp", datetime.now(timezone.utc).isoformat())
    recs_json = json.dumps(result.get("recommendations", []))
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO agent_runs (timestamp, explanation, recommendations) VALUES (?, ?, ?)",
            (ts, result.get("explanation", ""), recs_json),
        )
        conn.commit()
        return cur.lastrowid


def log_actuator_command(run_id: int, action: str, value: Any) -> None:
    ts = datetime.now(timezone.utc).isoformat()
    val = float(value) if isinstance(value, (int, float)) else (1.0 if value else 0.0)
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO actuator_commands (timestamp, agent_run_id, action, value, applied) VALUES (?, ?, ?, ?, 1)",
            (ts, run_id, action, val),
        )
        conn.commit()


def get_recent_runs(limit: int = 10) -> list[dict]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, timestamp, explanation, recommendations FROM agent_runs ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    result = []
    for row in rows:
        r = dict(row)
        try:
            r["recommendations"] = json.loads(r["recommendations"] or "[]")
        except (json.JSONDecodeError, TypeError):
            r["recommendations"] = []
        result.append(r)
    return result


def get_zone_history(zone_id: str, hours: int = 24) -> list[dict]:
    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT timestamp, zone_id, soil_moisture_pct, light_pct, health_score, status "
            "FROM zone_readings WHERE zone_id = ? AND timestamp >= ? ORDER BY timestamp",
            (zone_id, cutoff),
        ).fetchall()
    return [dict(row) for row in rows]


def get_latest_sensors() -> dict:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM sensor_readings ORDER BY id DESC LIMIT 1"
        ).fetchone()
    return dict(row) if row else {}


def get_dry_zones(threshold: float = 30.0) -> list[str]:
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT zone_id FROM zone_readings
            WHERE id IN (SELECT MAX(id) FROM zone_readings GROUP BY zone_id)
            AND soil_moisture_pct < ?
            """,
            (threshold,),
        ).fetchall()
    return [row["zone_id"] for row in rows]


# Auto-initialize tables on import
try:
    _ensure_tables()
except Exception:
    pass
