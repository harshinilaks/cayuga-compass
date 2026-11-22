'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AlternativesPage() {
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', 'getting_here', 'lodging', 'getting_around', 'activities'];

  useEffect(() => {
    fetch('http://localhost:8000/api/alternatives/')
      .then(res => res.json())
      .then(data => setAlternatives(data.alternatives || []))
      .catch(() => {});
  }, []);

  const filtered = filter === 'all'
    ? alternatives
    : alternatives.filter(a => a.category === filter);

  const categoryLabels: Record<string, string> = {
    all: 'All',
    getting_here: 'Getting Here',
    lodging: 'Lodging',
    getting_around: 'Getting Around',
    activities: 'Activities'
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
              <Link href="/methodology" className="text-gray-600 hover:text-gray-900">Methodology</Link>
              <Link href="/plan" className="bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
                Plan a visit →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sustainable Alternatives</h1>
        <p className="text-gray-600 mb-8">Lower-carbon travel options for your Ithaca visit.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === c
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {categoryLabels[c]}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((alt) => (
            <div key={alt.id} className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{alt.name}</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {categoryLabels[alt.category] || alt.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{alt.description}</p>
              {alt.notes && (
                <p className="text-xs text-gray-500 mb-2">💡 {alt.notes}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {alt.geographic_coverage && (
                  <span>📍 {alt.geographic_coverage}</span>
                )}
                {alt.verified && <span className="text-green-600">✓ Verified</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
