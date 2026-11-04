'use client';

import { useState } from 'react';
import Link from 'next/link';

type TripData = {
  // Step 1: Transportation
  travelMode: string;
  origin: string;
  partySize: number;
  tripType: 'round' | 'one-way';
  oneWayDistance: number;
  vehicles: number;

  // Step 2: Accommodation
  accommodationType: string;
  nights: number;
  rooms: number;

  // Step 3: Activities & Local Travel
  localTransport: string;
  localTransportDays: number;
  activities: string[];
  localDrivingMiles: number;
  transitMilesPerPerson: number;

  // Derived
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
  const [results, setResults] = useState<any>(null);

  const transportationModes = [
    { id: 'air_short', label: 'Plane (short haul)', icon: '✈️' },
    { id: 'air_medium', label: 'Plane (medium haul)', icon: '✈️' },
    { id: 'air_long', label: 'Plane (long haul)', icon: '✈️' },
    { id: 'car', label: 'Car', icon: '🚗' },
    { id: 'suv', label: 'SUV / Van', icon: '🚙' },
    { id: 'ev', label: 'Electric Vehicle', icon: '⚡' },
    { id: 'train', label: 'Train', icon: '🚂' },
    { id: 'bus', label: 'Bus', icon: '🚌' },
    { id: 'rideshare', label: 'Rideshare', icon: '🚕' },
  ];

  const accommodationTypes = [
    { id: 'hotel', label: 'Hotel', icon: '🏨' },
    { id: 'inn', label: 'Inn / B&B', icon: '🏡' },
    { id: 'rental', label: 'Vacation Rental', icon: '🏠' },
    { id: 'hostel', label: 'Hostel', icon: '🛏️' },
    { id: 'camping', label: 'Camping', icon: '⛺' },
    { id: 'family', label: 'Friends / Family', icon: '👨‍👩‍👧‍👦' },
  ];

  const localTransportOptions = [
    { id: 'tcat', label: 'TCAT Bus', icon: '🚌' },
    { id: 'car', label: 'Rental Car', icon: '🚗' },
    { id: 'rideshare', label: 'Rideshare', icon: '🚕' },
    { id: 'bike', label: 'Biking', icon: '🚴' },
    { id: 'walk', label: 'Walking', icon: '🚶' },
  ];

  const activityOptions = [
    { id: 'hiking', label: 'Hiking & Nature' },
    { id: 'water', label: 'Water Activities' },
    { id: 'museums', label: 'Museums & Culture' },
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-green-800">STAMP</Link>
            <div className="flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-green-700 transition">Explore</Link>
              <Link href="/plan" className="text-green-700 font-semibold">Plan Your Trip</Link>
              <Link href="/methodology" className="text-gray-700 hover:text-green-700 transition">Methodology</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s <= step ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && <div className={`w-16 h-1 ${s < step ? 'bg-green-700' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-16 text-sm text-gray-600">
            <span className={step >= 1 ? 'text-green-700 font-semibold' : ''}>Transportation</span>
            <span className={step >= 2 ? 'text-green-700 font-semibold' : ''}>Accommodation</span>
            <span className={step >= 3 ? 'text-green-700 font-semibold' : ''}>Activities</span>
            <span className={step >= 4 ? 'text-green-700 font-semibold' : ''}>Results</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {step === 1 && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How are you getting to Ithaca?</h2>
                <p className="text-gray-600 mb-6">Tell us about your main mode of travel to the destination.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Travel Mode</label>
                    <select
                      value={tripData.travelMode}
                      onChange={(e) => setTripData({ ...tripData, travelMode: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">One-way distance (miles)</label>
                    <input
                      type="number"
                      value={tripData.oneWayDistance || ''}
                      onChange={(e) => setTripData({ ...tripData, oneWayDistance: parseFloat(e.target.value) || 0 })}
                      placeholder="105"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of travelers</label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setTripData({ ...tripData, partySize: Math.max(1, tripData.partySize - 1) })}
                          className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          −
                        </button>
                        <span className="text-xl font-semibold">{tripData.partySize}</span>
                        <button
                          onClick={() => setTripData({ ...tripData, partySize: tripData.partySize + 1 })}
                          className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
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
                  </div>

                  {tripData.travelMode === 'car' || tripData.travelMode === 'suv' || tripData.travelMode === 'ev' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of vehicles</label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setTripData({ ...tripData, vehicles: Math.max(1, tripData.vehicles - 1) })}
                          className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          −
                        </button>
                        <span className="text-xl font-semibold">{tripData.vehicles}</span>
                        <button
                          onClick={() => setTripData({ ...tripData, vehicles: tripData.vehicles + 1 })}
                          className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>A quick note:</strong> Travel is often the largest source of visitor-trip emissions.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Where will you stay?</h2>
                <p className="text-gray-600 mb-6">Tell us about your accommodation in Ithaca.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your accommodation</label>
                    <select
                      value={tripData.accommodationType}
                      onChange={(e) => setTripData({ ...tripData, accommodationType: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {accommodationTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of nights</label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setTripData({ ...tripData, nights: Math.max(0, tripData.nights - 1) })}
                          className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          −
                        </button>
                        <span className="text-xl font-semibold">{tripData.nights}</span>
                        <button
                          onClick={() => setTripData({ ...tripData, nights: tripData.nights + 1 })}
                          className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Number of rooms</label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setTripData({ ...tripData, rooms: Math.max(1, tripData.rooms - 1) })}
                          className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          −
                        </button>
                        <span className="text-xl font-semibold">{tripData.rooms}</span>
                        <button
                          onClick={() => setTripData({ ...tripData, rooms: tripData.rooms + 1 })}
                          className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Stay thoughtfully:</strong> Look for local ownership, efficient operations, and credible sustainability practices.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Activities & local travel</h2>
                <p className="text-gray-600 mb-6">How will you get around, eat, and spend time in Tompkins County?</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Local transportation</label>
                    <select
                      value={tripData.localTransport}
                      onChange={(e) => setTripData({ ...tripData, localTransport: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setTripData({ ...tripData, localTransportDays: Math.max(1, tripData.localTransportDays - 1) })}
                        className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                      >
                        −
                      </button>
                      <span className="text-xl font-semibold">{tripData.localTransportDays}</span>
                      <button
                        onClick={() => setTripData({ ...tripData, localTransportDays: tripData.localTransportDays + 1 })}
                        className="w-10 h-10 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transit passenger-miles per person</label>
                    <input
                      type="number"
                      value={tripData.transitMilesPerPerson || ''}
                      onChange={(e) => setTripData({ ...tripData, transitMilesPerPerson: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Activities planned</label>
                    <div className="grid grid-cols-2 gap-3">
                      {activityOptions.map((activity) => (
                        <label key={activity.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
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
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Explore lighter:</strong> Local transit, plant-forward meals, and nature-based activities can support a lower-impact visit.
                  </p>
                </div>
              </div>
            )}

            {step === 4 && results && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your estimated carbon footprint</h2>
                <p className="text-gray-600 mb-6">Here's the estimated impact of your trip to Ithaca.</p>

                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-green-700 mb-2">
                    {results.total.toFixed(1)}
                  </div>
                  <div className="text-xl text-gray-600">kg CO₂e</div>
                  <div className="text-gray-500 mt-2">
                    {results.per_person.toFixed(1)} kg CO₂e per traveler
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Transportation</span>
                    <span className="font-semibold text-gray-900">{results.arrival.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Accommodation</span>
                    <span className="font-semibold text-gray-900">{results.lodging.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Local mobility</span>
                    <span className="font-semibold text-gray-900">{results.local_mobility.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Food</span>
                    <span className="font-semibold text-gray-900">{results.food.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Activities</span>
                    <span className="font-semibold text-gray-900">{results.activities.toFixed(1)} kg</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <h3 className="font-semibold text-gray-900">Ways to travel lighter</h3>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Take the bus:</strong> Compare TCAT routes for getting around.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Choose a thoughtful stay:</strong> Look for local, efficient accommodations.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Eat local & plant-forward:</strong> Support local food and lower-impact meals.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>What this means:</strong> Your choices shape the estimate. Compare alternatives and explore local sustainable tourism resources.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {step > 1 && step < 4 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Back
                </button>
              )}
              {step < 3 && (
                <button
                  onClick={nextStep}
                  className="ml-auto px-6 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition"
                >
                  Next
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="ml-auto px-6 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50"
                >
                  {loading ? 'Calculating...' : 'See my results'}
                </button>
              )}
              {step === 4 && (
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto px-6 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition"
                >
                  Plan another trip
                </button>
              )}
            </div>
          </div>

          {/* Trip Summary Panel */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Your trip so far</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-green-700">
                  {results ? results.total.toFixed(0) : '—'}
                </div>
                <div className="text-sm text-gray-600">kg CO₂e*</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transportation</span>
                  <span className="font-medium">
                    {results ? `${results.arrival.toFixed(0)} kg` : 'Not added'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stay</span>
                  <span className="font-medium">
                    {results ? `${results.lodging.toFixed(0)} kg` : 'Not added'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Activities</span>
                  <span className="font-medium">
                    {results ? `${(results.local_mobility + results.food + results.activities).toFixed(0)} kg` : 'Not added'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
