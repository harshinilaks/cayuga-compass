'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ItinerariesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [generated, setGenerated] = useState<any>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const interestOptions = [
    'hiking', 'nature', 'museums', 'culture', 'wineries',
    'shopping', 'events', 'dining', 'campus', 'walking'
  ];

  useEffect(() => {
    fetch('http://localhost:8000/api/itineraries/templates')
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/itineraries/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, days: 1, mobility: 'car' })
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
            <Link href="/" className="text-2xl font-bold text-green-800">STAMP</Link>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Explore</Link>
              <Link href="/plan" className="text-gray-600 hover:text-gray-900">Plan your trip</Link>
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
            <div className="space-y-3 mb-4">
              {generated.stops?.map((stop: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{stop.name}</div>
                    <div className="text-sm text-gray-600">{stop.area} · {stop.category}</div>
                    <div className="text-xs text-gray-500">{stop.notes}</div>
                  </div>
                  <div className="text-sm text-gray-500">{stop.time}</div>
                </div>
              ))}
            </div>
            {generated.sustainability_tips?.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Sustainability tips:</p>
                <ul className="text-sm text-green-700 list-disc pl-4 mt-1">
                  {generated.sustainability_tips.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
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
