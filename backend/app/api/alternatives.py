from fastapi import APIRouter, Query
import json
from pathlib import Path

router = APIRouter()


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
