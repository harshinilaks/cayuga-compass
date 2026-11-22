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
                    "name": "get_attraction_details",
                    "description": "Get full details for one attraction: hours, admission, seasonality, TCAT/walk/bike access, sources",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "attraction_id": {"type": "string", "description": "Attraction ID"}
                        },
                        "required": ["attraction_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_lodging",
                    "description": "Search researched lodging properties (hotels, inns, B&Bs, camping, farm stays)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search term"},
                            "accommodation_type": {"type": "string", "description": "hotel, motel, inn, bed_breakfast, glamping, camping, farm_stay"}
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_lodging_details",
                    "description": "Get full details for one lodging property: sustainability practices, certification status, transport access, walkability",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "lodging_id": {"type": "string", "description": "Property ID"}
                        },
                        "required": ["lodging_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "search_transportation",
                    "description": "Search documented transportation services (TCAT, intercity buses, paratransit, carshare, trails, EV charging)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search term"},
                            "scope": {"type": "string", "description": "local, regional, or intercity"},
                            "mode": {"type": "string", "description": "bus_transit, intercity_bus, air, carshare, walking, biking, ev_charging, etc."}
                        },
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_mobility_options",
                    "description": "Get documented transportation connections for an attraction or lodging property, with verification status",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "attraction_id": {"type": "string"},
                            "lodging_id": {"type": "string"}
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
                            "mobility": {"type": "string", "default": "car", "description": "walk, transit, bike, or car"},
                            "season_month": {"type": "integer", "description": "Travel month 1-12 for seasonal filtering"},
                            "lodging_id": {"type": "string", "description": "Lodging property ID to anchor recommendations"}
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
            elif name == "get_attraction_details":
                return self._get_attraction_details(arguments)
            elif name == "search_lodging":
                return self._search_lodging(arguments)
            elif name == "get_lodging_details":
                return self._get_lodging_details(arguments)
            elif name == "search_transportation":
                return self._search_transportation(arguments)
            elif name == "get_mobility_options":
                return self._get_mobility_options(arguments)
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

    def _get_attraction_details(self, args: Dict) -> Dict:
        with open(self.data_dir / "attractions.json", "r") as f:
            data = json.load(f)
        for a in data["attractions"]:
            if a["id"] == args.get("attraction_id"):
                return {"attraction": a}
        return {"error": f"Attraction not found: {args.get('attraction_id')}"}

    def _search_lodging(self, args: Dict) -> Dict:
        path = self.data_dir / "lodging.json"
        if not path.exists():
            return {"properties": []}
        with open(path, "r") as f:
            data = json.load(f)
        properties = data["properties"]
        if args.get("query"):
            q = args["query"].lower()
            properties = [p for p in properties if q in p["name"].lower() or q in p["description"].lower() or q in p["area"].lower()]
        if args.get("accommodation_type"):
            properties = [p for p in properties if p["accommodation_type"] == args["accommodation_type"]]
        return {"properties": properties}

    def _get_lodging_details(self, args: Dict) -> Dict:
        with open(self.data_dir / "lodging.json", "r") as f:
            data = json.load(f)
        for p in data["properties"]:
            if p["id"] == args.get("lodging_id"):
                return {"property": p}
        return {"error": f"Property not found: {args.get('lodging_id')}"}

    def _search_transportation(self, args: Dict) -> Dict:
        path = self.data_dir / "transportation.json"
        if not path.exists():
            return {"services": []}
        with open(path, "r") as f:
            data = json.load(f)
        services = data["services"]
        if args.get("query"):
            q = args["query"].lower()
            services = [s for s in services if q in s["name"].lower() or q in s["provider"].lower()]
        if args.get("scope"):
            services = [s for s in services if s["scope"] == args["scope"]]
        if args.get("mode"):
            services = [s for s in services if s["mode"] == args["mode"]]
        return {"services": services}

    def _get_mobility_options(self, args: Dict) -> Dict:
        path = self.data_dir / "mobility_connections.json"
        if not path.exists():
            return {"connections": []}
        with open(path, "r") as f:
            data = json.load(f)
        conns = data["connections"]
        if args.get("attraction_id"):
            conns = [c for c in conns if c.get("attraction_id") == args["attraction_id"]]
        if args.get("lodging_id"):
            conns = [c for c in conns if c.get("lodging_id") == args["lodging_id"]]
        return {"connections": conns}

    def _get_itinerary_templates(self) -> Dict:
        with open(self.data_dir / "itineraries.json", "r") as f:
            return json.load(f)

    def _generate_itinerary(self, args: Dict) -> Dict:
        from app.services.itineraries.generator import ItineraryGenerator
        gen = ItineraryGenerator(str(self.data_dir))
        return gen.generate(
            args.get("interests", []),
            args.get("days", 1),
            args.get("mobility", "car"),
            args.get("attraction_ids"),
            args.get("season_month"),
            args.get("lodging_id"),
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
                {"name": "Tompkins County Visitor Profile Study", "year": 2024},
                {"name": "STAMP Deliverable 1: Attractions & Experiences (all links checked)", "year": "2026-11-16"},
                {"name": "Transportation Research (Josh Lee)", "year": 2026},
                {"name": "Lodging Research (Deliverable 2)", "year": 2026}
            ],
            "methodology": "Deterministic carbon calculation with research-based emission factors; tourism data is research-documented with per-record verification status"
        }
