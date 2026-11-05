import json
from pathlib import Path
from typing import Dict, List, Optional


class ItineraryGenerator:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.attractions = self._load_json("attractions.json")
        self.templates = self._load_json("itineraries.json")

    def _load_json(self, filename: str) -> Dict:
        with open(self.data_dir / filename, "r") as f:
            return json.load(f)

    def generate(self, interests: List[str], days: int, mobility: str = "car") -> Dict:
        """Generate a personalized itinerary based on interests."""
        # Score templates by interest overlap
        scored_templates = []
        for template in self.templates["templates"]:
            overlap = len(set(template["interest_tags"]) & set(interests))
            scored_templates.append((overlap, template))

        scored_templates.sort(key=lambda x: x[0], reverse=True)

        # Pick the best matching template, or build a custom one
        if scored_templates and scored_templates[0][0] > 0:
            template = scored_templates[0][1]
            return self._render_template(template, mobility)

        # Fallback: build from attractions matching interests
        return self._render_custom(interests, days, mobility)

    def _render_template(self, template: Dict, mobility: str) -> Dict:
        """Render a template into a full itinerary."""
        attraction_map = {a["id"]: a for a in self.attractions["attractions"]}

        stops = []
        for stop in template["stops"]:
            attraction = attraction_map.get(stop["attraction_id"])
            if attraction:
                stops.append({
                    "time": stop["time"],
                    "name": attraction["name"],
                    "area": attraction["area"],
                    "category": attraction["category"],
                    "notes": stop["notes"],
                    "description": attraction["description"],
                })

        return {
            "name": template["name"],
            "description": template["description"],
            "stops": stops,
            "sustainability_tips": template["sustainability_tips"],
            "source": "template",
        }

    def _render_custom(self, interests: List[str], days: int, mobility: str) -> Dict:
        """Build a custom itinerary from matching attractions."""
        # Score attractions by interest overlap
        scored = []
        for a in self.attractions["attractions"]:
            overlap = len(set(a.get("tags", [])) & set(interests))
            if overlap > 0:
                scored.append((overlap, a))

        scored.sort(key=lambda x: x[0], reverse=True)

        # Take top attractions for the trip duration
        stops_per_day = 4
        max_stops = min(len(scored), days * stops_per_day)
        selected = [a for _, a in scored[:max_stops]]

        stops = []
        for i, a in enumerate(selected):
            day_num = (i // stops_per_day) + 1
            hour = 10 + (i % stops_per_day) * 2
            stops.append({
                "time": f"{hour}:00 AM" if hour < 12 else f"{hour}:00 PM",
                "name": a["name"],
                "area": a["area"],
                "category": a["category"],
                "notes": a["description"],
                "day": day_num,
            })

        return {
            "name": "Custom Ithaca Itinerary",
            "description": f"Personalized itinerary based on your interests",
            "stops": stops,
            "sustainability_tips": [
                "Group nearby attractions to minimize driving",
                "Use TCAT or walk between stops",
                "Choose local dining options",
            ],
            "source": "generated",
        }
