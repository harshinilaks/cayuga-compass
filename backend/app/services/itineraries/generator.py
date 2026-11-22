import json
import math
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class ItineraryGenerator:
    # Broad interest categories used by the UI/agent expand to the actual
    # tags found on attractions (e.g. "museums" -> "museum", "art", ...).
    INTEREST_TAGS = {
        "hiking": {"hiking", "nature", "waterfall", "trail", "state park", "mountain", "gorge"},
        "water": {"lake", "boating", "swimming", "waterfront", "beach"},
        "museums": {"museum", "art", "culture", "campus", "education", "architecture", "indoor", "science", "history", "fossils"},
        "wineries": {"winery", "cider", "tasting", "farms", "beer", "brewery"},
        "shopping": {"shopping", "dining", "downtown", "farmers market", "local food"},
        "events": {"farmers market", "weekend", "nightlife", "festival", "events"},
        "families": {"families", "kids", "animals", "science", "carousel"},
    }

    # Documented in backend/data/metadata: TCAT summer routes run roughly
    # Memorial Day to Labor Day.
    SUMMER_MONTHS = {6, 7, 8}

    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.attractions = self._load_json("attractions.json")
        self.templates = self._load_json("itineraries.json")
        self.lodging = self._load_json("lodging.json", default={"properties": []})
        self.connections = self._load_json("mobility_connections.json", default={"connections": []})

    def _load_json(self, filename: str, default=None) -> Dict:
        path = self.data_dir / filename
        if not path.exists():
            return default if default is not None else {}
        with open(path, "r") as f:
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

    def _get_lodging_by_id(self, lodging_id: str) -> Optional[Dict]:
        for p in self.lodging.get("properties", []):
            if p["id"] == lodging_id:
                return p
        return None

    def _get_connections_for(self, attraction_id: str) -> List[Dict]:
        return [c for c in self.connections.get("connections", [])
                if c.get("attraction_id") == attraction_id]

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

    def _optimize_route(self, attractions: List[Dict], anchor: Optional[Dict] = None) -> List[Dict]:
        """Order attractions to minimize total travel distance using nearest neighbor."""
        if len(attractions) <= 1:
            return attractions

        # Start with attraction that has coordinates
        with_coords = [a for a in attractions if a.get("coordinates")]
        without_coords = [a for a in attractions if not a.get("coordinates")]

        if not with_coords:
            return attractions

        # Nearest neighbor TSP approximation, optionally anchored on lodging
        if anchor and anchor.get("coordinates"):
            first = min(with_coords, key=lambda a: self._haversine_miles(
                anchor["coordinates"]["lat"], anchor["coordinates"]["lon"],
                a["coordinates"]["lat"], a["coordinates"]["lon"]))
        else:
            first = with_coords[0]
        route = [first]
        remaining = [a for a in with_coords if a is not first]

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

    def _is_seasonally_closed(self, a: Dict, month: Optional[int]) -> bool:
        if month and month in a.get("closed_months", []):
            return True
        seasonality = (a.get("seasonality") or "").lower()
        if month and seasonality == "winter" and month in {5, 6, 7, 8, 9}:
            return True
        if month and seasonality == "summer-fall" and month in {12, 1, 2, 3, 4}:
            return True
        return False

    def _mobility_score(self, a: Dict, mobility: str, month: Optional[int]) -> Tuple[int, Optional[str]]:
        """Score mobility compatibility and note documented connections."""
        tcat = (a.get("tcat_access") or {}).get("status")
        conns = self._get_connections_for(a["id"])
        documented = [c for c in conns if c.get("status") in
                      ("confirmed_year_round", "walking_route")]

        if mobility == "car":
            return 1, None  # car works almost everywhere; small bonus
        if mobility in ("walk", "bike"):
            if tcat == "not_pinned_walkable" or any(c.get("mode") in ("walking", "trail") for c in conns):
                return 2, "Documented walk/trail access"
            if tcat == "year_round":
                return 1, "Transit-served; walking between nearby stops"
            return -1, "No documented walk/bike access"
        if mobility in ("transit", "tcat"):
            if tcat == "year_round" or documented:
                return 2, "Documented year-round transit access"
            if tcat == "summer_only":
                if month in self.SUMMER_MONTHS:
                    return 1, "Summer-only TCAT service (confirm dates)"
                return -2, "TCAT access is summer-only; not documented for this season"
            if tcat == "not_pinned_walkable":
                return 1, "Walkable area; no pinned stop"
            return -2, "No confirmed transit route documented"
        return 0, None

    def _score_attraction(self, a: Dict, tags: set, anchor: Optional[Dict],
                          mobility: str, month: Optional[int]) -> Tuple[int, List[str], List[str]]:
        """Transparent deterministic score: interest x3, proximity to lodging,
        seasonal suitability, mobility compatibility. Returns (score, reasons, warnings)."""
        score = 0
        reasons = []
        warnings = []

        overlap = set(a.get("tags", [])) & tags
        if overlap:
            pts = len(overlap) * 3
            score += pts
            reasons.append(f"matches your interests ({', '.join(sorted(overlap)[:3])})")

        if anchor and anchor.get("coordinates") and a.get("coordinates"):
            dist = self._haversine_miles(
                anchor["coordinates"]["lat"], anchor["coordinates"]["lon"],
                a["coordinates"]["lat"], a["coordinates"]["lon"])
            if dist <= 1.5:
                score += 2
                reasons.append(f"~{dist:.1f} mi from your lodging")
            elif dist <= 4:
                score += 1
                reasons.append(f"~{dist:.1f} mi from your lodging")

        if self._is_seasonally_closed(a, month):
            score -= 100
            warnings.append(a.get("seasonality_notes") or "documented seasonal closure")

        mob_pts, mob_note = self._mobility_score(a, mobility, month)
        score += mob_pts
        if mob_note:
            (reasons if mob_pts > 0 else warnings).append(mob_note)
        if mob_pts < 0:
            warnings.append(mob_note)

        return score, reasons, warnings

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

    def _documented_connection_note(self, a: Dict, month: Optional[int]) -> Optional[str]:
        """Pull a documented connection string for this attraction, if any."""
        notes = []
        for c in self._get_connections_for(a["id"]):
            status = c.get("status")
            detail = c.get("route_detail", "")
            if status == "confirmed_year_round":
                notes.append(f"Documented connection: {detail}")
            elif status == "summer_only":
                if month in self.SUMMER_MONTHS:
                    notes.append(f"Summer-only service documented: {detail} (confirm dates)")
                else:
                    notes.append(f"Only summer TCAT service documented ({detail}) - not available for your dates")
            elif status == "provisional":
                notes.append(f"Provisional connection: {detail} - requires confirmation")
            elif status == "corridor_only":
                notes.append(f"{detail} - no confirmed stop; requires confirmation")
            elif status == "walking_route":
                notes.append(f"{detail}")
        return "; ".join(notes) if notes else None

    def generate(self, interests: List[str], days: int, mobility: str = "car",
                 attraction_ids: Optional[List[str]] = None,
                 season_month: Optional[int] = None,
                 lodging_id: Optional[str] = None) -> Dict:
        """Generate a personalized itinerary with geographic, seasonal,
        lodging, and mobility awareness."""
        tags = self._expand_interests(interests)
        lodging = self._get_lodging_by_id(lodging_id) if lodging_id else None
        warnings = []

        # Score attractions
        scored = []
        for a in self.attractions["attractions"]:
            score, reasons, warns = self._score_attraction(a, tags, lodging, mobility, season_month)
            scored.append((score, reasons, warns, a))

        scored.sort(key=lambda x: x[0], reverse=True)

        # Attractions the user explicitly picked always make the cut
        pinned = []
        seen = set()
        for aid in (attraction_ids or []):
            a = self._get_attraction_by_id(aid)
            if a and a["id"] not in seen:
                pinned.append(a)
                seen.add(a["id"])

        # Interest-matching attractions that are closed for the dates are
        # recorded as excluded regardless of slot limits
        excluded_seasonal = [
            a["name"] for score, reasons, warns, a in scored
            if reasons and self._is_seasonally_closed(a, season_month)
        ]

        # Fill remaining slots with top-scored attractions
        stops_per_day = 4
        max_stops = max(len(pinned), days * stops_per_day)
        selected = list(pinned)
        score_map = {}
        for score, reasons, warns, a in scored:
            if len(selected) >= max_stops:
                break
            if a["id"] in seen:
                continue
            if self._is_seasonally_closed(a, season_month):
                continue
            if score <= 0:
                continue
            selected.append(a)
            seen.add(a["id"])
        for score, reasons, warns, a in scored:
            score_map[a["id"]] = {"score": score, "reasons": reasons, "warnings": warns}

        # Geographic clustering and route optimization (anchored on lodging)
        clusters = self._cluster_attractions(selected)
        optimized = self._optimize_route(selected, anchor=lodging)

        # Lodging-aware warnings
        if lodging:
            if not lodging.get("car_free_feasible") and mobility in ("walk", "transit", "bike"):
                warnings.append(
                    f"{lodging['name']} is in a location with limited transportation access "
                    f"({lodging.get('transportation_access', [''])[0].lower()}); a car-free "
                    "itinerary may be difficult. Only documented connections are suggested."
                )
            if lodging.get("emissions_factor_id") is None:
                warnings.append(
                    f"No emissions factor exists for {lodging['name']}'s accommodation type; "
                    "lodging emissions are not estimated for this property."
                )

        if excluded_seasonal:
            warnings.append(
                "Excluded for your travel dates (documented seasonal closure): "
                + ", ".join(excluded_seasonal)
            )

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

            # Prefer documented connection notes over distance heuristic
            conn_note = self._documented_connection_note(a, season_month)
            if conn_note:
                transport_note = f"{transport_note} | {conn_note}".strip(" |")

            time_str = f"{hour}:00 AM" if hour < 12 else f"{hour - 12 if hour > 12 else hour}:00 PM"

            meta = score_map.get(a["id"], {"reasons": [], "warnings": []})
            seasonal_warn = None
            if self._is_seasonally_closed(a, season_month):
                seasonal_warn = a.get("seasonality_notes") or "Documented seasonal closure for your dates"
            elif a.get("seasonality_notes"):
                seasonal_warn = a["seasonality_notes"]

            stop_warnings = list(meta.get("warnings", []))
            if seasonal_warn:
                stop_warnings.append(seasonal_warn)

            stops.append({
                "time": time_str,
                "attraction_id": a["id"],
                "name": a["name"],
                "area": a["area"],
                "category": a["category"],
                "notes": a["description"],
                "day": current_day,
                "transport_from_previous": transport,
                "transport_note": transport_note,
                "selection_reason": "; ".join(meta.get("reasons", [])) or "top-scored match",
                "warnings": stop_warnings,
                "hours": a.get("hours"),
                "admission": a.get("admission"),
                "website": a.get("website"),
                "verification_status": a.get("verification_status"),
                "cluster_id": next((j for j, c in enumerate(clusters) if a in c), None),
            })

            hour += 2
            if hour > 18:
                hour = 10
                current_day += 1

        # Estimate local emissions
        emissions = self._estimate_local_emissions(optimized)

        verification_notes = [
            "Hours, seasonal closures, and transit routes are research-documented "
            "(checked 2026-11-16) and may change; verify with the linked official sources."
        ]

        return {
            "name": "Custom Ithaca Itinerary",
            "description": f"Personalized {days}-day itinerary optimized for low emissions",
            "stops": stops,
            "clusters": len(clusters),
            "local_emissions": emissions,
            "carbon_explanation": self._build_carbon_explanation(len(clusters), emissions),
            "lodging": lodging,
            "warnings": warnings,
            "excluded_seasonal": excluded_seasonal,
            "verification_notes": verification_notes,
            "scoring_explanation": (
                "Deterministic score = interest-tag overlap x3, proximity to lodging "
                "(<=1.5 mi: +2, <=4 mi: +1), mobility compatibility (documented connections "
                "up to +2, undocumented for chosen mode down to -2). Seasonally closed "
                "attractions are excluded and listed under excluded_seasonal."
            ),
            "source": "generated_optimized",
        }
