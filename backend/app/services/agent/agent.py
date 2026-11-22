import os
import json
from pathlib import Path
from typing import Dict, List, Optional
from app.services.carbon.calculator import CarbonCalculator


class CayugaCompassAgent:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.calculator = CarbonCalculator()
        self.api_key = os.environ.get("OPENAI_API_KEY")
        self.base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")

    def get_tools(self) -> List[Dict]:
        """Define the agent's tool schema."""
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_visitor_profile",
                    "description": "Get visitor profile and trip data",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_attractions",
                    "description": "Search local attractions by interest or category",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search term"},
                            "category": {"type": "string", "description": "Category filter"}
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_itinerary_templates",
                    "description": "Get available itinerary templates",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "generate_itinerary",
                    "description": "Generate a personalized itinerary",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "interests": {"type": "array", "items": {"type": "string"}},
                            "days": {"type": "integer", "default": 1},
                            "mobility": {"type": "string", "default": "car"}
                        },
                        "required": ["interests"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_sustainable_alternatives",
                    "description": "Search lower-carbon travel alternatives",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "category": {"type": "string", "description": "Category filter"},
                            "persona": {"type": "string", "description": "Persona filter"}
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "calculate_trip_footprint",
                    "description": "Calculate carbon footprint for a trip scenario",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "trip_data": {"type": "object", "description": "Trip inputs"}
                        },
                        "required": ["trip_data"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "compare_trip_scenarios",
                    "description": "Compare two trip scenarios",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "baseline": {"type": "object"},
                            "alternative": {"type": "object"}
                        },
                        "required": ["baseline", "alternative"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_emission_factor",
                    "description": "Get emissions factor for a category",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "factor_id": {"type": "string", "description": "Factor ID"}
                        },
                        "required": ["factor_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_source_information",
                    "description": "Get source documentation for emissions factors",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            }
        ]

    async def execute_tool(self, name: str, arguments: Dict) -> Dict:
        """Execute a tool call."""
        try:
            if name == "get_visitor_profile":
                return self._get_visitor_profile()
            elif name == "search_attractions":
                return self._search_attractions(arguments)
            elif name == "get_itinerary_templates":
                return self._get_itinerary_templates()
            elif name == "generate_itinerary":
                return self._generate_itinerary(arguments)
            elif name == "search_sustainable_alternatives":
                return self._search_alternatives(arguments)
            elif name == "calculate_trip_footprint":
                return self._calculate_footprint(arguments)
            elif name == "compare_trip_scenarios":
                return self._compare_scenarios(arguments)
            elif name == "get_emission_factor":
                return self._get_emission_factor(arguments)
            elif name == "get_source_information":
                return self._get_source_information()
            else:
                return {"error": f"Unknown tool: {name}"}
        except Exception as e:
            return {"error": str(e)}

    def _get_visitor_profile(self) -> Dict:
        with open(self.data_dir / "visitor_personas.json", "r") as f:
            return json.load(f)

    def _search_attractions(self, args: Dict) -> Dict:
        with open(self.data_dir / "attractions.json", "r") as f:
            data = json.load(f)
        attractions = data["attractions"]
        if args.get("query"):
            q = args["query"].lower()
            attractions = [a for a in attractions if q in a["name"].lower() or q in a["description"].lower() or q in a.get("tags", [])]
        if args.get("category"):
            attractions = [a for a in attractions if a["category"] == args["category"]]
        return {"attractions": attractions}

    def _get_itinerary_templates(self) -> Dict:
        with open(self.data_dir / "itineraries.json", "r") as f:
            return json.load(f)

    def _generate_itinerary(self, args: Dict) -> Dict:
        from app.services.itineraries.generator import ItineraryGenerator
        gen = ItineraryGenerator(str(self.data_dir))
        return gen.generate(
            args.get("interests", []),
            args.get("days", 1),
            args.get("mobility", "car")
        )

    def _search_alternatives(self, args: Dict) -> Dict:
        with open(self.data_dir / "alternatives.json", "r") as f:
            data = json.load(f)
        alternatives = data["alternatives"]
        if args.get("category"):
            alternatives = [a for a in alternatives if a["category"] == args["category"]]
        if args.get("persona"):
            alternatives = [a for a in alternatives if args["persona"] in a.get("applicable_personas", []) or "all" in a.get("applicable_personas", [])]
        return {"alternatives": alternatives}

    def _calculate_footprint(self, args: Dict) -> Dict:
        return self.calculator.calculate_trip_footprint(args.get("trip_data", {}))

    def _compare_scenarios(self, args: Dict) -> Dict:
        baseline = self.calculator.calculate_trip_footprint(args.get("baseline", {}))
        alternative = self.calculator.calculate_trip_footprint(args.get("alternative", {}))
        return {
            "baseline": baseline,
            "alternative": alternative,
            "savings_kg_co2e": baseline["total"] - alternative["total"],
            "percent_change": ((baseline["total"] - alternative["total"]) / baseline["total"] * 100) if baseline["total"] > 0 else 0
        }

    def _get_emission_factor(self, args: Dict) -> Dict:
        factor = self.calculator.get_factor(args.get("factor_id", ""))
        return {"factor": factor}

    def _get_source_information(self) -> Dict:
        return {
            "sources": [
                {"name": "US EPA GHG Emission Factors Hub", "year": 2025},
                {"name": "US EPA Supply Chain GHG Emission Factors v1.3", "year": 2022},
                {"name": "UK DESNZ GHG Conversion Factors", "year": "Latest"},
                {"name": "Tompkins County Visitor Profile Study", "year": 2024}
            ],
            "methodology": "Deterministic carbon calculation with research-based emission factors"
        }
