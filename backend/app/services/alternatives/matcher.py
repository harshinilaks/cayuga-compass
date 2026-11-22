import json
from pathlib import Path
from typing import Dict, List
from app.services.carbon.calculator import CarbonCalculator


class AlternativesMatcher:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.calculator = CarbonCalculator()
        self.alternatives = self._load_json("alternatives.json")

    def _load_json(self, filename: str) -> Dict:
        with open(self.data_dir / filename, "r") as f:
            return json.load(f)

    def generate_alternatives(self, baseline_inputs: Dict) -> Dict:
        """Generate multiple feasible lower-carbon alternatives."""
        baseline = self.calculator.calculate_trip_footprint(baseline_inputs)
        alternatives = []

        party_size = baseline_inputs.get("party_size", 1)
        distance = baseline_inputs.get("one_way_distance_miles", 0)
        arrival_mode = baseline_inputs.get("arrival_mode", "")
        local_driving = baseline_inputs.get("local_driving_miles", 0)
        transit_miles = baseline_inputs.get("transit_passenger_miles_per_person", 0)
        lodging = baseline_inputs.get("lodging_type", "")

        # 1. Arrival travel alternatives
        alternatives.extend(self._arrival_alternatives(
            baseline_inputs, arrival_mode, distance, party_size
        ))

        # 2. Local mobility alternatives
        alternatives.extend(self._local_alternatives(
            baseline_inputs, local_driving, transit_miles, party_size
        ))

        # 3. Lodging alternatives
        alternatives.extend(self._lodging_alternatives(
            baseline_inputs, lodging
        ))

        # Calculate each alternative
        results = []
        for alt in alternatives:
            alt_inputs = {**baseline_inputs, **alt["changes"]}
            alt_result = self.calculator.calculate_trip_footprint(alt_inputs)
            savings = baseline["total"] - alt_result["total"]
            pct = (savings / baseline["total"] * 100) if baseline["total"] > 0 else 0

            results.append({
                **alt,
                "footprint": alt_result,
                "savings_kg": round(savings, 1),
                "savings_pct": round(pct, 1),
            })

        # Sort by savings descending
        results.sort(key=lambda x: x["savings_kg"], reverse=True)

        return {
            "baseline": baseline,
            "alternatives": results,
        }

    def _arrival_alternatives(self, inputs: Dict, mode: str, distance: float, party: int) -> List[Dict]:
        alts = []
        is_vehicle = mode in ["transport_passenger_car_gasoline", "transport_suv_pickup_van", "transport_electric_vehicle"]
        is_passenger = mode in ["transport_air_short_haul", "transport_air_medium_haul", "transport_air_long_haul",
                                "transport_intercity_rail", "transport_intercity_bus"]
        is_air = "air" in mode

        if is_vehicle:
            # Suggest intercity bus for 1-2 people
            if party <= 2 and distance < 500:
                alts.append({
                    "id": "intercity_bus",
                    "name": "Intercity Bus",
                    "description": "Take a coach bus instead of driving",
                    "changes": {
                        "arrival_mode": "transport_intercity_bus",
                        "vehicles": 0,
                    },
                    "category": "getting_here",
                    "feasibility": "high" if distance < 300 else "medium",
                    "tradeoffs": "Longer travel time but much lower per-person emissions",
                })

            # Suggest train for 1-4 people
            if party <= 4 and distance < 400:
                alts.append({
                    "id": "intercity_rail",
                    "name": "Intercity Rail",
                    "description": "Take Amtrak instead of driving",
                    "changes": {
                        "arrival_mode": "transport_intercity_rail",
                        "vehicles": 0,
                    },
                    "category": "getting_here",
                    "feasibility": "high" if distance < 300 else "medium",
                    "tradeoffs": "More comfortable than bus, similar emissions",
                })

            # Suggest carpooling for 3+ people
            if party >= 3:
                alts.append({
                    "id": "carpool",
                    "name": "Carpool / Rideshare",
                    "description": "Share one vehicle instead of driving separately",
                    "changes": {
                        "arrival_mode": mode,
                        "vehicles": 1,
                    },
                    "category": "getting_here",
                    "feasibility": "high",
                    "tradeoffs": "Same route, but emissions split across more people",
                })

            # Suggest EV rental
            if distance < 400:
                alts.append({
                    "id": "ev_rental",
                    "name": "EV Rental",
                    "description": "Rent an electric vehicle instead of gasoline",
                    "changes": {
                        "arrival_mode": "transport_electric_vehicle",
                    },
                    "category": "getting_here",
                    "feasibility": "medium",
                    "tradeoffs": "Much lower emissions but requires charging access",
                })

        elif is_air:
            # For short hauls, suggest driving/bus
            if distance < 300:
                alts.append({
                    "id": "drive_instead",
                    "name": "Drive Instead",
                    "description": "Driving may be lower-emission than short-haul flying",
                    "changes": {
                        "arrival_mode": "transport_passenger_car_gasoline",
                        "vehicles": max(1, party // 2),
                    },
                    "category": "getting_here",
                    "feasibility": "medium",
                    "tradeoffs": "Takes longer but avoids airport emissions",
                })
                alts.append({
                    "id": "bus_instead",
                    "name": "Intercity Bus",
                    "description": "Coach bus is often lower-emission than short flights",
                    "changes": {
                        "arrival_mode": "transport_intercity_bus",
                        "vehicles": 0,
                    },
                    "category": "getting_here",
                    "feasibility": "high",
                    "tradeoffs": "Slower but significantly lower emissions",
                })

            # For medium hauls, suggest train if regional
            elif distance < 500:
                alts.append({
                    "id": "train_instead",
                    "name": "Intercity Rail",
                    "description": "Train travel produces less emissions than flying",
                    "changes": {
                        "arrival_mode": "transport_intercity_rail",
                        "vehicles": 0,
                    },
                    "category": "getting_here",
                    "feasibility": "medium",
                    "tradeoffs": "Slower but much lower per-passenger emissions",
                })

        # If already taking bus/train, suggest EV rental for flexibility
        if is_passenger and not is_air and distance < 300:
            alts.append({
                "id": "ev_flexibility",
                "name": "EV Rental",
                "description": "Rent an EV for more schedule flexibility",
                "changes": {
                    "arrival_mode": "transport_electric_vehicle",
                    "vehicles": 1,
                },
                "category": "getting_here",
                "feasibility": "medium",
                "tradeoffs": "More flexibility than public transit",
            })

        return alts

    def _local_alternatives(self, inputs: Dict, driving: float, transit: float, party: int) -> List[Dict]:
        alts = []

        if driving > 0:
            # Suggest TCAT for local trips
            alts.append({
                "id": "tcat_local",
                "name": "TCAT for Local Trips",
                "description": "Use TCAT bus instead of driving locally",
                "changes": {
                    "local_driving_miles": 0,
                    "transit_passenger_miles_per_person": driving / party if party > 0 else driving,
                },
                "category": "getting_around",
                "feasibility": "high",
                "tradeoffs": "Slower but zero local driving emissions",
            })

            # Suggest walking/biking for short trips
            if driving < 20:
                alts.append({
                    "id": "walk_bike",
                    "name": "Walk or Bike",
                    "description": "Walk or bike between nearby attractions",
                    "changes": {
                        "local_driving_miles": 0,
                        "transit_passenger_miles_per_person": 0,
                    },
                    "category": "getting_around",
                    "feasibility": "high" if driving < 10 else "medium",
                    "tradeoffs": "Zero emissions, healthier option for short distances",
                })

            # Suggest EV for local rental
            alts.append({
                "id": "ev_local",
                "name": "EV Rental for Local",
                "description": "Use an electric vehicle for local trips",
                "changes": {
                    "local_vehicle_type": "transport_electric_vehicle",
                },
                "category": "getting_around",
                "feasibility": "medium",
                "tradeoffs": "Lower local emissions but requires charging",
            })

        # If already transit, suggest walking for very short trips
        if transit > 0 and transit < 5:
            alts.append({
                "id": "walk_instead",
                "name": "Walk Instead of Transit",
                "description": "For very short trips, walking may be just as fast",
                "changes": {
                    "transit_passenger_miles_per_person": 0,
                },
                "category": "getting_around",
                "feasibility": "medium",
                "tradeoffs": "Zero emissions, similar time for short distances",
            })

        return alts

    def _lodging_alternatives(self, inputs: Dict, lodging: str) -> List[Dict]:
        alts = []

        # If using US average hotel, suggest green-certified
        if lodging == "lodging_hotel_us_average":
            alts.append({
                "id": "green_lodging",
                "name": "Green-Certified Lodging",
                "description": "Stay at eco-certified hotels or efficient inns",
                "changes": {
                    "lodging_type": "lodging_hotel_green_certified",
                },
                "category": "lodging",
                "feasibility": "medium",
                "tradeoffs": "Look for LEED, Green Seal, or Energy Star certifications. Savings use an approximate factor pending CHSB data.",
            })

        # If using unavailable lodging, suggest switching to verified type
        if lodging in ["lodging_vacation_rental", "lodging_bed_breakfast", "lodging_campground", "lodging_unavailable"]:
            alts.append({
                "id": "verified_lodging",
                "name": "Switch to Verified Lodging",
                "description": "Use a lodging type with verified emissions factors",
                "changes": {
                    "lodging_type": "lodging_hotel_us_average",
                },
                "category": "lodging",
                "feasibility": "high",
                "tradeoffs": "Your current lodging type lacks a verified emissions factor",
            })

        return alts
