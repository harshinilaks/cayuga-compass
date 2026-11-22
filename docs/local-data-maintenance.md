# Local Data Maintenance Guide

How to keep Cayuga Compass's local tourism datasets accurate over time.

## The datasets

| File | Contents | Primary source |
|---|---|---|
| `backend/data/attractions.json` | 31 attractions; 24 research-documented | `STAMP_Deliverable1_Attractions.pptx.pdf` (checked 2026-11-16) |
| `backend/data/lodging.json` | 11 lodging properties | `Deliverable_2.pdf` |
| `backend/data/transportation.json` | 24 transportation services | `Josh Lee Deliverable 2 Transportation Research.pdf` |
| `backend/data/mobility_connections.json` | Documented attraction/lodging ↔ service links | All three primary documents |
| `backend/data/alternatives.json` | Sustainable alternative ideas | Earlier research |
| `backend/data/emission_factors.json` | Carbon factors + settings | EPA / DESNZ |
| `backend/data/visitor_personas.json` | 3 visitor personas | Visitor profile research |
| `backend/data/itineraries.json` | Itinerary templates | Earlier research |

## Provenance fields (keep them honest)

Every record carries:

- `source_document` — which research file it came from
- `source_references` / `source_urls` — raw source strings and links, preserved verbatim
- `research_verified_date` — when sources were last checked
- `verification_status` — one of:
  - `research_documented` — stated in team research, not independently confirmed
  - `independently_verified` — confirmed against a primary source since
  - `provisional` — documented but known-stale or uncertain (e.g., Museum of the Earth's Route 21 "from an older listing")
  - `unverified` — claimed but not confirmed
- `requires_recheck` — field names that decay fastest (fares, hours, routes)
- `limitations` — free-text caveat shown to users

**Rules:**
- Never delete records just because a new document doesn't mention them.
- Never upgrade `verification_status` without a source you can cite.
- Prefer `null` over invented values. An unknown fare is `null`, not 0.
- Do not label anything "certified green" unless a current certification is documented.

## Editing workflow

1. Edit the JSON directly (valid JSON, UTF-8).
2. Run the validator:

   ```bash
   cd backend && python scripts/validate_data.py
   ```

   It checks: duplicate IDs, required fields, malformed URLs, invalid enum values,
   broken cross-references (nearby_attractions, mobility connections, emissions
   factor IDs), missing source metadata, and lists every record needing
   re-verification. Errors fail; warnings are informational.

3. Run tests: `pytest tests/ -v` — `test_data_integrity.py` will catch schema drift.

## What decays fastest (re-check each semester)

Per the research's own caution, confirm at least each semester:

- **TCAT**: fares, holiday closures, which routes serve parks (summer routes 22/23
  dates shift yearly), Cass Park stop seasonality, Route 21 status.
- **Attractions**: winter closure dates for gorge trails (Cascadilla ~late Nov–May,
  Buttermilk Gorge Trail mid-Nov–early May), Farmers Market winter location,
  Cornell break schedules, carousel season.
- **Transportation**: eRide pilot status, bikeshare pricing/availability, intercity
  fares and stop locations, airport airline routes.
- **Lodging**: sustainability claims and certification status — these are
  self-reported by properties, not independently verified.

## Updating seasonal fields

Seasonality lives in three places, kept deliberately explicit:

- `seasonality_notes` — human-readable, shown in UI warnings
- `closed_months` (attractions) — drives seasonal exclusion in the itinerary
  generator
- `tcat_access.status` — `summer_only` flags are compared against travel month
  (summer = June–August, constant `SUMMER_MONTHS` in
  `app/services/itineraries/generator.py`)

When you learn new dates, update all three.

## Adding a record

- Attractions: copy an existing entry; keep the same field shape. Include
  `tcat_access.status` even if `none_confirmed` — absence reads as "unknown".
- Lodging: set `emissions_factor_id` only to an ID that exists in
  `emission_factors.json`; otherwise `null` + explanatory `emissions_factor_note`.
- Transportation connections: use only statuses in the metadata block; anything
  short of `confirmed_year_round`/`walking_route` must carry a `verification_note`.

## Where the data is used

- `app/api/attractions.py`, `lodging.py`, `transportation.py`, `mobility.py` — serve it
- `app/services/itineraries/generator.py` — scoring uses tags, coordinates, seasonality, tcat_access, lodging anchor
- `app/services/alternatives/matcher.py` — `/recommend` reads lodging/transportation/connections
- `app/services/agent/agent.py` — agent tools read the same JSON files
