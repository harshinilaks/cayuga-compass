from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()


class ItineraryRequest(BaseModel):
    interests: List[str]
    days: int
    mobility_preference: str


@router.get("/templates")
def get_itinerary_templates():
    """Get itinerary templates."""
    # TODO: Implement itinerary templates
    return {"templates": []}


@router.post("/generate")
def generate_itinerary(request: ItineraryRequest):
    """Generate a personalized itinerary."""
    # TODO: Implement itinerary generation
    return {"itinerary": {}}
