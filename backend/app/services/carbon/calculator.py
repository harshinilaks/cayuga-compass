from typing import Dict, List, Optional
import json
from pathlib import Path


class CarbonCalculator:
    def __init__(self, factors_file: str = "data/emission_factors.json"):
        self.factors_file = Path(factors_file)
        self.factors = self._load_factors()
        self.settings = self.factors.get("settings", {})

    def _load_factors(self) -> Dict:
        with open(self.factors_file, "r") as f:
            return json.load(f)

    def get_factor(self, factor_id: str) -> Optional[Dict]:
        for factor in self.factors["factors"]:
            if factor["id"] == factor_id:
                return factor
        return None

    def calculate_trip_footprint(self, inputs: Dict) -> Dict:
        """
        Calculate carbon footprint for a trip based on inputs.

        Inputs should include:
        - arrival_mode: str (factor ID)
        - one_way_distance_miles: float
        - round_trip: bool
        - vehicles: int (for vehicle-mile modes)
        - party_size: int
        - local_driving_miles: float
        - local_vehicle_type: str (factor ID)
        - transit_passenger_miles_per_person: float
        - lodging_type: str (factor ID)
        - nights: int
        - rooms: int
        - food_type: str (factor ID)
        - food_spending_per_person_per_day: float
        - days: int
        - activities: List[Dict] with 'category' (factor ID) and 'spending_whole_party'
        """
        results = {
            "arrival": 0.0,
            "local_mobility": 0.0,
            "lodging": 0.0,
            "food": 0.0,
            "activities": 0.0,
            "total": 0.0,
            "per_person": 0.0,
            "per_person_per_day": 0.0,
            "missing_factors": [],
            "unverified_factors": []
        }

        # Arrival travel
        arrival_factor = self.get_factor(inputs.get("arrival_mode"))
        if arrival_factor:
            if arrival_factor["value"] is None:
                results["missing_factors"].append(f"arrival: {arrival_factor['name']}")
            else:
                trip_multiplier = 2 if inputs.get("round_trip", False) else 1
                if arrival_factor["unit"] == "vehicle-mile":
                    results["arrival"] = (
                        inputs["one_way_distance_miles"]
                        * trip_multiplier
                        * inputs["vehicles"]
                        * arrival_factor["value"]
                    )
                elif arrival_factor["unit"] == "passenger-mile":
                    results["arrival"] = (
                        inputs["one_way_distance_miles"]
                        * trip_multiplier
                        * inputs["party_size"]
                        * arrival_factor["value"]
                    )
                if arrival_factor["verification_status"] == "approximate":
                    results["unverified_factors"].append(f"arrival: {arrival_factor['name']}")
        else:
            results["missing_factors"].append("arrival mode")

        # Local mobility
        local_vehicle_factor = self.get_factor(inputs.get("local_vehicle_type"))
        if local_vehicle_factor and local_vehicle_factor["value"] is not None:
            results["local_mobility"] += (
                inputs["local_driving_miles"] * local_vehicle_factor["value"]
            )
            if local_vehicle_factor["verification_status"] == "approximate":
                results["unverified_factors"].append(f"local vehicle: {local_vehicle_factor['name']}")

        transit_factor = self.get_factor("transport_local_transit_bus")
        if transit_factor and transit_factor["value"] is not None:
            results["local_mobility"] += (
                inputs["transit_passenger_miles_per_person"]
                * inputs["party_size"]
                * transit_factor["value"]
            )
            if transit_factor["verification_status"] == "approximate":
                results["unverified_factors"].append(f"transit: {transit_factor['name']}")

        # Lodging
        lodging_factor = self.get_factor(inputs.get("lodging_type"))
        if lodging_factor:
            if lodging_factor["value"] is None:
                results["missing_factors"].append(f"lodging: {lodging_factor['name']}")
            else:
                results["lodging"] = (
                    inputs["nights"] * inputs["rooms"] * lodging_factor["value"]
                )
                if lodging_factor["verification_status"] == "approximate":
                    results["unverified_factors"].append(f"lodging: {lodging_factor['name']}")

        # Food - support multiple food categories
        food_categories = inputs.get("food_categories", [])
        if food_categories:
            # Use new multi-category format
            for cat in food_categories:
                food_factor = self.get_factor(cat.get("type"))
                if food_factor and food_factor["value"] is not None:
                    results["food"] += (
                        cat["spending_per_person_per_day"]
                        * inputs["party_size"]
                        * inputs["days"]
                        * food_factor["value"]
                    )
                    if food_factor["verification_status"] == "approximate":
                        results["unverified_factors"].append(f"food: {food_factor['name']}")
        else:
            # Fallback to single food type for backward compatibility
            food_factor = self.get_factor(inputs.get("food_type"))
            if food_factor and food_factor["value"] is not None:
                results["food"] = (
                    inputs["food_spending_per_person_per_day"]
                    * inputs["party_size"]
                    * inputs["days"]
                    * food_factor["value"]
                )
                if food_factor["verification_status"] == "approximate":
                    results["unverified_factors"].append(f"food: {food_factor['name']}")

        # Activities
        for activity in inputs.get("activities", []):
            activity_factor = self.get_factor(activity["category"])
            if activity_factor and activity_factor["value"] is not None:
                results["activities"] += (
                    activity["spending_whole_party"] * activity_factor["value"]
                )
                if activity_factor["verification_status"] == "approximate":
                    results["unverified_factors"].append(f"activity: {activity_factor['name']}")

        # Total
        results["total"] = (
            results["arrival"]
            + results["local_mobility"]
            + results["lodging"]
            + results["food"]
            + results["activities"]
        )

        # Per-person metrics
        if inputs["party_size"] > 0:
            results["per_person"] = results["total"] / inputs["party_size"]
        if inputs["party_size"] > 0 and inputs["days"] > 0:
            results["per_person_per_day"] = results["total"] / (inputs["party_size"] * inputs["days"])

        return results

    def get_flight_category(self, distance_miles: float) -> str:
        """Determine flight distance category."""
        if distance_miles < 300:
            return "transport_air_short_haul"
        elif distance_miles <= 2300:
            return "transport_air_medium_haul"
        else:
            return "transport_air_long_haul"
