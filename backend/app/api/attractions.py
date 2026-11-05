from fastapi import APIRouter, Query
import json
from pathlib import Path

router = APIRouter()


@router.get("/")
def get_attractions(
    category: str = Query(None),
    tags: str = Query(None),
    area: str = Query(None)
):
    """Get all local attractions with optional filtering."""
    data_file = Path("data/attractions.json")
    with open(data_file, "r") as f:
        data = json.load(f)

    attractions = data["attractions"]

    if category:
        attractions = [a for a in attractions if a["category"] == category]
    if area:
        attractions = [a for a in attractions if area.lower() in a["area"].lower()]
    if tags:
        tag_list = tags.split(",")
        attractions = [a for a in attractions if any(t in a.get("tags", []) for t in tag_list)]

    return {"attractions": attractions}
