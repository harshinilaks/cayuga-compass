'use client';

import { useState } from 'react';
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
};

export default function PlanPage() {
  const [step, setStep] = useState(1);
  const [tripData, setTripData] = useState<TripData>({
    travelMode: 'car',
    origin: '',
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

  const transportationModes = [
    { id: 'air_short', label: 'Plane', icon: '✈️' },
    { id: 'air_medium', label: 'Plane', icon: '✈️' },
    { id: 'air_long', label: 'Plane', icon: '✈️' },
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

  const calculateFootprint = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/emissions/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arrival_mode: tripData.travelMode === 'car' ? 'transport_passenger_car_gasoline' :
                        tripData.travelMode === 'suv' ? 'transport_suv_pickup_van' :
                        tripData.travelMode === 'ev' ? 'transport_electric_vehicle' :
                        tripData.travelMode === 'train' ? 'transport_intercity_rail' :
                        tripData.travelMode === 'bus' ? 'transport_intercity_bus' :
                        tripData.travelMode === 'rideshare' ? 'transport_passenger_car_gasoline' :
                        tripData.travelMode === 'air_short' ? 'transport_air_short_haul' :
                        tripData.travelMode === 'air_medium' ? 'transport_air_medium_haul' :
                        'transport_air_long_haul',
          one_way_distance_miles: tripData.oneWayDistance,
          round_trip: tripData.tripType === 'round',
          vehicles: tripData.vehicles,
          party_size: tripData.partySize,
          local_driving_miles: tripData.localDrivingMiles,
          local_vehicle_type: 'transport_passenger_car_gasoline',
          transit_passenger_miles_per_person: tripData.transitMilesPerPerson,
          lodging_type: tripData.accommodationType === 'hotel' ? 'lodging_hotel_us_average' :
                       tripData.accommodationType === 'family' ? 'lodging_friends_family' :
                       'lodging_hotel_us_average',
          nights: tripData.nights,
          rooms: tripData.rooms,
          food_type: 'food_full_service',
          food_spending_per_person_per_day: 50,
          days: tripData.days,
          activities: [],
        }),
      });
      const data = await response.json();
      setResults(data);
      setStep(4);
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating footprint. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 3) {
      calculateFootprint();
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-green-700 font-bold text-lg">Tourism Program</div>
            </div>
            <div className="flex items-center space-x-8 text-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Explore</Link>
              <Link href="/plan" className="text-gray-900 font-medium">Plan your trip</Link>
              <Link href="/methodology" className="text-gray-600 hover:text-gray-900">Sustainability</Link>
              <Link href="/plan" className="bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
                Plan a visit →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Step Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        s === step ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {s}
                    </div>
                    {s < 4 && <div className="w-8 h-0.5 bg-gray-200" />}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                STEP {step} OF 4
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h1>
          <p className="text-gray-600">{getStepSubtitle()}</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travel mode</label>
                  <p className="text-xs text-gray-500 mb-3">Choose the main way you&apos;ll arrive.</p>
                  <select
                    value={tripData.travelMode}
                    onChange={(e) => setTripData({ ...tripData, travelMode: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of travelers</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setTripData({ ...tripData, partySize: Math.max(1, tripData.partySize - 1) })}
                      className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200 transition text-lg"
                    >
                      −
                    </button>
                    <span className="text-lg font-medium w-8 text-center">{tripData.partySize}</span>
                    <button
                      onClick={() => setTripData({ ...tripData, partySize: tripData.partySize + 1 })}
                      className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200 transition text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip type</label>
                  <div className="flex space-x-6">
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

                <div className="pt-4">
                  <button
                    onClick={nextStep}
                    className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition"
                  >
                    Next: Your stay →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your accommodation</label>
                  <p className="text-xs text-gray-500 mb-3">Select the type that best describes your stay.</p>
                  <select
                    value={tripData.accommodationType}
                    onChange={(e) => setTripData({ ...tripData, accommodationType: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    {accommodationTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of nights</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setTripData({ ...tripData, nights: Math.max(0, tripData.nights - 1) })}
                      className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200 transition text-lg"
                    >
                      −
                    </button>
                    <span className="text-lg font-medium w-8 text-center">{tripData.nights}</span>
                    <button
                      onClick={() => setTripData({ ...tripData, nights: tripData.nights + 1 })}
                      className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200 transition text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of rooms</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setTripData({ ...tripData, rooms: Math.max(1, tripData.rooms - 1) })}
                      className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200 transition text-lg"
                    >
                      −
                    </button>
                    <span className="text-lg font-medium w-8 text-center">{tripData.rooms}</span>
                    <button
                      onClick={() => setTripData({ ...tripData, rooms: tripData.rooms + 1 })}
                      className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200 transition text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={nextStep}
                    className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition"
                  >
                    Next: Activities →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Local transportation</label>
                  <p className="text-xs text-gray-500 mb-3">Choose your main way of getting around.</p>
                  <select
                    value={tripData.localTransport}
                    onChange={(e) => setTripData({ ...tripData, localTransport: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
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
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setTripData({ ...tripData, localTransportDays: Math.max(1, tripData.localTransportDays - 1) })}
                      className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200 transition text-lg"
                    >
                      −
                    </button>
                    <span className="text-lg font-medium w-8 text-center">{tripData.localTransportDays}</span>
                    <button
                      onClick={() => setTripData({ ...tripData, localTransportDays: tripData.localTransportDays + 1 })}
                      className="w-8 h-8 bg-gray-100 rounded hover:bg-gray-200 transition text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Activities planned · Select all that apply</label>
                  <div className="grid grid-cols-2 gap-3">
                    {activityOptions.map((activity) => (
                      <label key={activity.id} className="flex items-center p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tripData.activities.includes(activity.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTripData({ ...tripData, activities: [...tripData.activities, activity.id] });
                            } else {
                              setTripData({ ...tripData, activities: tripData.activities.filter((a) => a !== activity.id) });
                            }
                          }}
                          className="mr-3"
                        />
                        {activity.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={nextStep}
                    disabled={loading}
                    className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition disabled:opacity-50"
                  >
                    {loading ? 'Calculating...' : 'See my results →'}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && results && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {results.total.toFixed(0)}
                  </div>
                  <div className="text-gray-600">kg CO₂e</div>
                  <div className="text-sm text-gray-500 mt-2">
                    Estimated trip total
                  </div>
                  <div className="text-lg text-gray-700 mt-1">
                    {results.per_person.toFixed(0)} kg CO₂e per traveler
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">FOOTPRINT BREAKDOWN</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Transportation</span>
                      <span className="font-medium text-gray-900">{results.arrival.toFixed(0)} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Accommodation</span>
                      <span className="font-medium text-gray-900">{results.lodging.toFixed(0)} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Activities & local</span>
                      <span className="font-medium text-gray-900">{(results.local_mobility + results.food + results.activities).toFixed(0)} kg</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Ways to travel lighter</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 font-medium">Take the bus</p>
                      <p className="text-sm text-gray-600">Compare TCAT routes for getting around.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 font-medium">Choose a thoughtful stay</p>
                      <p className="text-sm text-gray-600">Look for local, efficient accommodations.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 font-medium">Eat local & plant-forward</p>
                      <p className="text-sm text-gray-600">Support local food and lower-impact meals.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800 transition"
                  >
                    Plan a greener trip →
                  </button>
                </div>
              </div>
            )}

            {/* Note */}
            {step < 4 && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>{getNoteLabel()}:</strong> {getStepNote()}
                </p>
              </div>
            )}
          </div>

          {/* Trip Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your trip so far</h3>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900">
                  {results ? results.total.toFixed(0) : '—'}
                </div>
                <div className="text-sm text-gray-500">kg CO₂e*</div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Transportation</span>
                    <span className="font-medium text-gray-900">
                      {results ? `${results.arrival.toFixed(0)} kg` : 'Not added'}
                    </span>
                  </div>
                  {results && results.arrival > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min((results.arrival / results.total) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Stay</span>
                    <span className="font-medium text-gray-900">
                      {results ? `${results.lodging.toFixed(0)} kg` : 'Not added'}
                    </span>
                  </div>
                  {results && results.lodging > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min((results.lodging / results.total) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Activities</span>
                    <span className="font-medium text-gray-900">
                      {results ? `${(results.local_mobility + results.food + results.activities).toFixed(0)} kg` : 'Not added'}
                    </span>
                  </div>
                  {results && (results.local_mobility + results.food + results.activities) > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min(((results.local_mobility + results.food + results.activities) / results.total) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
