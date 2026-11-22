from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.itineraries.generator import ItineraryGenerator

router = APIRouter()
generator = ItineraryGenerator()


class ItineraryRequest(BaseModel):
    interests: List[str]
    days: int = 1
    mobility: str = "car"
    attraction_ids: List[str] = []
    season_month: Optional[int] = Field(None, ge=1, le=12, description="Travel month 1-12")
    lodging_id: Optional[str] = None


@router.get("/templates")
def get_itinerary_templates():
    """Get all itinerary templates."""
    import json
    from pathlib import Path
    data_file = Path("data/itineraries.json")
    with open(data_file, "r") as f:
        return json.load(f)


@router.post("/generate")
def generate_itinerary(request: ItineraryRequest):
    """Generate a personalized itinerary with seasonal, lodging, and
    mobility awareness."""
    return generator.generate(
        request.interests, request.days, request.mobility,
        request.attraction_ids, request.season_month, request.lodging_id
    )
