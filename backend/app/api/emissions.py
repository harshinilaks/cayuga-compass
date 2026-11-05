from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.carbon.calculator import CarbonCalculator
import json
from pathlib import Path

router = APIRouter()
calculator = CarbonCalculator()


class FoodCategory(BaseModel):
    type: str
    spending_per_person_per_day: float


class TripInputs(BaseModel):
    arrival_mode: str
    one_way_distance_miles: float
    round_trip: bool
    vehicles: int
    party_size: int
    local_driving_miles: float
    local_vehicle_type: str
    transit_passenger_miles_per_person: float
    lodging_type: str
    nights: int
    rooms: int
    food_type: str
    food_spending_per_person_per_day: float
    food_categories: List[FoodCategory] = []
    days: int
    activities: List[dict]


class ScenarioComparison(BaseModel):
    baseline: TripInputs
    alternative: TripInputs


@router.get("/factors")
def get_emission_factors():
    """Get all emission factors with metadata."""
    factors_file = Path("data/emission_factors.json")
    with open(factors_file, "r") as f:
        data = json.load(f)
    return data


@router.post("/calculate")
def calculate_footprint(inputs: TripInputs):
    """Calculate carbon footprint for a trip."""
    try:
        result = calculator.calculate_trip_footprint(inputs.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/compare")
def compare_scenarios(comparison: ScenarioComparison):
    """Compare two trip scenarios and calculate savings."""
    try:
        baseline_result = calculator.calculate_trip_footprint(comparison.baseline.dict())
        alternative_result = calculator.calculate_trip_footprint(comparison.alternative.dict())

        savings = baseline_result["total"] - alternative_result["total"]
        percent_change = (
            (savings / baseline_result["total"] * 100) if baseline_result["total"] > 0 else 0
        )

        return {
            "baseline": baseline_result,
            "alternative": alternative_result,
            "savings_kg_co2e": savings,
            "percent_change": percent_change,
            "category_differences": {
                "arrival": baseline_result["arrival"] - alternative_result["arrival"],
                "local_mobility": baseline_result["local_mobility"] - alternative_result["local_mobility"],
                "lodging": baseline_result["lodging"] - alternative_result["lodging"],
                "food": baseline_result["food"] - alternative_result["food"],
                "activities": baseline_result["activities"] - alternative_result["activities"],
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
