from fastapi import APIRouter
import json
from pathlib import Path

router = APIRouter()


@router.get("/")
def get_personas():
    """Get all visitor personas."""
    personas_file = Path("data/visitor_personas.json")
    with open(personas_file, "r") as f:
        data = json.load(f)
    return data
