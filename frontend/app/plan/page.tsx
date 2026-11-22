'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type TripData = {
  travelMode: string;
  origin: string;
  partySize: number;
  tripType: 'round' | 'one-way';
  oneWayDistance: number;
  vehicles: number;
  accommodationType: string;
  nights: number;
  rooms: number;
  localTransport: string;
  localTransportDays: number;
  activities: string[];
  localDrivingMiles: number;
  transitMilesPerPerson: number;
  days: number;
  foodType: string;
  foodSpendPerPersonPerDay: number;
  foodCategories: { type: string; spend: number }[];
  activitySpend: Record<string, number>;
};

export default function PlanPage() {
  const [step, setStep] = useState(1);
  const [tripData, setTripData] = useState<TripData>({
    travelMode: 'car',
    origin: 'New York City, NY',
    partySize: 2,
    tripType: 'round',
    oneWayDistance: 0,
    vehicles: 1,
    accommodationType: 'hotel',
    nights: 1,
    rooms: 1,
    localTransport: 'car',
    localTransportDays: 1,
    activities: [],
    localDrivingMiles: 0,
    transitMilesPerPerson: 0,
    days: 1,
    foodType: 'full_service',
    foodSpendPerPersonPerDay: 50,
    foodCategories: [{ type: 'full_service', spend: 50 }],
    activitySpend: {},
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    arrival: number;
    local_mobility: number;
    lodging: number;
    food: number;
    activities: number;
    total: number;
    per_person: number;
    per_person_per_day: number;
    missing_factors: string[];
    unverified_factors: string[];
  } | null>(null);
  const [partialResults, setPartialResults] = useState<{
    arrival: number;
    lodging: number;
    activities_total: number;
    total: number;
  }>({ arrival: 0, lodging: 0, activities_total: 0, total: 0 });
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<string | null>(null);
  const [personas, setPersonas] = useState<any[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [attractions, setAttractions] = useState<any[]>([]);
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [alternatives, setAlternatives] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/personas/')
      .then(res => res.json())
      .then(data => setPersonas(data.personas || []))
      .catch(() => {});
    fetch('http://localhost:8000/api/attractions/')
      .then(res => res.json())
      .then(data => setAttractions(data.attractions || []))
      .catch(() => {});
  }, []);

  const applyPersona = (personaId: string) => {
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;
    setSelectedPersona(personaId);
    setTripData(prev => ({
      ...prev,
      origin: persona.origin,
      partySize: persona.party_size,
      nights: persona.nights,
      days: persona.days,
      travelMode: persona.arrival.mode === 'transport_passenger_car_gasoline' ? 'car' :
                  persona.arrival.mode === 'transport_air_medium_haul' ? 'air' :
                  persona.arrival.mode === 'transport_air_short_haul' ? 'air' :
                  persona.arrival.mode === 'transport_air_long_haul' ? 'air' : 'car',
      oneWayDistance: persona.arrival.one_way_distance_miles,
      tripType: persona.arrival.round_trip ? 'round' : 'one-way',
      vehicles: persona.arrival.vehicles || 1,
      accommodationType: 'hotel',
      rooms: persona.lodging.rooms,
      localDrivingMiles: persona.local_mobility.driving_miles,
      transitMilesPerPerson: persona.local_mobility.transit_passenger_miles_per_person,
      foodType: 'full_service',
      foodSpendPerPersonPerDay: persona.food.spending_per_person_per_day,
      activitySpend: Object.fromEntries(
        persona.activities.map((a: any) => [
          a.category === 'activity_festivals_events' ? 'events' :
          a.category === 'activity_shopping' ? 'shopping' :
          a.category === 'activity_wineries' ? 'wineries' :
          a.category === 'activity_outdoor_recreation' ? 'hiking' :
          a.category === 'activity_museums' ? 'museums' : 'hiking',
          a.spending_whole_party
        ])
      ),
      activities: persona.activities.map((a: any) =>
        a.category === 'activity_festivals_events' ? 'events' :
        a.category === 'activity_shopping' ? 'shopping' :
        a.category === 'activity_wineries' ? 'wineries' :
        a.category === 'activity_outdoor_recreation' ? 'hiking' :
        a.category === 'activity_museums' ? 'museums' : 'hiking'
      ),
    }));
  };

  const transportationModes = [
    { id: 'air', label: 'Plane', icon: '✈' },
    { id: 'car', label: 'Car', icon: '▰' },
    { id: 'suv', label: 'SUV / Van', icon: '▤' },
    { id: 'ev', label: 'Electric Vehicle', icon: '⚡' },
    { id: 'train', label: 'Train', icon: '▥' },
    { id: 'bus', label: 'Bus', icon: '▥' },
    { id: 'rideshare', label: 'Rideshare', icon: '⌁' },
  ];

  const accommodationTypes = [
    { id: 'hotel', label: 'Hotel', icon: '▣' },
    { id: 'inn', label: 'Inn / B&B', icon: '⌂' },
    { id: 'rental', label: 'Rental', icon: '⌂' },
    { id: 'hostel', label: 'Hostel', icon: '▤' },
    { id: 'camping', label: 'Camping', icon: '△' },
    { id: 'family', label: 'Friends / family', icon: '♧' },
  ];

  const localTransportOptions = [
    { id: 'tcat', label: 'TCAT bus', icon: '▥' },
    { id: 'car', label: 'Rental car', icon: '▰' },
    { id: 'rideshare', label: 'Rideshare', icon: '⌁' },
    { id: 'bike', label: 'Biking', icon: '♧' },
    { id: 'walk', label: 'Walking', icon: '♙' },
  ];

  const activityOptions = [
    { id: 'hiking', label: 'Hiking & nature' },
    { id: 'water', label: 'Water activities' },
    { id: 'museums', label: 'Museums & culture' },
    { id: 'wineries', label: 'Wineries' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'events', label: 'Events' },
  ];

  const getArrivalMode = () => {
    if (tripData.travelMode === 'air') {
      if (tripData.oneWayDistance < 300) return 'transport_air_short_haul';
      if (tripData.oneWayDistance <= 2300) return 'transport_air_medium_haul';
      return 'transport_air_long_haul';
    }
    if (tripData.travelMode === 'car') return 'transport_passenger_car_gasoline';
    if (tripData.travelMode === 'suv') return 'transport_suv_pickup_van';
    if (tripData.travelMode === 'ev') return 'transport_electric_vehicle';
    if (tripData.travelMode === 'train') return 'transport_intercity_rail';
    if (tripData.travelMode === 'bus') return 'transport_intercity_bus';
    if (tripData.travelMode === 'rideshare') return 'transport_passenger_car_gasoline';
    return 'transport_passenger_car_gasoline';
  };

  const getLodgingFactor = () => {
    switch (tripData.accommodationType) {
      case 'hotel': return 'lodging_hotel_us_average';
      case 'inn': return 'lodging_bed_breakfast';
      case 'rental': return 'lodging_vacation_rental';
      case 'hostel': return 'lodging_unavailable';
      case 'camping': return 'lodging_campground';
      case 'family': return 'lodging_friends_family';
      default: return 'lodging_hotel_us_average';
    }
  };

  const buildInputs = () => ({
    arrival_mode: getArrivalMode(),
    one_way_distance_miles: tripData.oneWayDistance,
    round_trip: tripData.tripType === 'round',
    vehicles: tripData.vehicles,
    party_size: tripData.partySize,
    local_driving_miles: tripData.localDrivingMiles,
    local_vehicle_type: 'transport_passenger_car_gasoline',
    transit_passenger_miles_per_person: tripData.transitMilesPerPerson,
    lodging_type: getLodgingFactor(),
    nights: tripData.nights,
    rooms: tripData.rooms,
    food_type: 'food_full_service',
    food_spending_per_person_per_day: 0,
    food_categories: tripData.foodCategories
      .filter(c => c.spend > 0)
      .map(c => ({
        type: c.type === 'full_service' ? 'food_full_service' :
              c.type === 'fast_casual' ? 'food_fast_casual' :
              c.type === 'cafe' ? 'food_cafe' :
              c.type === 'bar' ? 'food_bar' :
              'food_full_service',
        spending_per_person_per_day: c.spend,
      })),
    days: tripData.days,
    activities: Object.entries(tripData.activitySpend)
      .filter(([_, spend]) => spend > 0)
      .map(([category, spend]) => ({
        category: category === 'hiking' || category === 'water' ? 'activity_outdoor_recreation' :
                  category === 'museums' ? 'activity_museums' :
                  category === 'wineries' ? 'activity_wineries' :
                  category === 'shopping' ? 'activity_shopping' :
                  category === 'events' ? 'activity_festivals_events' :
                  'activity_outdoor_recreation',
        spending_whole_party: spend,
      })),
  });

  const calculatePartial = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/emissions/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildInputs()),
      });
      const data = await response.json();
      setResults(null);
      setPartialResults({
        arrival: data.arrival,
        lodging: data.lodging,
        activities_total: data.local_mobility + data.food + data.activities,
        total: data.total,
      });
    } catch (error) {
      console.error('Partial calculation error:', error);
    }
  };

  const calculateFootprint = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/emissions/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildInputs()),
      });
      const data = await response.json();
      setResults(data);
      await generateAlternative(data);
      setStep(4);
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating footprint. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const generateAlternative = async (baseline: any) => {
    try {
      const response = await fetch('http://localhost:8000/api/alternatives/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseline: buildInputs() }),
      });
      const data = await response.json();

      const itineraryRes = await fetch('http://localhost:8000/api/itineraries/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: tripData.activities,
          days: tripData.days,
          mobility: 'transit',
          attraction_ids: selectedAttractions,
        }),
      });
      const itineraryData = await itineraryRes.json();

      setAlternatives({
        ...data,
        itinerary: itineraryData,
      });
    } catch (e) {
      console.error('Alternative generation error:', e);
    }
  };

  const lookupDistance = async (origin: string, travelMode: string) => {
    if (!origin.trim()) return;
    setDistanceLoading(true);
    setDistanceInfo(null);
    try {
      const isFlight = travelMode === 'air';
      const mode = isFlight ? 'flying' : 'driving';
      const response = await fetch(
        `http://localhost:8000/api/distance/?origin=${encodeURIComponent(origin)}&mode=${mode}`
      );
      const data = await response.json();
      if (response.ok) {
        setTripData((prev) => ({ ...prev, oneWayDistance: data.distance_miles }));
        setDistanceInfo(`${data.distance_miles} miles from ${data.destination} (${data.source})`);
      } else {
        setDistanceInfo(data.detail || 'Could not find that location');
      }
    } catch (error) {
      setDistanceInfo('Distance lookup unavailable');
    } finally {
      setDistanceLoading(false);
    }
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const distanceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (step === 4) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      calculatePartial();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tripData.travelMode,
    tripData.oneWayDistance,
    tripData.tripType,
    tripData.vehicles,
    tripData.partySize,
    tripData.accommodationType,
    tripData.nights,
    tripData.rooms,
    tripData.localDrivingMiles,
    tripData.transitMilesPerPerson,
    tripData.localTransportDays,
    tripData.days,
    tripData.activities,
    tripData.activitySpend,
    tripData.foodCategories,
    step,
  ]);

  // Distance lookup when origin or travel mode changes
  useEffect(() => {
    if (distanceDebounceRef.current) clearTimeout(distanceDebounceRef.current);
    if (!tripData.origin.trim()) {
      setDistanceInfo(null);
      return;
    }
    distanceDebounceRef.current = setTimeout(() => {
      lookupDistance(tripData.origin, tripData.travelMode);
    }, 800);
    return () => {
      if (distanceDebounceRef.current) clearTimeout(distanceDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripData.origin, tripData.travelMode]);

  const nextStep = async () => {
    if (step === 3) {
      calculateFootprint();
    } else {
      setStep(step + 1);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'How are you getting to Ithaca?';
      case 2: return 'Where will you stay?';
      case 3: return 'Activities & local travel';
      case 4: return 'Your estimated carbon footprint';
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return 'Tell us about your main mode of travel to the destination.';
      case 2: return 'Tell us about your accommodation in Ithaca.';
      case 3: return 'How will you get around, eat, and spend time in Tompkins County?';
      case 4: return 'Here&apos;s the estimated impact of your trip to Ithaca.';
      default: return '';
    }
  };

  const getStepNote = () => {
    switch (step) {
      case 1: return 'Travel is often the largest source of visitor-trip emissions.';
      case 2: return 'Look for local ownership, efficient operations, and credible sustainability practices.';
      case 3: return 'Local transit, plant-forward meals, and nature-based activities can support a lower-impact visit.';
      case 4: return 'Your choices shape the estimate. Compare alternatives and explore local sustainable tourism resources.';
      default: return '';
    }
  };

  const getNoteLabel = () => {
    switch (step) {
      case 1: return 'A quick note';
      case 2: return 'Stay thoughtfully';
      case 3: return 'Explore lighter';
      case 4: return 'What this means';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8 text-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Explore</Link>
              <Link href="/plan" className="text-gray-900 font-medium">Plan your trip</Link>
              <Link href="/methodology" className="text-gray-600 hover:text-gray-900">Sustainability</Link>
            </div>
            <Link href="/plan" className="bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
              Plan a visit →
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Step Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                      s === step ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && <div className="w-6 h-0.5 bg-gray-200" />}
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500">
              STEP {step} OF 4
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{getStepTitle()}</h1>
          <p className="text-sm text-gray-600">{getStepSubtitle()}</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg p-6">
            {step === 1 && (
              <div className="space-y-5">
                {personas.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Or start with a visitor persona:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {personas.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => applyPersona(p.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            selectedPersona === p.id
                              ? 'bg-green-700 text-white'
                              : 'bg-white text-green-700 border border-green-300 hover:bg-green-100'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travel mode</label>
                  <p className="text-xs text-gray-500 mb-2">Choose the main way you&apos;ll arrive.</p>
                  <select
                    value={tripData.travelMode}
                    onChange={(e) => setTripData({ ...tripData, travelMode: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    {transportationModes.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.icon} {mode.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Where are you traveling from?</label>
                  <input
                    type="text"
                    value={tripData.origin}
                    onChange={(e) => setTripData({ ...tripData, origin: e.target.value })}
                    placeholder="New York City, NY"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                  {distanceLoading && (
                    <p className="text-xs text-blue-600 mt-1">Looking up distance...</p>
                  )}
                  {distanceInfo && (
                    <p className="text-xs text-green-600 mt-1">{distanceInfo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">One-way distance (miles)</label>
                  <input
                    type="number"
                    value={tripData.oneWayDistance || ''}
                    onChange={(e) => setTripData({ ...tripData, oneWayDistance: parseFloat(e.target.value) || 0 })}
                    placeholder="Auto-filled from origin"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-filled when you enter an origin, or enter manually.</p>
                  {tripData.travelMode === 'air' && tripData.oneWayDistance > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {tripData.oneWayDistance < 300 ? 'Short haul (<300 mi)' :
                       tripData.oneWayDistance <= 2300 ? 'Medium haul (300–2,300 mi)' :
                       'Long haul (>2,300 mi)'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of travelers</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setTripData({ ...tripData, partySize: Math.max(1, tripData.partySize - 1) })}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      −
                    </button>
                    <span className="text-base font-medium w-6 text-center">{tripData.partySize}</span>
                    <button
                      onClick={() => setTripData({ ...tripData, partySize: tripData.partySize + 1 })}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip type</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="round"
                        checked={tripData.tripType === 'round'}
                        onChange={(e) => setTripData({ ...tripData, tripType: e.target.value as 'round' | 'one-way' })}
                        className="mr-2"
                      />
                      Round trip
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="one-way"
                        checked={tripData.tripType === 'one-way'}
                        onChange={(e) => setTripData({ ...tripData, tripType: e.target.value as 'round' | 'one-way' })}
                        className="mr-2"
                      />
                      One way
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={nextStep}
                    className="bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-800 transition text-sm"
                  >
                    Next: Your stay →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your accommodation</label>
                  <p className="text-xs text-gray-500 mb-2">Select the type that best describes your stay.</p>
                  <select
                    value={tripData.accommodationType}
                    onChange={(e) => setTripData({ ...tripData, accommodationType: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    {accommodationTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                  {tripData.accommodationType !== 'hotel' && tripData.accommodationType !== 'family' && (
                    <p className="text-xs text-yellow-600 mt-2 bg-yellow-50 p-2 rounded">
                      ⚠ No verified emissions factor available for this lodging type. It will be flagged as an incomplete estimate.
                    </p>
                  )}
                  {tripData.accommodationType === 'hotel' && (
                    <p className="text-xs text-green-600 mt-2">Using US average hotel factor (16.1 kg CO₂e/room-night)</p>
                  )}
                  {tripData.accommodationType === 'family' && (
                    <p className="text-xs text-green-600 mt-2">Zero incremental emissions assumed</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of nights</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setTripData({ ...tripData, nights: Math.max(0, tripData.nights - 1) })}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      −
                    </button>
                    <span className="text-base font-medium w-6 text-center">{tripData.nights}</span>
                    <button
                      onClick={() => setTripData({ ...tripData, nights: tripData.nights + 1 })}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of rooms</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setTripData({ ...tripData, rooms: Math.max(1, tripData.rooms - 1) })}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      −
                    </button>
                    <span className="text-base font-medium w-6 text-center">{tripData.rooms}</span>
                    <button
                      onClick={() => setTripData({ ...tripData, rooms: tripData.rooms + 1 })}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={nextStep}
                    className="bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-800 transition text-sm"
                  >
                    Next: Activities →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Local transportation</label>
                  <p className="text-xs text-gray-500 mb-2">Choose your main way of getting around.</p>
                  <select
                    value={tripData.localTransport}
                    onChange={(e) => setTripData({ ...tripData, localTransport: e.target.value })}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    {localTransportOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Days using this transport</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setTripData({ ...tripData, localTransportDays: Math.max(1, tripData.localTransportDays - 1) })}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      −
                    </button>
                    <span className="text-base font-medium w-6 text-center">{tripData.localTransportDays}</span>
                    <button
                      onClick={() => setTripData({ ...tripData, localTransportDays: tripData.localTransportDays + 1 })}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Days in Tompkins County</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setTripData({ ...tripData, days: Math.max(1, tripData.days - 1) })}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      −
                    </button>
                    <span className="text-base font-medium w-6 text-center">{tripData.days}</span>
                    <button
                      onClick={() => setTripData({ ...tripData, days: tripData.days + 1 })}
                      className="w-7 h-7 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Local driving miles (total)</label>
                  <input
                    type="number"
                    value={tripData.localDrivingMiles || ''}
                    onChange={(e) => setTripData({ ...tripData, localDrivingMiles: parseFloat(e.target.value) || 0 })}
                    placeholder="30"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transit passenger-miles per person</label>
                  <input
                    type="number"
                    value={tripData.transitMilesPerPerson || ''}
                    onChange={(e) => setTripData({ ...tripData, transitMilesPerPerson: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Food & Dining</h3>
                  <div className="space-y-3">
                    {tripData.foodCategories.map((cat, i) => (
                      <div key={i} className="grid grid-cols-2 gap-3 items-end">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Restaurant type</label>
                          <select
                            value={cat.type}
                            onChange={(e) => {
                              const updated = [...tripData.foodCategories];
                              updated[i].type = e.target.value;
                              setTripData({ ...tripData, foodCategories: updated });
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="full_service">Full-service</option>
                            <option value="fast_casual">Fast casual</option>
                            <option value="cafe">Cafe / snack bar</option>
                            <option value="bar">Bar / drinking place</option>
                          </select>
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">$ per person per day</label>
                            <input
                              type="number"
                              value={cat.spend || ''}
                              onChange={(e) => {
                                const updated = [...tripData.foodCategories];
                                updated[i].spend = parseFloat(e.target.value) || 0;
                                setTripData({ ...tripData, foodCategories: updated });
                              }}
                              placeholder="50"
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          {tripData.foodCategories.length > 1 && (
                            <button
                              onClick={() => {
                                const updated = tripData.foodCategories.filter((_, idx) => idx !== i);
                                setTripData({ ...tripData, foodCategories: updated });
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg text-sm"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setTripData({ ...tripData, foodCategories: [...tripData.foodCategories, { type: 'fast_casual', spend: 0 }] })}
                      className="text-sm text-green-700 hover:text-green-800 font-medium"
                    >
                      + Add another food category
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Attractions to visit</h3>
                  <p className="text-xs text-gray-500 mb-3">Select specific attractions you'd like to include in your itinerary.</p>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {attractions.map((a) => (
                      <label key={a.id} className="flex items-center p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedAttractions.includes(a.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAttractions([...selectedAttractions, a.id]);
                            } else {
                              setSelectedAttractions(selectedAttractions.filter(id => id !== a.id));
                            }
                          }}
                          className="mr-2"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{a.name}</div>
                          <div className="text-xs text-gray-500">{a.area} · {a.category}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Activities</h3>
                  <div className="space-y-3">
                    {activityOptions.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <label className="flex items-center flex-1 p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={tripData.activities.includes(activity.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTripData({ ...tripData, activities: [...tripData.activities, activity.id] });
                              } else {
                                setTripData({ ...tripData, activities: tripData.activities.filter((a) => a !== activity.id), activitySpend: { ...tripData.activitySpend, [activity.id]: 0 } });
                              }
                            }}
                            className="mr-2"
                          />
                          {activity.label}
                        </label>
                        {tripData.activities.includes(activity.id) && (
                          <input
                            type="number"
                            value={tripData.activitySpend[activity.id] || ''}
                            onChange={(e) => setTripData({ ...tripData, activitySpend: { ...tripData.activitySpend, [activity.id]: parseFloat(e.target.value) || 0 } })}
                            placeholder="$ spend"
                            className="w-24 p-2 border border-gray-300 rounded-lg text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Enter estimated spending for your whole party.</p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={nextStep}
                    disabled={loading}
                    className="bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-800 transition text-sm disabled:opacity-50"
                  >
                    {loading ? 'Calculating...' : 'See my results →'}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && results && (
              <div className="space-y-5">
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {results.total.toFixed(0)}
                  </div>
                  <div className="text-gray-600 text-sm">kg CO₂e</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Estimated trip total
                  </div>
                  <div className="text-base text-gray-700 mt-1">
                    {results.per_person.toFixed(0)} kg CO₂e per traveler
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">FOOTPRINT BREAKDOWN</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Transportation</span>
                      <span className="font-medium text-gray-900">{results.arrival.toFixed(0)} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Accommodation</span>
                      <span className="font-medium text-gray-900">{results.lodging.toFixed(0)} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Activities & local</span>
                      <span className="font-medium text-gray-900">{(results.local_mobility + results.food + results.activities).toFixed(0)} kg</span>
                    </div>
                  </div>
                  {results.missing_factors && results.missing_factors.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-700 font-medium">
                        ⚠ Incomplete estimate: {results.missing_factors.join(', ')}
                      </p>
                    </div>
                  )}
                  {results.unverified_factors && results.unverified_factors.length > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700 font-medium">
                        ℹ Approximate factors used: {results.unverified_factors.join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                {alternatives && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Lower-carbon alternatives</h3>
                    {alternatives.alternatives?.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {alternatives.alternatives.map((alt: any, i: number) => (
                          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium text-gray-900">{alt.name}</div>
                                <div className="text-xs text-gray-600">{alt.description}</div>
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                alt.feasibility === 'high' ? 'bg-green-100 text-green-700' :
                                alt.feasibility === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {alt.feasibility}
                              </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                              <div className="text-sm">
                                <span className="text-gray-600">Footprint: </span>
                                <span className="font-medium">{alt.footprint.total.toFixed(1)} kg</span>
                              </div>
                              <div className="text-sm font-medium text-green-700">
                                {alt.savings_kg > 0 ? `Save ${alt.savings_kg} kg (${alt.savings_pct}%)` : 'No savings'}
                              </div>
                            </div>
                            {alt.tradeoffs && (
                              <p className="text-xs text-gray-500 mt-2">⚠ {alt.tradeoffs}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No lower-carbon alternatives found for your trip.</p>
                    )}

                    {alternatives.itinerary && alternatives.itinerary.stops?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Suggested itinerary:</p>
                        <div className="space-y-2">
                          {alternatives.itinerary.stops.map((stop: any, i: number) => (
                            <div key={i}>
                              {(i === 0 || stop.day !== alternatives.itinerary.stops[i - 1].day) && (
                                <p className={`text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 0 ? 'mb-1' : 'mt-4 mb-1'}`}>
                                  Day {stop.day || 1}
                                </p>
                              )}
                              {i > 0 && stop.transport_note && (
                                <p className="text-xs text-gray-500 pl-3 pb-1">
                                  ↓ {stop.transport_note}
                                </p>
                              )}
                              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <div className="font-medium text-gray-900">{stop.name}</div>
                                  <div className="text-xs text-gray-600">{stop.area} · {stop.category.replaceAll('_', ' ')}</div>
                                  {stop.notes && <div className="text-xs text-gray-500">{stop.notes}</div>}
                                </div>
                                <div className="text-sm text-gray-500">{stop.time}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {alternatives.itinerary.carbon_explanation && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">Why this route?</p>
                            <p className="text-sm text-green-700 mt-1">
                              {alternatives.itinerary.carbon_explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-800 transition text-sm"
                  >
                    Plan a greener trip →
                  </button>
                </div>
              </div>
            )}

            {/* Note */}
            {step < 4 && (
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>{getNoteLabel()}:</strong> {getStepNote()}
                </p>
              </div>
            )}
          </div>

          {/* Trip Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Your trip so far</h3>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {results
                    ? results.total.toFixed(0)
                    : partialResults.total > 0
                    ? partialResults.total.toFixed(0)
                    : '—'}
                </div>
                <div className="text-xs text-gray-500">kg CO₂e*</div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Transportation</span>
                    <span className="font-medium text-gray-900">
                      {results
                        ? `${results.arrival.toFixed(0)} kg`
                        : partialResults.arrival > 0
                        ? `${partialResults.arrival.toFixed(0)} kg`
                        : 'Not added'}
                    </span>
                  </div>
                  {(results && results.arrival > 0) || partialResults.arrival > 0 ? (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((results ? results.arrival : partialResults.arrival) /
                              (results ? results.total : partialResults.total || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  ) : null}
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Stay</span>
                    <span className="font-medium text-gray-900">
                      {results
                        ? `${results.lodging.toFixed(0)} kg`
                        : partialResults.lodging > 0
                        ? `${partialResults.lodging.toFixed(0)} kg`
                        : 'Not added'}
                    </span>
                  </div>
                  {(results && results.lodging > 0) || partialResults.lodging > 0 ? (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((results ? results.lodging : partialResults.lodging) /
                              (results ? results.total : partialResults.total || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  ) : null}
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Activities</span>
                    <span className="font-medium text-gray-900">
                      {results
                        ? `${(results.local_mobility + results.food + results.activities).toFixed(0)} kg`
                        : partialResults.activities_total > 0
                        ? `${partialResults.activities_total.toFixed(0)} kg`
                        : 'Not added'}
                    </span>
                  </div>
                  {(results && results.local_mobility + results.food + results.activities > 0) ||
                  partialResults.activities_total > 0 ? (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((results
                              ? results.local_mobility + results.food + results.activities
                              : partialResults.activities_total) /
                              (results ? results.total : partialResults.total || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
