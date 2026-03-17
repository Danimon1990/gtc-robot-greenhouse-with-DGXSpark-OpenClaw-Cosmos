"""
Main greenhouse agent: read sensors → vision reasoning → actuate → log.
"""

import base64
import json
from datetime import datetime, timezone
from pathlib import Path

from src.agent.cosmos_client import call_cosmos
from src.agent.schema import ContextPayload
from src.db import logger as db


def build_context(state: dict) -> ContextPayload:
    """Build Cosmos context payload from sensor state."""
    sensors = state.get("sensors", {})
    devices = state.get("devices", {})
    zones = state.get("zones", [])

    dry_zones = [z["id"] for z in zones if z.get("soilMoisturePct", 100) < 30]
    shaded_zones = [z["id"] for z in zones if z.get("lightPct", 100) < 40]

    return {
        "sensors": sensors,
        "devices": devices,
        "zones": zones,
        "alerts": {
            "dryZones": dry_zones,
            "shadedZones": shaded_zones,
        },
    }


def apply_recommendations(state: dict, recommendations: list[dict]) -> None:
    """Apply agent recommendations to the state dict in-place."""
    for rec in recommendations:
        action = rec.get("action")
        value = rec.get("value")
        if action == "set_fan" and value is not None:
            state["devices"]["fanPower"] = float(value)
        elif action == "set_door" and value is not None:
            state["devices"]["doorOpen"] = bool(value)


def run_agent(
    image_bytes: bytes,
    state_file: str = "sensor_state.json",
    actuate: bool = False,
) -> dict:
    """
    Run one Cosmos Reason 2 inference cycle.

    Args:
        image_bytes: Raw image bytes (JPEG or PNG).
        state_file: Path to sensor_state.json.
        actuate: If True, apply recommendations and write state back to disk.

    Returns:
        dict with 'explanation', 'recommendations', 'timestamp', 'run_id'.
    """
    state = json.loads(Path(state_file).read_text())
    context = build_context(state)

    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    result, _raw = call_cosmos(context, image_base64)

    # Ensure required keys exist
    result.setdefault("explanation", "No explanation returned.")
    result.setdefault("recommendations", [])

    timestamp = datetime.now(timezone.utc).isoformat()
    result["timestamp"] = timestamp

    # Persist to DB
    run_id = db.log_agent_run(result)
    result["run_id"] = run_id

    if actuate:
        apply_recommendations(state, result["recommendations"])
        state["timestamp"] = timestamp
        Path(state_file).write_text(json.dumps(state, indent=2))

        for rec in result["recommendations"]:
            action = rec.get("action", "")
            value = rec.get("value")
            if action in ("set_fan", "set_door"):
                db.log_actuator_command(run_id, action, value)

    return result
