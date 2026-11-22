from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List
import json
from pathlib import Path
from app.services.alternatives.matcher import AlternativesMatcher

router = APIRouter()
matcher = AlternativesMatcher()


class CompareRequest(BaseModel):
    baseline: dict


class RecommendRequest(BaseModel):
    lodging_id: str | None = None
    mobility: str = "car"
    season_month: int | None = None
    origin: str | None = None
    interests: List[str] = []


@router.get("/")
def get_alternatives(
    category: str = Query(None),
    persona: str = Query(None)
):
    """Get sustainable alternatives database."""
    data_file = Path("data/alternatives.json")
    with open(data_file, "r") as f:
        data = json.load(f)

    alternatives = data["alternatives"]

    if category:
        alternatives = [a for a in alternatives if a["category"] == category]
    if persona:
        alternatives = [a for a in alternatives if persona in a.get("applicable_personas", []) or "all" in a.get("applicable_personas", [])]

    return {"alternatives": alternatives}


@router.post("/generate")
def generate_alternatives(request: CompareRequest):
    """Generate feasible lower-carbon alternatives for a trip."""
    try:
        return matcher.generate_alternatives(request.baseline)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/recommend")
def recommend_alternatives(request: RecommendRequest):
    """Context-aware qualitative recommendations grounded in the local
    transportation, lodging, and attraction datasets."""
    try:
        return matcher.recommend(request.dict(exclude_none=True))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
