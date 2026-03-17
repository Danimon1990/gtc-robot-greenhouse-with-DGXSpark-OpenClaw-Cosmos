import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

STATE_FILE = Path("sensor_state.json")


def _read_state() -> dict:
    if not STATE_FILE.exists():
        raise HTTPException(status_code=404, detail="sensor_state.json not found")
    return json.loads(STATE_FILE.read_text())


def _write_state(state: dict) -> None:
    state["timestamp"] = datetime.now(timezone.utc).isoformat()
    STATE_FILE.write_text(json.dumps(state, indent=2))


class FanCommand(BaseModel):
    power: float  # 0.0 – 1.0


class DoorCommand(BaseModel):
    open: bool


@router.post("/actuators/fan")
def set_fan(cmd: FanCommand) -> dict:
    power = max(0.0, min(1.0, cmd.power))
    state = _read_state()
    state["devices"]["fanPower"] = power
    _write_state(state)
    return {"fanPower": power}


@router.post("/actuators/door")
def set_door(cmd: DoorCommand) -> dict:
    state = _read_state()
    state["devices"]["doorOpen"] = cmd.open
    _write_state(state)
    return {"doorOpen": cmd.open}
