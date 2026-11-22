# Demonstration Journeys

Three realistic end-to-end flows for demoing the Phase 2 build. Each exercises the
new datasets, seasonal logic, and verification transparency.

## Journey 1 — Car-free Cornell visit (walking + transit)

**Visitor:** staying at the Statler Hotel, 2 nights, interested in museums, campus,
and local food; prefers walking and TCAT.

- `/explore` → "Where to Stay" → Statler shows documented practices +
  *2014 Good Earthkeeping Award (historical)* — not labeled "certified green".
- `/itineraries`: interests museums/shopping, 2 days, transit, month = July,
  lodging = Statler. Expect: Johnson Museum, Botanic Gardens, Dairy Bar, Commons,
  Farmers Market — each stop shows *why* it was picked and documented connections.
- `/plan`: select Statler in step 2 → note says generic hotel proxy (16.1 kg) applies.
- Agent: *"I'm staying at the Statler and want to explore without a car."* →
  deterministic fallback returns Statler details; LLM mode calls `search_lodging`,
  `search_attractions`, `get_mobility_options`, `generate_itinerary`.

## Journey 2 — December waterfalls (seasonality enforcement)

**Visitor:** wants waterfalls in December, staying downtown (Canopy by Hilton).

- `/itineraries`: interests hiking, 1 day, walking, month = December, lodging =
  Canopy → Cascadilla Gorge is **excluded** and listed under
  `excluded_seasonal` with a warning; Buttermilk appears with a
  "Gorge Trail closes mid-Nov–early May" flag; Ithaca Falls recommended as the
  year-round in-city option.
- `/explore` → season filter "winter" hides summer-only transit attractions.
- Agent: *"Visiting in December and want to see waterfalls"* → tools surface
  seasonal closure notes + links to parks.ny.gov.

## Journey 3 — NYC visitor comparing arrival modes (quantified savings)

**Visitor:** coming from New York City, driving a gas car vs. taking the bus.

- `/plan`: origin "New York City, NY" → distance auto-looked up via OSM/OSRM;
  step 4 auto-calls `/api/alternatives/generate` → "Intercity Bus" alternative with
  computed `savings_kg` from the deterministic engine.
- `/api/alternatives/recommend` with `origin: "New York City, NY"` surfaces
  documented options: OurBus (4–6 daily, $25–45), Greyhound/FlixBus ($34–59),
  Cornell Campus-to-Campus — each flagged as needing fare confirmation.
- Agent: *"Would taking a bus instead of driving reduce my footprint?"* →
  deterministic path calculates a real comparison; LLM path calls
  `search_transportation(scope=intercity)` then `compare_trip_scenarios`.

## What each journey demonstrates

| | Datasets | Seasonality | Verification transparency | Calculator |
|---|---|---|---|---|
| J1 | lodging + connections | — | historical award ≠ certification | generic proxy flagged |
| J2 | attractions + closures | excluded_seasonal + warnings | seasonal notes per stop | — |
| J3 | transportation + alternatives | — | fare "requires_recheck" flags | real comparison |
