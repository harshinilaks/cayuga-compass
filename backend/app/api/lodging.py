from fastapi import APIRouter, Query, HTTPException
import json
from pathlib import Path

router = APIRouter()


def _load():
    data_file = Path("data/lodging.json")
    with open(data_file, "r") as f:
        return json.load(f)


@router.get("/")
def get_lodging(
    accommodation_type: str = Query(None),
    area: str = Query(None),
    car_free_feasible: bool = Query(None),
    sustainability_practices: bool = Query(None)
):
    """Get researched lodging properties with optional filtering."""
    data = _load()
    properties = data["properties"]

    if accommodation_type:
        properties = [p for p in properties if p["accommodation_type"] == accommodation_type]
    if area:
        properties = [p for p in properties if area.lower() in p["area"].lower()]
    if car_free_feasible is not None:
        properties = [p for p in properties if p.get("car_free_feasible") == car_free_feasible]
    if sustainability_practices:
        properties = [p for p in properties if p.get("sustainability_practices")]

    return {"properties": properties, "metadata": data.get("metadata")}


@router.get("/{property_id}")
def get_lodging_property(property_id: str):
    """Get a single lodging property by ID."""
    data = _load()
    for p in data["properties"]:
        if p["id"] == property_id:
            return p
    raise HTTPException(status_code=404, detail=f"Property not found: {property_id}")
