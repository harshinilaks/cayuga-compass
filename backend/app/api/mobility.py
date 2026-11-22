from fastapi import APIRouter, Query
import json
from pathlib import Path

router = APIRouter()


@router.get("/connections")
def get_mobility_connections(
    attraction_id: str = Query(None),
    lodging_id: str = Query(None),
    status: str = Query(None)
):
    """Get documented attraction/lodging to transportation connections."""
    data_file = Path("data/mobility_connections.json")
    with open(data_file, "r") as f:
        data = json.load(f)

    connections = data["connections"]

    if attraction_id:
        connections = [c for c in connections if c.get("attraction_id") == attraction_id]
    if lodging_id:
        connections = [c for c in connections if c.get("lodging_id") == lodging_id]
    if status:
        connections = [c for c in connections if c.get("status") == status]

    return {"connections": connections}
