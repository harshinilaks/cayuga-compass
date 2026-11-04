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
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-green-800 tracking-tight">STAMP</Link>
            <div className="flex space-x-8 text-sm font-medium">
              <Link href="/" className="text-gray-600 hover:text-green-700 transition-colors">Explore</Link>
              <Link href="/plan" className="text-green-700">Plan Your Trip</Link>
              <Link href="/methodology" className="text-gray-600 hover:text-green-700 transition-colors">Methodology</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${
                    s < step
                      ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                      : s === step
                      ? 'bg-green-700 text-white shadow-lg shadow-green-300 scale-110'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                      s < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-12 md:space-x-20 text-sm">
            <span className={`text-center ${step >= 1 ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>Transportation</span>
            <span className={`text-center ${step >= 2 ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>Stay</span>
            <span className={`text-center ${step >= 3 ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>Activities</span>
            <span className={`text-center ${step >= 4 ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>Results</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">How are you getting to Ithaca?</h2>
                  <p className="text-gray-600 text-lg">Tell us about your main mode of travel to the destination.</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Travel Mode</label>
                    <select
                      value={tripData.travelMode}
                      onChange={(e) => setTripData({ ...tripData, travelMode: e.target.value })}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
                    >
                      {transportationModes.map((mode) => (
                        <option key={mode.id} value={mode.id}>
                          {mode.icon} {mode.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Where are you traveling from?</label>
                    <input
                      type="text"
                      value={tripData.origin}
                      onChange={(e) => setTripData({ ...tripData, origin: e.target.value })}
                      placeholder="New York City, NY"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">One-way distance (miles)</label>
                    <input
                      type="number"
                      value={tripData.oneWayDistance || ''}
                      onChange={(e) => setTripData({ ...tripData, oneWayDistance: parseFloat(e.target.value) || 0 })}
                      placeholder="105"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Number of travelers</label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setTripData({ ...tripData, partySize: Math.max(1, tripData.partySize - 1) })}
                          className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-all text-xl font-semibold text-green-700"
                        >
                          −
                        </button>
                        <span className="text-2xl font-bold text-gray-900 w-12 text-center">{tripData.partySize}</span>
                        <button
                          onClick={() => setTripData({ ...tripData, partySize: tripData.partySize + 1 })}
                          className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-all text-xl font-semibold text-green-700"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Trip type</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            value="round"
                            checked={tripData.tripType === 'round'}
                            onChange={(e) => setTripData({ ...tripData, tripType: e.target.value as 'round' | 'one-way' })}
                            className="w-5 h-5 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-700">Round trip</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            value="one-way"
                            checked={tripData.tripType === 'one-way'}
                            onChange={(e) => setTripData({ ...tripData, tripType: e.target.value as 'round' | 'one-way' })}
                            className="w-5 h-5 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-gray-700">One way</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {tripData.travelMode === 'car' || tripData.travelMode === 'suv' || tripData.travelMode === 'ev' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Number of vehicles</label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setTripData({ ...tripData, vehicles: Math.max(1, tripData.vehicles - 1) })}
                          className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-all text-xl font-semibold text-green-700"
                        >
                          −
                        </button>
                        <span className="text-2xl font-bold text-gray-900 w-12 text-center">{tripData.vehicles}</span>
                        <button
                          onClick={() => setTripData({ ...tripData, vehicles: tripData.vehicles + 1 })}
                          className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-all text-xl font-semibold text-green-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-8 p-5 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-800 font-medium">
                    💡 A quick note: Travel is often the largest source of visitor-trip emissions.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Where will you stay?</h2>
                  <p className="text-gray-600 text-lg">Tell us about your accommodation in Ithaca.</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Your accommodation</label>
                    <select
                      value={tripData.accommodationType}
                      onChange={(e) => setTripData({ ...tripData, accommodationType: e.target.value })}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
                    >
                      {accommodationTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Number of nights</label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setTripData({ ...tripData, nights: Math.max(0, tripData.nights - 1) })}
                          className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-all text-xl font-semibold text-green-700"
                        >
                          −
                        </button>
                        <span className="text-2xl font-bold text-gray-900 w-12 text-center">{tripData.nights}</span>
                        <button
                          onClick={() => setTripData({ ...tripData, nights: tripData.nights + 1 })}
                          className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-all text-xl font-semibold text-green-700"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Number of rooms</label>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => setTripData({ ...tripData, rooms: Math.max(1, tripData.rooms - 1) })}
                          className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-all text-xl font-semibold text-green-700"
                        >
                          −
                        </button>
                        <span className="text-2xl font-bold text-gray-900 w-12 text-center">{tripData.rooms}</span>
                        <button
                          onClick={() => setTripData({ ...tripData, rooms: tripData.rooms + 1 })}
                          className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-all text-xl font-semibold text-green-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-5 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-800 font-medium">
                    💡 Stay thoughtfully: Look for local ownership, efficient operations, and credible sustainability practices.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Activities & local travel</h2>
                  <p className="text-gray-600 text-lg">How will you get around, eat, and spend time in Tompkins County?</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Local transportation</label>
                    <select
                      value={tripData.localTransport}
                      onChange={(e) => setTripData({ ...tripData, localTransport: e.target.value })}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
                    >
                      {localTransportOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Days using this transport</label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setTripData({ ...tripData, localTransportDays: Math.max(1, tripData.localTransportDays - 1) })}
                        className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-all text-xl font-semibold text-green-700"
                      >
                        −
                      </button>
                      <span className="text-2xl font-bold text-gray-900 w-12 text-center">{tripData.localTransportDays}</span>
                      <button
                        onClick={() => setTripData({ ...tripData, localTransportDays: tripData.localTransportDays + 1 })}
                        className="w-12 h-12 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 transition-all text-xl font-semibold text-green-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Local driving miles (total)</label>
                    <input
                      type="number"
                      value={tripData.localDrivingMiles || ''}
                      onChange={(e) => setTripData({ ...tripData, localDrivingMiles: parseFloat(e.target.value) || 0 })}
                      placeholder="30"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Transit passenger-miles per person</label>
                    <input
                      type="number"
                      value={tripData.transitMilesPerPerson || ''}
                      onChange={(e) => setTripData({ ...tripData, transitMilesPerPerson: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Activities planned</label>
                    <div className="grid grid-cols-2 gap-3">
                      {activityOptions.map((activity) => (
                        <label key={activity.id} className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all">
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
                            className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
                          />
                          <span className="ml-3 text-gray-700">{activity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-5 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-800 font-medium">
                    💡 Explore lighter: Local transit, plant-forward meals, and nature-based activities can support a lower-impact visit.
                  </p>
                </div>
              </div>
            )}

            {step === 4 && results && (
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Your estimated carbon footprint</h2>
                  <p className="text-gray-600 text-lg">Here's the estimated impact of your trip to Ithaca.</p>
                </div>

                <div className="text-center mb-10 p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                  <div className="text-6xl font-bold text-green-700 mb-3">
                    {results.total.toFixed(1)}
                  </div>
                  <div className="text-xl text-green-800 font-medium">kg CO₂e</div>
                  <div className="text-green-600 mt-2">
                    {results.per_person.toFixed(1)} kg CO₂e per traveler
                  </div>
                </div>

                <div className="space-y-3 mb-10">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">Transportation</span>
                    <span className="font-bold text-gray-900 text-lg">{results.arrival.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">Accommodation</span>
                    <span className="font-bold text-gray-900 text-lg">{results.lodging.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">Local mobility</span>
                    <span className="font-bold text-gray-900 text-lg">{results.local_mobility.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">Food</span>
                    <span className="font-bold text-gray-900 text-lg">{results.food.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">Activities</span>
                    <span className="font-bold text-gray-900 text-lg">{results.activities.toFixed(1)} kg</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <h3 className="font-bold text-gray-900 text-xl">Ways to travel lighter</h3>
                  <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-green-800 font-medium">
                      🚌 Take the bus: Compare TCAT routes for getting around.
                    </p>
                  </div>
                  <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-green-800 font-medium">
                      🏨 Choose a thoughtful stay: Look for local, efficient accommodations.
                    </p>
                  </div>
                  <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-green-800 font-medium">
                      🥗 Eat local & plant-forward: Support local food and lower-impact meals.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-600">
                    <strong>What this means:</strong> Your choices shape the estimate. Compare alternatives and explore local sustainable tourism resources.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && step < 4 && (
                <button
                  onClick={prevStep}
                  className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  ← Back
                </button>
              )}
              {step < 3 && (
                <button
                  onClick={nextStep}
                  className="ml-auto px-8 py-4 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-all shadow-lg shadow-green-200"
                >
                  Next →
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="ml-auto px-8 py-4 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-all shadow-lg shadow-green-200 disabled:opacity-50"
                >
                  {loading ? 'Calculating...' : 'See my results →'}
                </button>
              )}
              {step === 4 && (
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto px-8 py-4 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-all shadow-lg shadow-green-200"
                >
                  Plan another trip
                </button>
              )}
            </div>
          </div>

          {/* Trip Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Your trip so far</h3>
              <div className="text-center mb-6 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="text-4xl font-bold text-green-700">
                  {results ? results.total.toFixed(0) : '—'}
                </div>
                <div className="text-sm text-green-700 font-medium mt-1">kg CO₂e*</div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Transportation</span>
                  <span className="font-semibold text-gray-900">
                    {results ? `${results.arrival.toFixed(0)} kg` : 'Not added'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Stay</span>
                  <span className="font-semibold text-gray-900">
                    {results ? `${results.lodging.toFixed(0)} kg` : 'Not added'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Activities</span>
                  <span className="font-semibold text-gray-900">
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
