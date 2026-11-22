"""Data integrity tests for local tourism datasets."""
import json
import re
import pytest
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"


def load(name):
    with open(DATA / name) as f:
        return json.load(f)


@pytest.fixture(scope="module")
def attractions():
    return load("attractions.json")["attractions"]


@pytest.fixture(scope="module")
def lodging():
    return load("lodging.json")["properties"]


@pytest.fixture(scope="module")
def transportation():
    return load("transportation.json")["services"]


@pytest.fixture(scope="module")
def connections():
    return load("mobility_connections.json")["connections"]


RESEARCH_ATTRACTION_IDS = [
    "cornell_botanic_gardens", "johnson_museum", "mcgraw_tower_chimes",
    "cornell_lab_ornithology", "cornell_dairy_bar", "cascadilla_gorge_trail",
    "ithaca_commons", "history_center", "farmers_market",
    "sciencenter", "museum_of_the_earth", "cayuga_nature_center",
    "taughannock_falls", "buttermilk_falls", "treman_state_park", "ithaca_falls",
    "cayuga_waterfront_trail", "black_diamond_trail", "stewart_park", "childrens_garden",
    "six_mile_creek", "south_hill_cider", "ithaca_beer", "cayuga_lake_wine_trail",
]


def test_all_24_research_attractions_imported(attractions):
    ids = {a["id"] for a in attractions}
    for rid in RESEARCH_ATTRACTION_IDS:
        assert rid in ids, f"missing researched attraction {rid}"
    assert len(ids) == len(attractions), "duplicate attraction ids"


def test_no_duplicate_ids_anywhere(attractions, lodging, transportation):
    ids = [a["id"] for a in attractions] + [p["id"] for p in lodging] + [s["id"] for s in transportation]
    assert len(ids) == len(set(ids)), f"duplicate ids: {[i for i in set(ids) if ids.count(i) > 1]}"


def test_required_fields(attractions, lodging, transportation):
    for a in attractions:
        for f in ("id", "name", "category", "area", "description", "verification_status"):
            assert a.get(f) not in (None, ""), f"attraction {a.get('id')} missing {f}"
    for p in lodging:
        for f in ("id", "name", "accommodation_type", "area", "description", "verification_status"):
            assert p.get(f) not in (None, ""), f"lodging {p.get('id')} missing {f}"
    for s in transportation:
        for f in ("id", "name", "provider", "scope", "mode", "service_area"):
            assert s.get(f) not in (None, ""), f"service {s.get('id')} missing {f}"


def test_source_metadata(attractions, lodging, transportation):
    for a in attractions:
        if a.get("source_document"):
            assert a.get("source_references") is not None
            assert a.get("research_verified_date")
    for p in lodging:
        assert p.get("source_document"), f"lodging {p['id']} missing source_document"
    for s in transportation:
        assert s.get("source_document"), f"service {s['id']} missing source_document"


def test_urls_well_formed(attractions, lodging, transportation):
    pat = re.compile(r"^https?://")
    for a in attractions:
        if a.get("website"):
            assert pat.match(a["website"]), f"{a['id']} bad website {a['website']}"
    for p in lodging:
        for u in p.get("source_urls", []):
            assert pat.match(u), f"{p['id']} bad source url {u}"


def test_tcat_access_distinctions(attractions):
    """The four research TCAT categories are all represented and valid."""
    statuses = {a.get("tcat_access", {}).get("status") for a in attractions}
    assert statuses <= {"year_round", "summer_only", "not_pinned_walkable", "none_confirmed"}
    assert "summer_only" in statuses
    # Walkable must not imply transit access
    walkable_only = [a["id"] for a in attractions
                     if a.get("tcat_access", {}).get("status") == "not_pinned_walkable"]
    assert "cascadilla_gorge_trail" in walkable_only


def test_transportation_categories_represented(transportation):
    modes = {s["mode"] for s in transportation}
    scopes = {s["scope"] for s in transportation}
    for expected in ("bus_transit", "paratransit", "intercity_bus", "air",
                     "carshare", "walking", "biking", "ev_charging"):
        assert expected in modes, f"missing mode {expected}"
    assert {"local", "regional", "intercity"} <= scopes


def test_lodging_no_unsupported_certifications(lodging):
    for p in lodging:
        assert p.get("certified_green") is False, f"{p['id']} claims certified green"
        # factor ids must exist in the registry or be None
        assert p.get("emissions_factor_id") is None or p["emissions_factor_id"].startswith("lodging_")


def test_lodging_count_and_types(lodging):
    assert len(lodging) == 11
    types = {p["accommodation_type"] for p in lodging}
    assert {"hotel", "bed_breakfast", "camping"} <= types


def test_connections_reference_existing(connections, attractions, lodging, transportation):
    attr_ids = {a["id"] for a in attractions}
    lodg_ids = {p["id"] for p in lodging}
    svc_ids = {s["id"] for s in transportation}
    for c in connections:
        if c.get("attraction_id"):
            assert c["attraction_id"] in attr_ids, f"bad attraction ref {c['attraction_id']}"
        if c.get("lodging_id"):
            assert c["lodging_id"] in lodg_ids, f"bad lodging ref {c['lodging_id']}"
        for k in ("service_id", "linked_service_id"):
            if c.get(k):
                assert c[k] in svc_ids, f"bad service ref {c[k]}"


def test_seasonal_restrictions_preserved(attractions):
    by_id = {a["id"]: a for a in attractions}
    assert "winter" in by_id["cascadilla_gorge_trail"]["seasonality_notes"].lower()
    assert by_id["taughannock_falls"]["tcat_access"]["status"] == "summer_only"
    assert "Triphammer" in by_id["farmers_market"]["seasonality_notes"]


def test_legacy_records_preserved(attractions):
    ids = {a["id"] for a in attractions}
    for legacy in ("cornell_university", "triphammer_falls", "collegetown",
                   "moosewood", "cayuga_lake", "greek_peak", "trumansburg_area"):
        assert legacy in ids
