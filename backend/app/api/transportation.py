from fastapi import APIRouter, Query, HTTPException
import json
from pathlib import Path

router = APIRouter()


def _load():
    data_file = Path("data/transportation.json")
    with open(data_file, "r") as f:
        return json.load(f)


@router.get("/")
def get_transportation(
    scope: str = Query(None, description="local, regional, or intercity"),
    mode: str = Query(None),
    accessible: bool = Query(None, description="Filter to services with documented accessibility"),
    seasonal: bool = Query(None, description="true = only seasonal-limited; false = exclude seasonal-limited")
):
    """Get documented transportation services with optional filtering."""
    data = _load()
    services = data["services"]

    if scope:
        services = [s for s in services if s["scope"] == scope]
    if mode:
        services = [s for s in services if s["mode"] == mode]
    if accessible is not None:
        services = [s for s in services if bool(s.get("accessibility")) == accessible]
    if seasonal is not None:
        services = [s for s in services if bool(s.get("seasonal_limitations")) == seasonal]

    return {"services": services, "metadata": data.get("metadata")}


@router.get("/{service_id}")
def get_transportation_service(service_id: str):
    """Get a single transportation service by ID."""
    data = _load()
    for s in data["services"]:
        if s["id"] == service_id:
            return s
    raise HTTPException(status_code=404, detail=f"Service not found: {service_id}")
