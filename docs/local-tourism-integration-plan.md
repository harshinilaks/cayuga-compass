# Local Tourism Data Integration Plan

Phase 2 integration of the five new research deliverables into the Cayuga Compass MVP.
This document was produced after auditing the existing codebase and reading all five
research files (extraction verified; no file unreadable).

## 1. Source documents

| Document | Type | Extracted | Contents |
|---|---|---|---|
| `research/STAMP_Deliverable1_Attractions.pptx.pdf` | Primary | Yes | 24 attractions in 6 groups; hours, admission, seasonality, walk/bike/TCAT access, source appendix (all links checked 2026-11-16) |
| `research/Josh Lee Deliverable 2 Transportation Research.pdf` | Primary | Yes | TCAT fares/service notes, regional connectors, paratransit, eRide, intercity bus/air, taxis, carshare, carpool programs, trails, bikeshare, EV charging |
| `research/Deliverable_2.pdf` | Primary | Yes | 11 lodging properties: 3 hotels/motels, 5 inns/B&Bs, 2 camping/glamping, 1 farm stay; sustainability practices, certification status, partnership notes |
| `research/Integration_Deliberable_11_16.pptx` | Strategy | Yes | Deployment channels (Visit Ithaca, hotel QR, Cornell, partner toolkit) and rollout order |
| `research/Sophie - Deliverable 2.docx` | Strategy | Yes | 9 potential partner organizations with collaboration ideas and feasibility |

## 2. Existing vs. missing

### Already in `backend/data/attractions.json` (15 records)
Research overlap: `johnson_museum`, `ithaca_commons`, `ithaca_falls`, `farmers_market`,
`taughannock_falls`, `cornell_dairy_bar`, `south_hill_cider`, `cayuga_waterfront_trail` (8).
These get upgraded in place with the new schema fields.

Legacy records kept (not deleted per spec): `cornell_university`, `triphammer_falls`,
`collegetown`, `moosewood`, `cayuga_lake`, `greek_peak`, `trumansburg_area` (7).

### New from research (16 attractions)
Cornell Botanic Gardens, McGraw Tower & Chimes, Cornell Lab of Ornithology, Cascadilla
Gorge Trail, The History Center, Sciencenter, Museum of the Earth, Cayuga Nature Center,
Buttermilk Falls SP, Robert H. Treman SP, Black Diamond Trail, Stewart Park, Ithaca
Children's Garden, Six Mile Creek Vineyard, Ithaca Beer Co., Cayuga Lake Wine Trail.
→ 31 records total.

### New datasets
- `lodging.json` — 11 properties (all from Deliverable_2)
- `transportation.json` — ~20 service records (TCAT, 3 regional connectors, Gadabout/ADA,
  eRide, Cornell C2C, OurBus, Greyhound/FlixBus, ITH airport, taxi/rideshare, Ithaca
  Carshare, Way2Go/GO ITHACA/Cornell RideShare, 5 trails, bikeshare, 3 EV charging records)
- `mobility_connections.json` — documented attraction↔service edges (e.g., Taughannock
  ↔ TCAT 22/23 summer-only; Farmers Market ↔ TCAT 13 + Waterfront Trail)

### Schema decision
Data stays in `backend/data/` (existing location, spec permits). Common fields added to
every record: `id`, `name`, `category`, `description`, `area`, `tags`/`interests`,
`source_references` (raw source strings preserved), `source_document`, `source_urls`,
`research_verified_date` ("2026-11-16" for attractions), `verification_status`
(`research_documented` | `provisional` | `unverified` | `independently_verified`),
`limitations`/`requires_recheck`. Existing fields (`verified`, `accessibility`, etc.)
are preserved for backward compatibility.

TCAT access is stored as an enum, preserving the research's four distinctions:
`year_round` (9), `summer_only` (3), `not_pinned_walkable` (6), `none_confirmed` (6).
Walkable ≠ transit-accessible. Museum of the Earth's Route 21 is flagged `provisional`
("from an older listing").

## 3. Backend work

- `api/lodging.py` (new): `GET /api/lodging`, `GET /api/lodging/{id}` — filters: type, area,
  walkable, sustainability_practices
- `api/transportation.py` (new): `GET /api/transportation`, `GET /api/transportation/{id}`
  — filters: scope (local/intercity), mode, seasonal, accessible
- `api/mobility.py` (new): `GET /api/mobility/connections` — optionally by attraction_id
- `api/attractions.py`: add `GET /{id}` + filters (category, area, interests, season,
  admission, walkable, tcat_access)
- `itineraries/generator.py`: new inputs `season_month`, `lodging_id`, `mobility`
  (walk/transit/car/bike); deterministic score = interest overlap (×3) + geographic
  proximity to lodging anchor (≤2) + seasonal suitability (0 or −∞ → flagged, not
  excluded) + mobility compatibility (≤2). Stops get `selection_reason` and
  `seasonal_warning`; itinerary gets `verification_notes`.
- `alternatives/matcher.py`: new `recommend(context)` producing qualitative,
  dataset-grounded suggestions (lodging-location aware, documented connections only);
  numerical savings only via the existing calculator when inputs support it.
- `services/agent/agent.py`: new tools `search_lodging`, `get_lodging_details`,
  `get_attraction_details`, `search_transportation`, `get_mobility_options`;
  strengthened system prompt (no fabricated routes/hours/fares/emissions).
- `POST /api/alternatives/recommend` endpoint.

## 4. Frontend work

- New `/explore` page with three sections (Attractions / Where to Stay / Getting Around):
  filter controls + detail cards (name, description, location, attributes, source link,
  verification/limitation notes). Reuses existing green Tailwind design.
- `/itineraries` page: season + lodging + mobility inputs; shows warnings and
  per-stop reasons.
- `/plan` page: optional lodging-property picker in step 2 feeding itinerary generation
  (maps property → closest factor only when supported; generic proxy clearly labeled).
- Nav updated to include Explore; no redesign.

## 5. Validation & tests

- `backend/scripts/validate_data.py`: duplicate IDs, required fields, malformed URLs,
  invalid categories/enums, broken cross-references, missing source metadata;
  prints a verification report.
- `tests/test_data_integrity.py`, `tests/test_itinerary_generator.py`,
  `tests/test_agent_tools.py` — per spec section 13. Existing calculator tests untouched.

## 6. Docs

- `docs/deployment-and-partnership-opportunities.md` — channel summary + technical
  implications (shareable URLs, embeddability, lightweight analytics, mobile UX,
  accessibility, maintainable datasets) + 9 potential partners flagged as *proposed*,
  never confirmed.
- `docs/local-data-maintenance.md` — how to update datasets, verification workflow.

## 7. Explicit non-goals (per spec)

No transit routing engine, no live schedules, no DB, no property-level lodging emissions
factors, no "certified green" labels the research doesn't support, no claiming proposed
partnerships are confirmed, no deletion of legacy records absent from new research.

## 8. Known extraction gaps / items to recheck

- Lodging: source URLs partially present in PDF (Statler news link, Camp Earth
  Connection, Scottland Yard); several entries cite "Visit Ithaca" without a URL.
- Transportation: no official URLs in the PDF for most services except tcatbus.com;
  booking requirements inferred from text (Gadabout "book in advance", C2C "reserve
  online", bikeshare "app").
- Attractions: `visit_duration` only where the source states one (Cayuga Nature Center
  ~1.5 hr, Buttermilk 1 hr gorge / 2–3 hr w/ rim, Taughannock gorge tours ~1.5 hr).
- Coordinates: only legacy records have them; new records get `null` coordinates unless
  a real lat/lon is known — no invented coordinates.
- eRide "started June 1, 2026 as a pilot" — stored with date + pilot flag.
