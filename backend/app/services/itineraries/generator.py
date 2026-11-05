import json
import math
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class ItineraryGenerator:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.attractions = self._load_json("attractions.json")
        self.templates = self._load_json("itineraries.json")

    def _load_json(self, filename: str) -> Dict:
        with open(self.data_dir / filename, "r") as f:
            return json.load(f)

    def _haversine_miles(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance in miles between two points."""
        R = 3959  # Earth radius in miles
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return R * c

    def _get_attraction_by_id(self, attraction_id: str) -> Optional[Dict]:
        for a in self.attractions["attractions"]:
            if a["id"] == attraction_id:
                return a
        return None

    def _cluster_attractions(self, attractions: List[Dict], cluster_radius_miles: float = 1.5) -> List[List[Dict]]:
        """Group attractions by geographic proximity."""
        clusters = []
        used = set()

        for i, a in enumerate(attractions):
            if i in used or not a.get("coordinates"):
                continue

            cluster = [a]
            used.add(i)

            # Find nearby attractions for this cluster
            for j, b in enumerate(attractions):
                if j in used or not b.get("coordinates"):
                    continue
                dist = self._haversine_miles(
                    a["coordinates"]["lat"], a["coordinates"]["lon"],
                    b["coordinates"]["lat"], b["coordinates"]["lon"]
                )
                if dist <= cluster_radius_miles:
                    cluster.append(b)
                    used.add(j)

            clusters.append(cluster)

        # Add unclustered attractions (no coordinates or too far)
        for i, a in enumerate(attractions):
            if i not in used:
                clusters.append([a])

        return clusters

    def _optimize_route(self, attractions: List[Dict]) -> List[Dict]:
        """Order attractions to minimize total travel distance using nearest neighbor."""
        if len(attractions) <= 1:
            return attractions

        # Start with attraction that has coordinates
        with_coords = [a for a in attractions if a.get("coordinates")]
        without_coords = [a for a in attractions if not a.get("coordinates")]

        if not with_coords:
            return attractions

        # Nearest neighbor TSP approximation
        route = [with_coords[0]]
        remaining = with_coords[1:]

        while remaining:
            last = route[-1]
            nearest_idx = 0
            nearest_dist = float('inf')

            for i, a in enumerate(remaining):
                dist = self._haversine_miles(
                    last["coordinates"]["lat"], last["coordinates"]["lon"],
                    a["coordinates"]["lat"], a["coordinates"]["lon"]
                )
                if dist < nearest_dist:
                    nearest_dist = dist
                    nearest_idx = i

            route.append(remaining.pop(nearest_idx))

        return route + without_coords

    def _suggest_transport(self, from_a: Dict, to_a: Dict) -> Tuple[str, str]:
        """Suggest transport mode between two attractions."""
        if not from_a.get("coordinates") or not to_a.get("coordinates"):
            return "walk", "Check specific route"

        dist = self._haversine_miles(
            from_a["coordinates"]["lat"], from_a["coordinates"]["lon"],
            to_a["coordinates"]["lat"], to_a["coordinates"]["lon"]
        )

        if dist <= 0.5:
            return "walk", f"~{dist:.1f} mi - easy walk"
        elif dist <= 1.5:
            return "walk", f"~{dist:.1f} mi - walkable"
        elif dist <= 3:
            return "tcat", f"~{dist:.1f} mi - use TCAT or bike"
        else:
            return "tcat", f"~{dist:.1f} mi - use TCAT or rideshare"

    def _estimate_local_emissions(self, route: List[Dict]) -> Dict:
        """Estimate local transportation emissions between stops."""
        total_miles = 0
        walk_miles = 0
        transit_miles = 0

        for i in range(len(route) - 1):
            if not route[i].get("coordinates") or not route[i+1].get("coordinates"):
                continue
            dist = self._haversine_miles(
                route[i]["coordinates"]["lat"], route[i]["coordinates"]["lon"],
                route[i+1]["coordinates"]["lat"], route[i+1]["coordinates"]["lon"]
            )
            total_miles += dist

            mode, _ = self._suggest_transport(route[i], route[i+1])
            if mode == "walk":
                walk_miles += dist
            else:
                transit_miles += dist

        # Transit factor: 0.0666 kg CO2e per passenger-mile (national bus proxy)
        transit_emissions = transit_miles * 0.0666

        return {
            "total_miles": round(total_miles, 1),
            "walk_miles": round(walk_miles, 1),
            "transit_miles": round(transit_miles, 1),
            "estimated_transit_emissions_kg": round(transit_emissions, 2),
        }

    def generate(self, interests: List[str], days: int, mobility: str = "car") -> Dict:
        """Generate a personalized itinerary with geographic optimization."""
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

        # Geographic clustering and route optimization
        clusters = self._cluster_attractions(selected)
        optimized = self._optimize_route(selected)

        # Build stops with transport suggestions
        stops = []
        current_day = 1
        hour = 10

        for i, a in enumerate(optimized):
            # Add transport suggestion between stops
            transport = "walk"
            transport_note = ""
            if i > 0:
                transport, transport_note = self._suggest_transport(optimized[i-1], a)

            time_str = f"{hour}:00 AM" if hour < 12 else f"{hour - 12 if hour > 12 else hour}:00 PM"

            stops.append({
                "time": time_str,
                "name": a["name"],
                "area": a["area"],
                "category": a["category"],
                "notes": a["description"],
                "day": current_day,
                "transport_from_previous": transport,
                "transport_note": transport_note,
                "cluster_id": next((j for j, c in enumerate(clusters) if a in c), None),
            })

            hour += 2
            if hour > 18:
                hour = 10
                current_day += 1

        # Estimate local emissions
        emissions = self._estimate_local_emissions(optimized)

        return {
            "name": "Custom Ithaca Itinerary",
            "description": f"Personalized {days}-day itinerary optimized for low emissions",
            "stops": stops,
            "clusters": len(clusters),
            "local_emissions": emissions,
            "sustainability_tips": [
                f"Visit {len(clusters)} geographic cluster{'s' if len(clusters) > 1 else ''} to minimize travel",
                f"Walk {emissions['walk_miles']} of {emissions['total_miles']} local miles",
                "Use TCAT for longer distances between clusters",
                "Choose attractions near your lodging to reduce driving",
            ],
            "source": "generated_optimized",
        }
