import json
import math
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class ItineraryGenerator:
    # Broad interest categories used by the UI/agent expand to the actual
    # tags found on attractions (e.g. "museums" -> "museum", "art", ...).
    INTEREST_TAGS = {
        "hiking": {"hiking", "nature", "waterfall", "trail", "state park", "mountain"},
        "water": {"lake", "boating", "swimming", "waterfront"},
        "museums": {"museum", "art", "culture", "campus", "education", "architecture", "indoor"},
        "wineries": {"winery", "cider", "tasting", "farms"},
        "shopping": {"shopping", "dining", "downtown", "farmers market", "local food"},
        "events": {"farmers market", "weekend", "nightlife", "festival"},
    }

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

    def _expand_interests(self, interests: List[str]) -> set:
        """Map broad interest categories to concrete attraction tags."""
        tags = set(interests)
        for interest in interests:
            tags |= self.INTEREST_TAGS.get(interest, set())
        return tags

    def _build_carbon_explanation(self, num_clusters: int, emissions: Dict) -> str:
        """Plain-language rationale for why the route was built this way."""
        total = emissions["total_miles"]
        walk = emissions["walk_miles"]
        transit = emissions["transit_miles"]

        if total == 0:
            return ("With a single stop there is no travel between attractions, "
                    "so this visit adds no local transportation emissions.")

        text = (f"Stops are grouped into {num_clusters} geographic cluster"
                f"{'s' if num_clusters != 1 else ''} and ordered by proximity, "
                f"which minimizes backtracking across ~{total} miles of local travel. ")

        if walk > 0 and transit > 0:
            text += (f"{walk} mi between stops are short enough to walk (zero emissions); "
                     f"the remaining {transit} mi go on TCAT at ~0.067 kg CO2e per "
                     f"passenger-mile, about {emissions['estimated_transit_emissions_kg']} kg total.")
        elif walk > 0:
            text += (f"Every leg is under 1.5 miles, so all {walk} mi between stops are "
                     f"walkable with zero transport emissions.")
        else:
            text += (f"The stops are too spread out to walk, so all {transit} mi are routed "
                     f"to TCAT at ~0.067 kg CO2e per passenger-mile, about "
                     f"{emissions['estimated_transit_emissions_kg']} kg total.")

        if transit > 0:
            car_kg = round(total * 0.2986, 1)
            text += (f" Driving the same route in an average gasoline car would emit "
                     f"~{car_kg} kg CO2e per vehicle instead.")

        return text

    def generate(self, interests: List[str], days: int, mobility: str = "car",
                 attraction_ids: Optional[List[str]] = None) -> Dict:
        """Generate a personalized itinerary with geographic optimization."""
        tags = self._expand_interests(interests)

        # Score attractions by interest overlap
        scored = []
        for a in self.attractions["attractions"]:
            overlap = len(set(a.get("tags", [])) & tags)
            if overlap > 0:
                scored.append((overlap, a))

        scored.sort(key=lambda x: x[0], reverse=True)

        # Attractions the user explicitly picked always make the cut
        pinned = []
        seen = set()
        for aid in (attraction_ids or []):
            a = self._get_attraction_by_id(aid)
            if a and a["id"] not in seen:
                pinned.append(a)
                seen.add(a["id"])

        # Fill remaining slots with top-scored attractions
        stops_per_day = 4
        max_stops = max(len(pinned), days * stops_per_day)
        selected = list(pinned)
        for _, a in scored:
            if len(selected) >= max_stops:
                break
            if a["id"] not in seen:
                selected.append(a)
                seen.add(a["id"])

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
            "carbon_explanation": self._build_carbon_explanation(len(clusters), emissions),
            "source": "generated_optimized",
        }
