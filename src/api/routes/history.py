from fastapi import APIRouter, Query

from src.db import logger as db

router = APIRouter()


@router.get("/history/runs")
def get_recent_runs(limit: int = Query(10, ge=1, le=100)) -> list[dict]:
    return db.get_recent_runs(limit)


@router.get("/history/zones")
def get_zone_history(
    zone_id: str = Query(..., description="Zone ID, e.g. Z1 or B03-C"),
    hours: int = Query(24, ge=1, le=168),
) -> list[dict]:
    return db.get_zone_history(zone_id, hours)
