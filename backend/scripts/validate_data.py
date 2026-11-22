"""Validate Cayuga Compass local tourism datasets.

Checks:
- Duplicate IDs within and across datasets
- Required fields present
- Malformed URLs (website, source_urls, source_url)
- Invalid enum values (tcat_access.status, connection status, modes, scopes)
- Broken cross-references (mobility connections -> attractions/lodging/services,
  lodging.nearby_attractions -> attractions, lodging.emissions_factor_id -> factors)
- Missing source metadata on research-imported records
- Unsupported transportation connections (statuses that must not be presented
  as confirmed transit)

Run: python scripts/validate_data.py  (from backend/)
Exit code 1 on errors; warnings never fail the build.
"""
import json
import re
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

URL_RE = re.compile(r"^https?://[^\s/$.?#].[^\s]*$", re.IGNORECASE)

ATTRACTION_CATEGORIES = {
    "museums_culture", "hiking_nature", "shopping", "local_food",
    "water_activities", "wineries",
}
TCAT_STATUSES = {"year_round", "summer_only", "not_pinned_walkable", "none_confirmed"}
VERIFICATION_STATUSES = {
    "research_documented", "independently_verified", "provisional", "unverified",
}
LODGING_TYPES = {
    "hotel", "motel", "inn", "bed_breakfast", "glamping", "camping", "farm_stay", "hostel",
}
CONN_STATUSES = {
    "confirmed_year_round", "summer_only", "provisional",
    "corridor_only", "walking_route", "requires_confirmation",
}
SERVICE_SCOPES = {"local", "regional", "intercity"}
SERVICE_MODES = {
    "bus_transit", "paratransit", "on_demand", "intercity_bus", "air",
    "taxi_rideshare", "carshare", "carpool", "walking", "biking", "ev_charging",
}
ADMISSION_TYPES = {"free", "donation", "suggested_donation", "vehicle_fee", "ticketed", "pay_as_you_go", "varies"}

errors = []
warnings = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def load(name):
    with open(DATA_DIR / name) as f:
        return json.load(f)


def check_url(url, ctx):
    if url is None:
        return
    if not isinstance(url, str) or not URL_RE.match(url):
        warn(f"{ctx}: suspicious URL {url!r}")


def check_duplicates(records, key, name):
    seen = {}
    for r in records:
        rid = r.get(key)
        if rid in seen:
            err(f"{name}: duplicate id {rid!r}")
        seen[rid] = True
    return seen


def main():
    attractions = load("attractions.json")["attractions"]
    lodging = load("lodging.json")["properties"]
    transportation = load("transportation.json")["services"]
    connections = load("mobility_connections.json")["connections"]
    factors = load("emission_factors.json")["factors"]
    factor_ids = {f["id"] for f in factors}

    attr_ids = check_duplicates(attractions, "id", "attractions")
    lodging_ids = check_duplicates(lodging, "id", "lodging")
    service_ids = check_duplicates(transportation, "id", "transportation")
    all_ids = set(attr_ids) | set(lodging_ids) | set(service_ids)
    if len(all_ids) != len(attr_ids) + len(lodging_ids) + len(service_ids):
        err("cross-dataset: duplicate ids across datasets")

    for a in attractions:
        ctx = f"attraction {a.get('id')}"
        for field in ("id", "name", "category", "area", "description"):
            if a.get(field) in (None, ""):
                err(f"{ctx}: missing required field {field}")
        if a.get("category") not in ATTRACTION_CATEGORIES:
            warn(f"{ctx}: unknown category {a.get('category')!r}")
        status = a.get("verification_status")
        if status not in VERIFICATION_STATUSES:
            err(f"{ctx}: invalid verification_status {status!r}")
        tcat = a.get("tcat_access") or {}
        if tcat.get("status") not in TCAT_STATUSES:
            err(f"{ctx}: invalid tcat_access.status {tcat.get('status')!r}")
        adm = a.get("admission")
        if adm and adm.get("type") not in ADMISSION_TYPES:
            err(f"{ctx}: invalid admission.type {adm.get('type')!r}")
        if a.get("source_document") and not a.get("source_references") and not a.get("website"):
            warn(f"{ctx}: has source_document but no source_references/website")
        check_url(a.get("website"), ctx)
        if status == "research_documented" and not (a.get("source_document") or a.get("source_references")):
            warn(f"{ctx}: research_documented but missing source metadata")

    for p in lodging:
        ctx = f"lodging {p.get('id')}"
        for field in ("id", "name", "accommodation_type", "area", "description"):
            if p.get(field) in (None, ""):
                err(f"{ctx}: missing required field {field}")
        if p.get("accommodation_type") not in LODGING_TYPES:
            err(f"{ctx}: invalid accommodation_type {p.get('accommodation_type')!r}")
        if p.get("certified_green") and "verified" in str(p.get("certification_status", "")).lower() and "none" in str(p.get("certification_status", "")).lower():
            err(f"{ctx}: certified_green true but certification_status says none verified")
        if p.get("verification_status") not in VERIFICATION_STATUSES:
            err(f"{ctx}: invalid verification_status")
        ef = p.get("emissions_factor_id")
        if ef is not None and ef not in factor_ids:
            err(f"{ctx}: emissions_factor_id {ef!r} not in registry")
        for aid in p.get("nearby_attractions", []):
            if aid not in attr_ids:
                err(f"{ctx}: nearby_attraction {aid!r} not in attractions dataset")
        for u in p.get("source_urls", []):
            check_url(u, ctx)

    for s in transportation:
        ctx = f"service {s.get('id')}"
        for field in ("id", "name", "provider", "scope", "mode", "service_area"):
            if s.get(field) in (None, ""):
                err(f"{ctx}: missing required field {field}")
        if s.get("scope") not in SERVICE_SCOPES:
            err(f"{ctx}: invalid scope {s.get('scope')!r}")
        if s.get("mode") not in SERVICE_MODES:
            err(f"{ctx}: invalid mode {s.get('mode')!r}")
        if s.get("verification_status") not in VERIFICATION_STATUSES:
            err(f"{ctx}: invalid verification_status")
        check_url(s.get("website"), ctx)

    for c in connections:
        ctx = f"connection {c}"
        if c.get("status") not in CONN_STATUSES:
            err(f"{ctx}: invalid status {c.get('status')!r}")
        for ref_key, pool in (("attraction_id", attr_ids), ("lodging_id", lodging_ids), ("service_id", service_ids), ("linked_service_id", service_ids)):
            ref = c.get(ref_key)
            if ref is not None and ref not in pool:
                err(f"{ctx}: {ref_key} {ref!r} not found in dataset")
        if not (c.get("attraction_id") or c.get("lodging_id") or c.get("service_id")):
            err(f"{ctx}: connection has no anchor (attraction/lodging/service)")
        if c.get("status") in ("corridor_only", "requires_confirmation", "provisional") and not c.get("verification_note"):
            warn(f"{ctx}: unverified status lacks verification_note")

    needs_verify = [
        f"attraction {a['id']} -> {a.get('requires_recheck')}"
        for a in attractions if a.get("requires_recheck")
    ]
    needs_verify += [
        f"service {s['id']} -> {s.get('requires_recheck')}"
        for s in transportation if s.get("requires_recheck")
    ]
    needs_verify += [
        f"lodging {p['id']} -> {p.get('limitations')}"
        for p in lodging if p.get("limitations")
    ]

    print("=== Validation report ===")
    print(f"attractions: {len(attractions)}  lodging: {len(lodging)}  "
          f"transportation: {len(transportation)}  connections: {len(connections)}")
    print(f"\nERRORS ({len(errors)}):")
    for e in errors:
        print(f"  [ERROR] {e}")
    print(f"\nWARNINGS ({len(warnings)}):")
    for w in warnings:
        print(f"  [warn]  {w}")
    print(f"\nRECORDS REQUIRING RE-VERIFICATION ({len(needs_verify)}):")
    for n in needs_verify:
        print(f"  - {n}")

    if errors:
        print("\nVALIDATION FAILED")
        sys.exit(1)
    print("\nVALIDATION PASSED (warnings are informational)")


if __name__ == "__main__":
    main()
