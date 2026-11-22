from fastapi import APIRouter, Query, HTTPException
import json
from pathlib import Path

router = APIRouter()


def _load():
    data_file = Path("data/attractions.json")
    with open(data_file, "r") as f:
        return json.load(f)


@router.get("/")
def get_attractions(
    category: str = Query(None),
    group: str = Query(None, description="Research group, e.g. cornell_campus, waterfalls_parks"),
    tags: str = Query(None),
    area: str = Query(None),
    tcat_access: str = Query(None, description="year_round, summer_only, not_pinned_walkable, none_confirmed"),
    admission: str = Query(None, description="free, donation, suggested_donation, vehicle_fee, ticketed, pay_as_you_go, varies"),
    season: str = Query(None, description="Month number 1-12 or season name; filters out attractions documented as closed")
):
    """Get all local attractions with optional filtering."""
    data = _load()
    attractions = data["attractions"]

    if category:
        attractions = [a for a in attractions if a["category"] == category]
    if group:
        attractions = [a for a in attractions if a.get("group") == group]
    if area:
        attractions = [a for a in attractions if area.lower() in a["area"].lower()]
    if tags:
        tag_list = tags.split(",")
        attractions = [a for a in attractions if any(t in a.get("tags", []) for t in tag_list)]
    if tcat_access:
        attractions = [a for a in attractions if a.get("tcat_access", {}).get("status") == tcat_access]
    if admission:
        free_like = {"free", "donation", "suggested_donation"}
        attractions = [
            a for a in attractions
            if (a.get("admission") or {}).get("type") == admission
            or (admission == "free" and (a.get("admission") or {}).get("type") in free_like)
        ]
    if season:
        month = _parse_season(season)
        if month:
            attractions = [a for a in attractions if month not in a.get("closed_months", [])]
            attractions = [
                a for a in attractions
                if a.get("tcat_access", {}).get("status") != "summer_only" or month in (6, 7, 8)
            ]

    return {"attractions": attractions}


@router.get("/{attraction_id}")
def get_attraction(attraction_id: str):
    """Get a single attraction by ID."""
    data = _load()
    for a in data["attractions"]:
        if a["id"] == attraction_id:
            return a
    raise HTTPException(status_code=404, detail=f"Attraction not found: {attraction_id}")


def _parse_season(season: str):
    """Map a season name or month number to a month integer."""
    seasons = {
        "winter": 1, "spring": 4, "summer": 7, "fall": 10, "autumn": 10,
    }
    s = season.strip().lower()
    if s.isdigit():
        m = int(s)
        return m if 1 <= m <= 12 else None
    return seasons.get(s)
