"""Tests for agent tool wiring and data grounding."""
import pytest
from app.services.agent.agent import CayugaCompassAgent


@pytest.fixture(scope="module")
def agent():
    return CayugaCompassAgent("data")


EXPECTED_TOOLS = {
    "get_visitor_profile", "search_attractions", "get_attraction_details",
    "search_lodging", "get_lodging_details", "search_transportation",
    "get_mobility_options", "get_itinerary_templates", "generate_itinerary",
    "search_sustainable_alternatives", "calculate_trip_footprint",
    "compare_trip_scenarios", "get_emission_factor", "get_source_information",
}


def test_all_expected_tools_registered(agent):
    names = {t["function"]["name"] for t in agent.get_tools()}
    assert EXPECTED_TOOLS <= names, f"missing tools: {EXPECTED_TOOLS - names}"


@pytest.mark.asyncio
async def test_search_attractions_tool(agent):
    result = await agent.execute_tool("search_attractions", {"query": "waterfall"})
    assert "attractions" in result
    assert all("waterfall" in a["name"].lower() or "waterfall" in str(a.get("tags", [])).lower()
               or "waterfall" in a["description"].lower() for a in result["attractions"])


@pytest.mark.asyncio
async def test_get_attraction_details_grounded(agent):
    result = await agent.execute_tool("get_attraction_details", {"attraction_id": "taughannock_falls"})
    a = result["attraction"]
    assert a["tcat_access"]["status"] == "summer_only"  # research-documented, not fabricated
    assert a["source_references"]


@pytest.mark.asyncio
async def test_search_lodging_tool(agent):
    result = await agent.execute_tool("search_lodging", {"accommodation_type": "bed_breakfast"})
    assert len(result["properties"]) >= 3
    for p in result["properties"]:
        assert p["accommodation_type"] == "bed_breakfast"
        assert p.get("certified_green") is False  # no invented certifications


@pytest.mark.asyncio
async def test_search_transportation_tool(agent):
    result = await agent.execute_tool("search_transportation", {"scope": "intercity"})
    modes = {s["mode"] for s in result["services"]}
    assert "intercity_bus" in modes


@pytest.mark.asyncio
async def test_get_mobility_options(agent):
    result = await agent.execute_tool("get_mobility_options", {"attraction_id": "taughannock_falls"})
    assert result["connections"]
    statuses = {c["status"] for c in result["connections"]}
    assert "summer_only" in statuses


@pytest.mark.asyncio
async def test_generate_itinerary_tool(agent):
    result = await agent.execute_tool("generate_itinerary", {
        "interests": ["hiking"], "days": 1, "season_month": 1
    })
    assert "stops" in result
    assert "Cascadilla Gorge Trail" in result["excluded_seasonal"]


@pytest.mark.asyncio
async def test_unknown_tool_errors(agent):
    result = await agent.execute_tool("teleport_user", {})
    assert "error" in result


@pytest.mark.asyncio
async def test_calculate_footprint_deterministic(agent):
    """Agent uses the deterministic calculator - no fabricated numbers."""
    result = await agent.execute_tool("calculate_trip_footprint", {
        "trip_data": {
            "arrival_mode": "transport_passenger_car_gasoline",
            "one_way_distance_miles": 100,
            "round_trip": True, "vehicles": 1, "party_size": 2,
            "local_driving_miles": 0,
            "local_vehicle_type": "transport_passenger_car_gasoline",
            "transit_passenger_miles_per_person": 0,
            "lodging_type": "lodging_hotel_us_average",
            "nights": 1, "rooms": 1,
            "food_type": "food_full_service",
            "food_spending_per_person_per_day": 50,
            "days": 2, "activities": [],
        }
    })
    expected_arrival = 100 * 2 * 1 * 0.2986
    assert abs(result["arrival"] - expected_arrival) < 0.01
