from fastapi import APIRouter, HTTPException
import httpx
import math

router = APIRouter()

ITHACA_LAT = 42.4430
ITHACA_LON = -76.5019
ITHACA_DISPLAY = "Ithaca, NY"


@router.get("/")
async def get_distance(origin: str, mode: str = "driving"):
    """
    Calculate distance from origin to Ithaca, NY.
    Uses Nominatim for geocoding and OSRM for driving distance.
    """
    try:
        # Geocode the origin
        origin_coords = await geocode(origin)
        if not origin_coords:
            raise HTTPException(status_code=404, detail=f"Could not find location: {origin}")

        if mode == "flying":
            # Great-circle distance for flights
            distance_km = haversine(
                origin_coords["lat"], origin_coords["lon"],
                ITHACA_LAT, ITHACA_LON
            )
            distance_miles = distance_km * 0.621371
        else:
            # Driving distance via OSRM
            distance_miles = await get_driving_distance(
                origin_coords["lat"], origin_coords["lon"],
                ITHACA_LAT, ITHACA_LON
            )

        return {
            "origin": origin,
            "destination": ITHACA_DISPLAY,
            "distance_miles": round(distance_miles, 1),
            "mode": mode,
            "source": "OpenStreetMap" if mode == "driving" else "Great-circle calculation"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Distance calculation error: {str(e)}")


async def geocode(query: str) -> dict:
    """Geocode a location string using Nominatim."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://nominatim.openstreetmap.org/search",
            params={
                "q": query,
                "format": "json",
                "limit": 1,
                "countrycodes": "us,ca"  # Limit to North America for better results
            },
            headers={
                "User-Agent": "STAMP-CarbonCalculator/1.0"
            }
        )
        results = response.json()
        if results:
            return {
                "lat": float(results[0]["lat"]),
                "lon": float(results[0]["lon"]),
                "display_name": results[0].get("display_name", query)
            }
        return None


async def get_driving_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Get driving distance in miles using OSRM."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}",
            params={"overview": "false"}
        )
        data = response.json()
        if data.get("code") == "Ok" and data.get("routes"):
            distance_meters = data["routes"][0]["distance"]
            return distance_meters * 0.000621371  # meters to miles
        raise HTTPException(status_code=500, detail="Could not calculate driving distance")


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance in km between two points."""
    R = 6371  # Earth radius in km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c
