# Cayuga Compass Research Synthesis

## Document Overview

This document synthesizes the research deliverables from the Cornell Sustainability Consultants team for the Cayuga Compass project (deliverables produced under the STAMP program). The research includes visitor personas, emissions calculations, feature requirements, and UI design specifications.

---

## Research Deliverables Summary

### 1. Features Deliverable (`Features_Deliberable_11_2.pptx`)

**Contribution:** Visit Ithaca website analytics, feature specifications for the impact calculator and alternatives database, and proposed impact metrics.

**Key Findings:**
- Visit Ithaca had 606,833 sessions in 2024 (+11% vs 2023)
- 426,347 active users in 2024 (+8% vs 2023)
- 65,000+ partner referrals (+25% vs 2023)
- 4,500+ BookDirect lodging searches, 470 direct bookings
- Eclipse landing page: 6,622 organic sessions in Q2 2024, 67% clicked through to other pages

**Proposed Features:**
1. **Visit Impact Calculator**
   - Visitor inputs: home ZIP/city, travel mode, party size, nights stayed, lodging type, local mobility
   - Calculation: distance × mode factor, nights × lodging factor, local transport by mode
   - Output: trip footprint in kg CO2e, breakdown by category, comparison to average visitor, link to alternatives

2. **Database of Alternatives**
   - Categories: Getting here (intercity bus, carpooling, group shuttles), Lodging (green-certified, efficient hotels, longer stays), Getting around (TCAT, biking, walking, EV charging), Activities (walkable attractions, trails near bus routes, car-free itineraries)
   - Each entry includes: name, category, location, link, estimated emissions vs typical option, cost/convenience notes
   - Connected to calculator for swapping options and seeing savings

**Data Still Needed from Visit Ithaca:**
- Sessions by origin region/state, monthly
- Top pages and site-search terms
- Outbound clicks to TCAT, bus carriers, rentals
- Monthly traffic for seasonal peaks

**Success Metric Proposed:**
- kg CO2e avoided per dashboard user vs baseline trip
- Clicks to low-carbon alternatives vs 2024 web baseline (606,833 sessions)

---

### 2. Sophie's UI Deliverable (`Sophie Deliverable 11-2.pptx`)

**Contribution:** Four-step visitor calculator UI mockups and interaction design specifications.

**Visual Design:**
- Four-step stepper with progress indicators
- Trip summary panel showing cumulative emissions
- Clean, professional tourism-oriented aesthetic
- Forest green, sage, cream, white color palette

**Step 1 - Transportation:**
- Heading: "How are you getting to Ithaca?"
- Inputs: Travel mode (Plane, Car, Train, Bus, Rideshare, Mix), Origin city/ZIP, Number of travelers, Trip type (Round trip/One way)
- Trip summary panel shows: Transportation emissions, Stay (not added), Activities (not added)
- Note: "Travel is often the largest source of visitor-trip emissions"

**Step 2 - Accommodation:**
- Heading: "Where will you stay?"
- Inputs: Accommodation type (Hotel, Inn/B&B, Rental, Hostel, Camping, Friends/family), Number of nights, Number of rooms
- Trip summary updates with Stay emissions
- Note: "Stay thoughtfully - Look for local ownership, efficient operations, and credible sustainability practices"

**Step 3 - Activities & Local Travel:**
- Heading: "How will you get around, eat, and spend time in Tompkins County?"
- Inputs: Local transportation (TCAT bus, Rental car, Rideshare, Biking, Walking, Mix), Days using this transport, Activities planned (checkboxes: Hiking & nature, Water activities, Museums & culture, Wineries, Shopping, Events)
- Trip summary updates with Activities emissions
- Note: "Explore lighter - Local transit, plant-forward meals, and nature-based activities can support a lower-impact visit"

**Step 4 - Results:**
- Heading: "Your estimated carbon footprint"
- Display: Estimated trip total (kg CO2e), Per traveler emissions, Footprint breakdown by category (Transportation, Accommodation, Activities & local)
- Recommendations: "Take the bus", "Choose a thoughtful stay", "Eat local & plant-forward"
- Note: "Your choices shape the estimate. Compare alternatives and explore local sustainable tourism resources"

**Limitation:** The mockup shows example numerical values (192 kg CO2e total) that should not be hardcoded - these are placeholders only.

---

### 3. Itinerary Deliverable (`STAMP 11_2 Deliverable.docx`)

**Contribution:** Local tourism attractions, itinerary concepts, mobility alternatives, and sustainability recommendations.

**Tourism Attractions List (from Trumansburg tourism office):**
- Garretts Brewing Co.
- Finger Lakes Cider House
- Honeybee Embassy
- Bet The Farm Winery
- The Inn & Spa Gothic Eves
- The Quandary Escape Room
- Moore Family Farm
- Thirsty Owl Wine Company
- Johnson Museum of Art
- Trumansburg Conservatory

**Three Draft Itineraries:**

**Itinerary 1 - Campus Tour:**
- 10:00 am - Triphammer Falls
- 12:30 pm - Cornell Dairy Bar
- 2:00 pm - Johnson Museum
- 5:30 pm - Collegetown
- Carbon impact: Low
- Lower-impact opportunities: TCAT Route 81, walking, locally sourced meals

**Itinerary 2 - Summer Ithaca Experience:**
- 10:00 am - Farmers Market
- 11:00 am - South Hill Cider
- 1:00 pm - Moosewood Lunch
- 3:00 pm - Ithaca Falls
- 5:30 pm - Dinner downtown
- Carbon impact: Medium
- Lower-impact opportunities: Cayuga waterfront trail biking/walking, rideshare, Farmers Market recycle program, eco-certified dining

**Itinerary 3 - Winter Recreation:**
- 10:00 am - Skiing at Greek Peak
- 1:30 pm - Lunch downtown
- 3:30 pm - Cross-country skiing
- 6:30 pm - Ithaca Commons at night
- Carbon impact: High
- Lower-impact opportunities: Carpooling, ski shuttles, locally sourced winter produce

**Broader Sustainability Actions:**
- Driving between campus and downtown: Use TCAT Route 81 or walk
- Individual trips to attractions: Group activities geographically
- Restaurant dining: Choose seasonal, locally sourced meals, dine in with reusable dishware
- Disposable cups and utensils: Bring reusable water bottle

**Note:** Visit Ithaca suggested itineraries reference: https://www.visitithaca.com/blog/post/family-friendly-winter-getaway-in-the-ithaca-cortland-region/

---

### 4. Visitor Personas Deliverable (`Tompkins County Visitor Personas CSC STAMP NME Josh Lee.pptx`)

**Contribution:** Visitor segmentation, research statistics, three visitor personas, and travel behavior patterns.

**Source:** Future Partners, Tompkins County Visitor Profile Study (2024, published 2025)

**Key Statistics:**
- 54.4% of visitors from NY State
- 36.4% leisure-driven trips
- 70.9% arrive by personal vehicle
- 74.1% of overnight visitors stay in hotels/inns

**Three Visitor Personas:**

**Persona 1 - Regional Weekend Visitor:**
- Origin: NYC, Syracuse, Binghamton, Rochester (NY State/regional)
- Purpose: Festivals, events, weekend getaways
- Sustainable tourism opportunity: Expand intercity transit and connections to local attractions

**Persona 2 - Leisure Traveler:**
- Origin: Northeast U.S., major metros, Canada (out-of-region/international)
- Purpose: Nature, recreation, wineries, food, culture
- Sustainable tourism opportunity: Develop car-free itineraries, shuttles, and cycling connections

**Persona 3 - University Visitor:**
- Origin: NY, Northeast, nationwide, international (domestic/international)
- Purpose: Campus visits, conferences, family, sporting events
- Sustainable tourism opportunity: Improve TCAT access between campuses, hotels, and downtown

**Context:** 70.9% of visitors arrive by personal vehicle - a key finding for sustainable transportation alternatives.

---

### 5. Carbon Calculator Spreadsheet (`STAMP_CarbonCalculatorSheet.xlsx.pdf`)

**Contribution:** Comprehensive emissions-factor library, factor sources, formulas, scenario inputs, scenario outputs, comparison charts, and assumptions log. This is the primary reference for the carbon calculation engine.

**Emissions Factor Library (kg CO2e per unit):**

**Transportation Factors:**
- Passenger car (avg gasoline): 0.2986 vehicle-mile (Verified, EPA GHG Emission Factors Hub 2025)
- SUV/pickup/van: 0.3966 vehicle-mile (Verified, EPA GHG Emission Factors Hub 2025)
- Electric vehicle: 0.0328 vehicle-mile (Approximate, EPA Hub Table 6, eGRID NYUP × 0.3 kWh/mile assumption)
- Air - short haul (<300 mi): 0.2089 passenger-mile (Verified, EPA GHG Emission Factors Hub 2025)
- Air - medium haul (300-2300 mi): 0.1301 passenger-mile (Verified, EPA GHG Emission Factors Hub 2025)
- Air - long haul (>2300 mi): 0.1644 passenger-mile (Verified, EPA GHG Emission Factors Hub 2025)
- Intercity rail (Amtrak): 0.1504 passenger-mile (Verified, EPA GHG Emission Factors Hub 2025)
- Intercity/charter bus (coach): 0.0666 passenger-mile (Verified, EPA GHG Emission Factors Hub 2025)
- Local transit bus (TCAT): 0.0666 passenger-mile (Approximate, EPA national bus average as TCAT proxy)
- Walk/bike: 0.0000 passenger-mile (Zero direct emissions)

**Lodging Factors:**
- Hotel (US average): 16.1000 room-night (Approximate, UK DESNZ secondary source)
- Hotel (green-certified/efficient): 13.7000 room-night (Approximate, ~15% below US average based on CHSB-style benchmarking; replace with CHSB-derived figure when available)
- Hotel (CHSB Ithaca/upstate NY): Unavailable (Placeholder)
- Vacation rental/Airbnb: Unavailable (No standard source)
- Bed & breakfast/inn: Unavailable (No standard source)
- Campground: Unavailable (No standard source)
- Staying with friends/family: 0.0000 room-night (Zero incremental emissions assumed)

**Food Factors (kg CO2e per USD spent):**
- Full-service restaurant: 0.1940 (Verified, EPA Supply Chain GHG Emission Factors v1.3, NAICS 722511)
- Limited-service/fast casual: 0.2550 (Verified, EPA Supply Chain GHG Emission Factors v1.3, NAICS 722513)
- Cafe/snack bar: 0.1320 (Verified, EPA Supply Chain GHG Emission Factors v1.3, NAICS 722515)
- Bar/drinking place: 0.1320 (Verified, EPA Supply Chain GHG Emission Factors v1.3, NAICS 722410)

**Activity Factors (kg CO2e per USD spent):**
- Outdoor recreation (parks, gorges, trails): 0.2350 (Verified, EPA Supply Chain GHG Emission Factors v1.3, NAICS 713990)
- Museums & cultural attractions: 0.1360 (Verified, EPA Supply Chain GHG Emission Factors v1.3, NAICS 712110)
- Wineries & breweries: 0.1820 (Verified, EPA Supply Chain GHG Emission Factors v1.3, NAICS 312130; note: breweries are 0.274 NAICS 312120)
- Shopping (Commons, souvenirs): 0.1110 (Verified, EPA Supply Chain GHG Emission Factors v1.3, NAICS 453220)
- Boat/lake tours: 0.1620 (Verified, EPA Supply Chain GHG Emission Factors v1.3, NAICS 487210)
- Festivals & events: 0.0930 (Verified, EPA Supply Chain GHG Emission Factors v1.3, NAICS 711310)

**Global Settings:**
- Flight radiative forcing (RF) multiplier: 1.00 (decided to focus on CO2 only, non-CO2 flight effects excluded)

**Three Reference Scenarios:**

**Scenario A - Regional Weekend Visitor:**
- Origin: NYC + upstate NY (weighted avg)
- Party size: 2
- Nights: 1, Days: 2
- Arrival: Passenger car, 105 miles one-way, round trip, 1 vehicle
- Local driving: 30 miles total, passenger car
- Transit: 0 passenger-miles
- Lodging: Hotel (US average), 1 room
- Food: Full-service restaurant, $50/person/day
- Activities: Festivals & events $50, Shopping $30
- **Results:** Arrival 62.7, Local mobility 9.0, Lodging 16.1, Food 38.8, Activities 8.0, Total 134.5 kg CO2e
- Per person: 67.3 kg CO2e
- Per person per day: 33.6 kg CO2e

**Scenario B - Experience-Seeking Leisure Traveler:**
- Origin: Dallas (out-of-state metro, flies in)
- Party size: 2
- Nights: 2, Days: 3
- Arrival: Air - medium haul, 1,300 miles one-way, round trip, 0 vehicles (passenger mode)
- Local driving: 80 miles total, passenger car
- Transit: 0 passenger-miles
- Lodging: Hotel (US average), 1 room
- Food: Full-service restaurant, $80/person/day
- Activities: Wineries & breweries $120, Outdoor recreation $75
- **Results:** Arrival 676.5, Local mobility 23.9, Lodging 32.2, Food 93.1, Activities 39.5, Total 865.2 kg CO2e
- Per person: 432.6 kg CO2e
- Per person per day: 144.2 kg CO2e

**Scenario C - University-Connected Visitor:**
- Origin: Northeast (e.g. NJ/eastern PA)
- Party size: 2
- Nights: 2, Days: 3
- Arrival: Passenger car, 250 miles one-way, round trip, 1 vehicle
- Local driving: 40 miles total, passenger car
- Transit: 5 passenger-miles per person
- Lodging: Hotel (US average), 1 room
- Food: Full-service restaurant, $50/person/day
- Activities: Shopping $60, Festivals & events $60
- **Results:** Arrival 149.3, Local mobility 12.6, Lodging 32.2, Food 58.2, Activities 12.2, Total 264.6 kg CO2e
- Per person: 132.3 kg CO2e
- Per person per day: 44.1 kg CO2e

**Key Findings from Scenarios:**
- Flying dominates: Leisure Traveler's flight is 78% of trip footprint, making it over 6x the Regional Visitor
- Arrival travel is the largest bucket for every persona
- Food is the second-largest bucket
- Biggest lever: how visitors get to Tompkins County, more than what they do once here

**Calculation Formulas:**
- Arrival travel (vehicle modes): one-way distance × trip multiplier × number of vehicles × vehicle factor
- Arrival travel (passenger modes): one-way distance × trip multiplier × party size × passenger factor
- Local mobility: total local vehicle-miles × vehicle factor - transit miles per person × party size × transit factor
- Lodging: nights × rooms × lodging factor
- Food: spending per person per day × party size × days × food factor
- Activities: sum(activity spending for whole party × activity factor)
- Total: arrival + local mobility + lodging + food + activities

**Assumptions Log (selected):**
- Round-trip travel counted for all personas
- No radiative forcing for flights (CO2 only)
- Connecting flights modeled as great-circle distance origin to ITH
- Food counted as everything consumed on trip (not just increase over eating at home)
- Party size of 2 for every persona (placeholder)
- Persona 1 distance: weighted average of NYC 225, Syracuse 55, Binghamton 50, Rochester 90, Elmira-Corning 35 miles
- Food spend: 25% of party daily spending (assumption)
- Activity spend: 10% of party daily spending over trip (assumption)

---

### 6. Emissions Data Deliverable (`STAMP_EmissionsData.pptx`)

**Contribution:** Carbon model explanation, emissions categories, source confidence, visitor scenario results, and key findings.

**Carbon Buckets Mapped to Sources:**
- Arrival travel: EPA GHG Emission Factors Hub
- Local mobility: EPA GHG Emission Factors Hub
- Lodging: UK DESNZ GHG Conversion Factors
- Food: EPA Supply Chain GHG Emission Factors
- Activities: EPA Supply Chain GHG Emission Factors

**Key Findings (consistent with spreadsheet):**
- Totals per trip: 135, 865, and 265 kg CO2e
- Per person per day: 34, 144, and 44 kg CO2e
- Flying in dominates - Leisure Traveler's flight is 78% of trip
- Arrival travel is largest bucket for every persona
- Food is second-largest bucket
- Biggest lever: how visitors get to Tompkins County

**Method:**
- Round-trip travel
- Food consumed on the trip
- CO2 only (no non-CO2 flight effects)

---

## Confirmed Research Findings

### Visitor Profile
- 54.4% visitors from NY State
- 70.9% arrive by personal vehicle
- 74.1% of overnight visitors stay in hotels/inns
- 36.4% leisure-driven trips

### Emissions Model
- Five categories: Arrival travel, Local mobility, Lodging, Food, Activities
- Unit: kg CO2e
- Excludes non-CO2 aviation effects (RF multiplier = 1.0)
- Food and activity factors are spend-based (USD), not activity-count based
- Transportation factors: vehicle-mile for vehicles, passenger-mile for planes/trains/buses

### Key Emissions Insights
- Arrival travel is the largest emissions contributor for all personas
- Flying dramatically increases footprint (78% of Leisure Traveler's trip)
- Food is the second-largest emissions category
- Local mobility has relatively small impact compared to arrival travel

### Itinerary Insights
- Three draft itineraries: Campus Tour (low impact), Summer Ithaca Experience (medium), Winter Recreation (high)
- Sustainable alternatives: TCAT Route 81, walking/biking, geographic clustering, local food, reusable items
- Winter recreation has highest impact due to ~20-mile drive from downtown

---

## Proposed Product Features

### Core Features
1. **Four-step visitor calculator** (Sophie's design)
   - Step 1: Transportation (mode, origin, party size, trip type)
   - Step 2: Accommodation (type, nights, rooms)
   - Step 3: Activities & local travel (transport mode, days, activity interests)
   - Step 4: Results (total footprint, breakdown, recommendations)

2. **Deterministic carbon calculation engine**
   - Five-category emissions model
   - Structured emissions-factor registry
   - Three reference scenarios (personas)
   - Scenario comparison functionality

3. **Personalized itinerary generation**
   - Three seed itinerary templates
   - Interest-based filtering
   - Mobility constraint consideration
   - Geographic clustering

4. **Sustainable alternatives database**
   - Getting here alternatives (intercity bus, carpooling, group shuttles)
   - Lodging alternatives (green-certified, efficient hotels)
   - Getting around alternatives (TCAT, biking, walking, EV charging)
   - Activity alternatives (walkable attractions, trails near bus routes)

5. **Agentic AI travel assistant**
   - Tool-calling agent for trip planning
   - Integration with calculation engine
   - Itinerary generation support
   - Recommendations and explanations

### Secondary Features
- Persona selection with auto-population
- Methodology documentation
- Impact metrics tracking
- Visit Ithaca integration (future)

---

## Emissions Methodology

### Calculation Approach
- **Unit:** kg CO2e (carbon dioxide equivalent)
- **Scope:** CO2 only (non-CO2 aviation effects excluded)
- **Factors:** EPA GHG Emission Factors Hub, EPA Supply Chain GHG Emission Factors v1.3, UK DESNZ

### Five Emissions Categories

1. **Arrival Travel**
   - Vehicle modes: vehicle-mile factors (passenger car, SUV, EV)
   - Passenger modes: passenger-mile factors (air, rail, bus)
   - Flight distance categories: short (<300 mi), medium (300-2300 mi), long (>2300 mi)
   - Formula: distance × trip multiplier × (vehicles or party size) × factor

2. **Local Mobility**
   - Vehicle driving: total vehicle-miles × vehicle factor
   - Transit: passenger-miles per person × party size × transit factor
   - Formula: (local vehicle-miles × vehicle factor) - (transit miles × party size × transit factor)

3. **Lodging**
   - Hotel: 16.1 kg CO2e per room-night (US average)
   - Friends/family: 0 kg CO2e (no incremental emissions)
   - Other categories: factors unavailable
   - Formula: nights × rooms × lodging factor

4. **Food**
   - Spend-based factors (kg CO2e per USD)
   - Full-service: 0.194, Fast casual: 0.255, Cafe: 0.132, Bar: 0.132
   - Formula: spending per person per day × party size × days × food factor

5. **Activities**
   - Spend-based factors (kg CO2e per USD)
   - Outdoor recreation: 0.235, Museums: 0.136, Wineries: 0.182, Shopping: 0.111, Boat tours: 0.162, Events: 0.093
   - Formula: sum(activity spending for whole party × activity factor)

### Per-Person Metrics
- Per person: total emissions / party size
- Per person per day: total emissions / (party size × days)

---

## Visitor Personas

### Persona A - Regional Weekend Visitor
- **Origin:** NYC + upstate NY (weighted avg distance: 105 miles)
- **Party size:** 2
- **Stay:** 1 night, 2 days
- **Transportation:** Gasoline passenger car, round trip, 1 vehicle
- **Local:** 30 miles driving
- **Lodging:** Hotel, 1 room
- **Food:** Full-service restaurant, $50/person/day
- **Activities:** Festivals/events $50, Shopping $30
- **Expected footprint:** ~134.5 kg CO2e total, 67.3 per person, 33.6 per person per day
- **Sustainability opportunity:** Intercity transit, local attractions connections

### Persona B - Experience-Seeking Leisure Traveler
- **Origin:** Dallas, Texas (flies in)
- **Party size:** 2
- **Stay:** 2 nights, 3 days
- **Transportation:** Medium-haul flight, 1,300 miles one-way, round trip
- **Local:** 80 miles driving (rental car)
- **Lodging:** Hotel, 1 room
- **Food:** Full-service restaurant, $80/person/day
- **Activities:** Wineries $120, Outdoor recreation $75
- **Expected footprint:** ~865.2 kg CO2e total, 432.6 per person, 144.2 per person per day
- **Sustainability opportunity:** Car-free itineraries, shuttles, cycling connections

### Persona C - University-Connected Visitor
- **Origin:** Northeast (e.g. NJ/eastern PA)
- **Party size:** 2
- **Stay:** 2 nights, 3 days
- **Transportation:** Gasoline passenger car, 250 miles one-way, round trip, 1 vehicle
- **Local:** 40 miles driving, 5 transit passenger-miles per person
- **Lodging:** Hotel, 1 room
- **Food:** Full-service restaurant, $50/person/day
- **Activities:** Shopping $60, Events $60
- **Expected footprint:** ~264.6 kg CO2e total, 132.3 per person, 44.1 per person per day
- **Sustainability opportunity:** TCAT access between campuses, hotels, downtown

**Note:** These are illustrative scenarios, not statistically representative countywide averages.

---

## UI Requirements

### Visual Design
- **Color palette:** Forest green, sage, cream, white
- **Typography:** Clean, professional
- **Layout:** Rounded cards, spacious, tourism-oriented
- **Responsive:** Mobile and desktop

### Four-Step Calculator (Sophie's design)
- **Step 1 - Transportation:**
  - Heading: "How are you getting to Ithaca?"
  - Inputs: Travel mode dropdown, origin city/ZIP, number of travelers (+/-), trip type (round trip/one way)
  - Trip summary panel: Transportation, Stay (not added), Activities (not added)
  - Note: "Travel is often the largest source of visitor-trip emissions"

- **Step 2 - Accommodation:**
  - Heading: "Where will you stay?"
  - Inputs: Accommodation type dropdown, number of nights (+/-), number of rooms (+/-)
  - Trip summary updates with Stay emissions
  - Note: "Stay thoughtfully"

- **Step 3 - Activities & Local Travel:**
  - Heading: "How will you get around, eat, and spend time in Tompkins County?"
  - Inputs: Local transportation dropdown, days using this transport (+/-), activity checkboxes
  - Trip summary updates with Activities emissions
  - Note: "Explore lighter"

- **Step 4 - Results:**
  - Heading: "Your estimated carbon footprint"
  - Display: Total kg CO2e, per traveler, breakdown by category
  - Recommendations: Take the bus, Choose a thoughtful stay, Eat local & plant-forward
  - Note: "Your choices shape the estimate"

### Navigation
- Explore
- Plan Your Trip
- Sustainability
- Methodology

### Landing Page
- Headline: "Explore Ithaca Sustainably"
- Subheading: "Discover your trip's carbon footprint, explore local attractions, and plan a more sustainable visit to Tompkins County."
- Primary CTA: "Plan Your Trip"
- Secondary CTA: "Explore Sustainable Travel"
- Feature sections: Understand your impact, Discover Ithaca, Travel lighter, Personalized AI trip planning

---

## Open Research Questions

### Data Gaps
1. **Visit Ithaca Analytics Needed:**
   - Sessions by origin region/state, monthly
   - Top pages and site-search terms
   - Outbound clicks to TCAT, bus carriers, rentals
   - Monthly traffic for seasonal peaks

2. **Missing Emissions Factors:**
   - Hotel (CHSB Ithaca/upstate NY specific)
   - Vacation rental/Airbnb
   - Bed & breakfast/inn
   - Campground
   - TCAT-specific bus factor (currently using national proxy)
   - EV efficiency verification (0.3 kWh/mile assumption)

3. **Travel Distance Uncertainties:**
   - Connecting flight distances (currently modeled as great-circle)
   - Persona 1 distance weighting verification
   - Local travel distance estimates

4. **Spending Assumptions:**
   - Food spend: 25% of party daily spending (assumed)
   - Activity spend: 10% of party daily spending (assumed)
   - These percentages need validation

### Scope Clarifications
1. **Day-trippers:** Currently modeled as overnight trips only (nights = 0 for day trips)
2. **Party size:** Currently set to 2 for all personas (placeholder)
3. **Lodging types:** Friends/family set to 0, Airbnb/B&B left blank

### Methodology Decisions
1. **Baseline footprint:** To be built from Visitor Profile studies and Visit Ithaca web data
2. **Improvement metric:** kg CO2e avoided per dashboard user vs baseline trip
3. **Visit Ithaca integration:** Data request to be sent to Nick

---

## Data Limitations

### Emissions Factors
- **Provisional factors:** EV (0.0328), Hotel US average (16.1), TCAT (0.0666 as national proxy)
- **Unavailable factors:** Ithaca-specific hotel, vacation rental, B&B, camping, hostel
- **Wineries vs breweries:** Spreadsheet combines at 0.182, but notes brewery factor is 0.274 - distinction needs handling

### Travel Distances
- **Connecting flights:** Modeled as great-circle distance, real routings through hubs may be longer
- **Persona distances:** Weighted averages need verification with Visitor Profile Study origin shares

### Spending Data
- **Food/activity spending:** Derived from Visitor Profile Study daily spending with assumed percentages (25% food, 10% activities)
- **Spend-based factors:** EPA Supply Chain factors are economic-sector proxies, not direct measurements

### Geographic Scope
- **Attractions:** Some listed attractions may be outside Tompkins County (e.g., Greek Peak)
- **Local mobility:** TCAT route data and connectivity not fully verified

### Model Boundaries
- **CO2 only:** Non-CO2 aviation effects excluded (RF multiplier = 1.0)
- **Lifecycle emissions:** Not included (e.g., vehicle manufacturing, infrastructure)
- **Scope:** Travel emissions counted as total consumed on trip, not incremental over home baseline

---

## Conflicting Assumptions

### None Identified
The research documents are internally consistent. However, the following areas may require clarification:

1. **Persona party size:** Set to 2 for all personas as a placeholder - actual Visitor Profile Study may have different distributions
2. **Spend percentages:** 25% for food, 10% for activities are team assumptions, not from Visitor Profile Study
3. **Distance calculations:** Persona 1 uses weighted average of origin cities, but weight sources not documented
4. **Flight modeling:** Persona 2 flies from Dallas, but 58.2% of leisure visitors actually drive - the fly-in version is illustrative, not representative

---

## Next Steps for Implementation

1. **Preserve research files:** Keep all six deliverables in `research/` directory
2. **Initialize Git repository:** Set up monorepo structure
3. **Build emissions-factor registry:** JSON-based structured registry with verification status
4. **Implement carbon engine:** Python service with five-category calculation
5. **Create frontend:** Next.js with Sophie's four-step calculator design
6. **Build attractions dataset:** Structured JSON from itinerary research
7. **Implement itinerary service:** Deterministic generation based on interests
8. **Create alternatives database:** Lower-impact options from features research
9. **Add AI agent:** Tool-calling agent for trip planning assistance
10. **Regression testing:** Test against three persona scenarios (134.5, 865.2, 264.6 kg CO2e)

---

## Source Files

- `research/Features_Deliberable_11_2.pptx` - Feature research and specifications
- `research/Sophie Deliverable 11-2.pptx` - UI mockups and interaction design
- `research/STAMP 11_2 Deliverable.docx` - Itineraries and local attractions
- `research/Tompkins County Visitor Personas CSC STAMP NME Josh Lee.pptx` - Visitor personas and statistics
- `research/STAMP_CarbonCalculatorSheet.xlsx.pdf` - Emissions factors and calculations (primary reference)
- `research/STAMP_EmissionsData.pptx` - Carbon model explanation and findings
