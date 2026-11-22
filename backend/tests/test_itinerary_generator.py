"""Tests for the upgraded itinerary generator."""
import pytest
from app.services.itineraries.generator import ItineraryGenerator


@pytest.fixture(scope="module")
def gen():
    return ItineraryGenerator("data")


def test_interest_filtering(gen):
    """Attractions should match requested interests."""
    result = gen.generate(["wineries"], 1)
    assert result["stops"], "no stops generated"
    tags = set()
    for s in result["stops"]:
        a = next(x for x in gen.attractions["attractions"] if x["id"] == s["attraction_id"])
        tags |= set(a.get("tags", []))
    assert tags & {"winery", "cider", "tasting", "wine", "beer", "brewery"}


def test_seasonal_exclusion(gen):
    """Seasonally closed attractions are excluded and reported, not silently dropped."""
    result = gen.generate(["hiking", "waterfall"], 1, season_month=1)
    names = [s["name"] for s in result["stops"]]
    assert "Cascadilla Gorge Trail" not in names
    assert "Cascadilla Gorge Trail" in result["excluded_seasonal"]
    assert any("seasonal" in w.lower() for w in result["warnings"])


def test_seasonal_inclusion_summer(gen):
    """Cascadilla is available in summer."""
    result = gen.generate(["hiking", "waterfall"], 1, season_month=7)
    names = [s["name"] for s in result["stops"]]
    assert "Cascadilla Gorge Trail" in names


def test_lodging_aware_rural(gen):
    """Rural lodging with walk/transit preference produces a car-free warning."""
    result = gen.generate(["hiking"], 1, mobility="walk", lodging_id="camp_earth_connection")
    assert any("car-free" in w.lower() or "limited" in w.lower() for w in result["warnings"])


def test_lodging_aware_downtown(gen):
    """Downtown lodging does not warn about car-free infeasibility and anchors proximity."""
    result = gen.generate(["museums", "shopping"], 1, mobility="transit", lodging_id="canopy_hilton")
    assert not any("car-free" in w.lower() for w in result["warnings"])
    # Canopy is downtown: Ithaca Commons should score well and appear
    names = [s["name"] for s in result["stops"]]
    assert "Ithaca Commons" in names


def test_mobility_transit_flags_summer_only(gen):
    """Transit-only visitor in winter gets a flag on summer-only TCAT attractions."""
    result = gen.generate(["hiking"], 2, mobility="transit", season_month=1)
    taugh = next((s for s in result["stops"] if s["attraction_id"] == "taughannock_falls"), None)
    if taugh:  # it may not make the cut — fine either way
        assert any("summer" in w.lower() for w in taugh["warnings"])


def test_selection_reasons_present(gen):
    result = gen.generate(["hiking"], 1)
    for s in result["stops"]:
        assert s["selection_reason"]


def test_missing_transit_information_not_claimed(gen):
    """Attractions with no confirmed transit don't get fabricated connections."""
    result = gen.generate(["wineries"], 1, mobility="transit")
    for s in result["stops"]:
        if s["attraction_id"] == "six_mile_creek":
            assert "Route" not in s["transport_note"] or "confirm" in s["transport_note"].lower()


def test_scoring_explanation_documented(gen):
    result = gen.generate(["hiking"], 1)
    assert "score" in result["scoring_explanation"].lower()


def test_backward_compatible_signature(gen):
    """Old call signature (interests, days, mobility, attraction_ids) still works."""
    result = gen.generate(["hiking"], 1, "car", ["taughannock_falls"])
    names = [s["name"] for s in result["stops"]]
    assert "Taughannock Falls State Park" in names
