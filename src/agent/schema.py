"""
Schema types for Cosmos agent context and response.
"""

from typing import Any, Literal, TypedDict


class SensorSnapshot(TypedDict):
    temperatureC: float
    humidityPct: float
    soilMoisturePct: float


class DeviceSnapshot(TypedDict):
    fanPower: float
    doorOpen: bool


class ZoneSnapshot(TypedDict, total=False):
    id: str
    soilMoisturePct: float
    lightPct: float
    healthScore: float
    status: str


class AlertSnapshot(TypedDict, total=False):
    dryZones: list[str]
    shadedZones: list[str]


class ContextPayload(TypedDict, total=False):
    sensors: SensorSnapshot
    devices: DeviceSnapshot
    zones: list[ZoneSnapshot]
    alerts: AlertSnapshot


ActionType = Literal["set_fan", "set_door", "send_alert", "no_action"]


class Recommendation(TypedDict, total=False):
    action: ActionType
    value: float | bool | None
    why: str
    confidence: float


class CosmosResponsePayload(TypedDict, total=False):
    explanation: str
    recommendations: list[Recommendation]


def parse_response(raw: dict[str, Any]) -> CosmosResponsePayload:
    """Extract explanation and recommendations from raw API response."""
    out: CosmosResponsePayload = {}
    if "explanation" in raw and isinstance(raw["explanation"], str):
        out["explanation"] = raw["explanation"]
    if "recommendations" in raw and isinstance(raw["recommendations"], list):
        out["recommendations"] = []
        for r in raw["recommendations"]:
            if isinstance(r, dict):
                rec: Recommendation = {}
                if r.get("action") in ("set_fan", "set_door", "send_alert", "no_action"):
                    rec["action"] = r["action"]
                if "value" in r:
                    rec["value"] = r["value"]
                if isinstance(r.get("why"), str):
                    rec["why"] = r["why"]
                if isinstance(r.get("confidence"), (int, float)):
                    rec["confidence"] = float(r["confidence"])
                out["recommendations"].append(rec)
    return out
