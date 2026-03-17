import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException

from src.db import logger as db

router = APIRouter()

STATE_FILE = Path("sensor_state.json")


def _read_state() -> dict:
    if not STATE_FILE.exists():
        raise HTTPException(status_code=404, detail="sensor_state.json not found")
    return json.loads(STATE_FILE.read_text())


def _write_state(state: dict) -> None:
    state["timestamp"] = datetime.now(timezone.utc).isoformat()
    STATE_FILE.write_text(json.dumps(state, indent=2))


@router.get("/sensors")
def get_sensors() -> dict:
    return _read_state()


@router.post("/sensors")
def update_sensors(body: dict) -> dict:
    state = _read_state()
    if "sensors" in body:
        state["sensors"].update(body["sensors"])
    if "zones" in body:
        state["zones"] = body["zones"]
    _write_state(state)
    db.log_sensor(state)
    return state
