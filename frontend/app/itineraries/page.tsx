'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = 'http://localhost:8000/api';

const MONTHS = [
  'Any season', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function ItinerariesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [lodging, setLodging] = useState<any[]>([]);
  const [generated, setGenerated] = useState<any>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [days, setDays] = useState(1);
  const [mobility, setMobility] = useState('transit');
  const [seasonMonth, setSeasonMonth] = useState(0);
  const [lodgingId, setLodgingId] = useState('');
  const [loading, setLoading] = useState(false);

  const interestOptions = [
    'hiking', 'nature', 'museums', 'culture', 'wineries',
    'shopping', 'events', 'families', 'campus', 'walking'
  ];

  useEffect(() => {
    fetch(`${API}/itineraries/templates`)
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .catch(() => {});
    fetch(`${API}/lodging/`)
      .then(res => res.json())
      .then(data => setLodging(data.properties || []))
      .catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/itineraries/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests,
          days,
          mobility,
          season_month: seasonMonth || null,
          lodging_id: lodgingId || null,
        })
      });
      const data = await res.json();
      setGenerated(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-800">Cayuga Compass</Link>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/explore" className="text-gray-600 hover:text-gray-900">Explore</Link>
              <Link href="/plan" className="text-gray-600 hover:text-gray-900">Plan your trip</Link>
              <Link href="/itineraries" className="text-gray-900 font-medium">Itineraries</Link>
              <Link href="/methodology" className="text-gray-600 hover:text-gray-900">Methodology</Link>
              <Link href="/plan" className="bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
                Plan a visit →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Ithaca Itineraries</h1>
        <p className="text-gray-600 mb-8">Curated local tourism experiences for sustainable visits.</p>

        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Generate a custom itinerary</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {interestOptions.map(tag => (
              <button
                key={tag}
                onClick={() => setInterests(prev =>
                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                )}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  interests.includes(tag)
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Days</label>
              <select value={days} onChange={e => setDays(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                {[1, 2, 3].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Getting around</label>
              <select value={mobility} onChange={e => setMobility(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                <option value="walk">Walking</option>
                <option value="transit">Transit (TCAT)</option>
                <option value="bike">Biking</option>
                <option value="car">Car</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Travel month</label>
              <select value={seasonMonth} onChange={e => setSeasonMonth(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Staying at</label>
              <select value={lodgingId} onChange={e => setLodgingId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Not selected</option>
                {lodging.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading || interests.length === 0}
            className="bg-green-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-800 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Itinerary'}
          </button>
        </div>

        {generated && (
          <div className="bg-white rounded-lg p-6 mb-8 border-2 border-green-200">
            <h3 className="font-semibold text-gray-900 text-lg">{generated.name}</h3>
            <p className="text-gray-600 mb-4">{generated.description}</p>

            {generated.warnings?.length > 0 && (
              <div className="mb-4 space-y-1">
                {generated.warnings.map((w: string, i: number) => (
                  <p key={i} className="text-sm text-amber-700 bg-amber-50 rounded px-3 py-2">⚠ {w}</p>
                ))}
              </div>
            )}

            <div className="space-y-3 mb-4">
              {generated.stops?.map((stop: any, i: number) => (
                <div key={i}>
                  {(i === 0 || stop.day !== generated.stops[i - 1].day) && (
                    <p className={`text-xs font-semibold text-gray-500 uppercase tracking-wide ${i === 0 ? 'mb-1' : 'mt-4 mb-1'}`}>
                      Day {stop.day || 1}
                    </p>
                  )}
                  {i > 0 && stop.transport_note && (
                    <p className="text-xs text-gray-500 pl-3 pb-1">
                      ↓ {stop.transport_note}
                    </p>
                  )}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-gray-900">{stop.name}</div>
                      <div className="text-sm text-gray-500">{stop.time}</div>
                    </div>
                    <div className="text-sm text-gray-600">{stop.area} · {stop.category.replaceAll('_', ' ')}</div>
                    <div className="text-xs text-gray-500">{stop.notes}</div>
                    {stop.selection_reason && (
                      <div className="text-xs text-green-700 mt-1">Why: {stop.selection_reason}</div>
                    )}
                    {stop.hours && <div className="text-xs text-gray-500 mt-1">Hours: {stop.hours}</div>}
                    {stop.warnings?.length > 0 && stop.warnings.map((w: string, j: number) => (
                      <div key={j} className="text-xs text-amber-700 mt-1">⚠ {w}</div>
                    ))}
                    {stop.website && (
                      <a href={stop.website} target="_blank" rel="noreferrer"
                        className="text-xs text-green-700 hover:underline mt-1 inline-block">Verify details →</a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {generated.carbon_explanation && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Why this route?</p>
                <p className="text-sm text-green-700 mt-1">{generated.carbon_explanation}</p>
              </div>
            )}

            {generated.verification_notes?.length > 0 && (
              <p className="text-xs text-gray-400 mt-3">{generated.verification_notes[0]}</p>
            )}
          </div>
        )}

        <h2 className="font-semibold text-gray-900 mb-4">Featured itineraries</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="bg-white rounded-lg p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900">{t.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{t.description}</p>
              <div className="space-y-1 text-sm text-gray-600">
                {t.stops?.slice(0, 3).map((stop: any, i: number) => (
                  <div key={i}>• {stop.notes}</div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">{t.stops?.length} stops</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
