# Deployment & Partnership Opportunities

Derived from two strategy documents: `research/Integration_Deliberable_11_16.pptx`
(deployment strategy) and `research/Sophie - Deliverable 2.docx` (partnership strategy).

**Important:** every partnership listed here is *proposed* by the research team —
none are confirmed or approved. No outreach has been performed by this project.

## 1. Deployment channels (recommended order per research)

| Channel | Reach | Cost | Setup | Upkeep |
|---|---|---|---|---|
| Visit Ithaca website link/embed | Highest — 426K site users (2024, +8%) | Likely free | Low | Semester check-in |
| Hotel & Visitor Center QR cards | In-person, mid-trip | Printing | Medium (one deal per hotel) | Restock each semester |
| Cornell visitor integration | High on event weekends | Free | Medium (university approval) | Update before events |
| Local tourism partner toolkit | Broad but scattered | Printing | High (many partners) | Semester partner email |

Recommended rollout: Visit Ithaca link → hotel/visitor center QR → Cornell event
materials → partner toolkit.

### Technical implications for the product

- **Mobile-friendly UX** — QR scans arrive on phones; keep pages responsive and light.
- **Shareable trip-planning URLs** — consider encoding trip inputs in the URL so a QR
  link or shared link lands on a pre-filled plan.
- **Embeddability** — Visit Ithaca proposes embedding; keeping the app self-contained
  (no login, no server state) makes iframe embedding feasible later.
- **Lightweight analytics** — partner QR scans tracked via a short link; consider
  privacy-preserving, cookieless counters. Not implemented.
- **Accessibility** — the research flags accessibility as "hard to meet" for embedded
  dashboards; the Next.js app should target WCAG-friendly markup (labels, contrast,
  keyboard nav) before any external embed.
- **Maintainable tourism datasets** — upkeep is explicitly "keep the spreadsheet up to
  date"; our JSON datasets + `scripts/validate_data.py` are the technical analog.
- **Do NOT implement Looker Studio** — the research mentions it as a free hosting
  option, but this Next.js application is the product surface.

## 2. Potential partners (all unconfirmed)

| Partner | What they could offer | Feasibility (research) | Product relevance |
|---|---|---|---|
| Visit Ithaca | Distribution (site, visitor center, 90K-copy travel guide), waterfalls-check-in pass model | High | Primary distribution channel |
| Cornell Campus Sustainability Office | Review of emissions factors vs Cornell's GHG inventory; campus event promotion | High | Methodology credibility |
| Hotels & inns (start: Statler) | Per-room-night energy/water data → real lodging emission factors; front-desk QR | Medium | Would upgrade lodging dataset from generic proxies |
| NYS Parks (Finger Lakes region) | Visitation/parking data; stewardship messaging; signage rules apply | Medium | Crowd-spreading recommendations |
| Downtown Ithaca Alliance | Calculator link, visitor-map QR, business rewards | High | Downtown walkable itineraries (316K Commons visitors in 2025) |
| GO ITHACA | Local mode-share/trip-length data; car-free guidance content | High | Improve local-mobility estimates |
| Discover Cayuga Lake | Eco-cruise recommendations; May–Oct only | High | Seasonal low-impact activity listing |
| Finger Lakes Land Trust | Preserve/trail listings incl. accessible trails; approval needed for sensitive sites | High | Quieter alternatives to crowded gorges |
| TCAT | Fleet fuel/ridership data → local per-passenger emission factors instead of national proxy | Medium | Would make transit comparisons Ithaca-specific |

### Data-driven partnership benefits already visible in the codebase

- TCAT ridership data → replace `0.0666 kg CO2e/passenger-mile` proxy in
  `emission_factors.json` and `itineraries/generator.py`.
- Hotel utility data → replace `lodging_hotel_us_average` proxy with property-level
  factors where partners provide them.
- Land Trust preserve list → a new "conservation itineraries" attraction category
  (requires partner approval for sensitive sites).

## 3. Explicitly out of scope

- Contacting or committing to any organization.
- Building partner-specific integrations before approval.
- Replacing the web app with an embedded dashboard.
