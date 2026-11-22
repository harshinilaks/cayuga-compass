'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = 'http://localhost:8000/api';

type Tab = 'attractions' | 'lodging' | 'transportation';

const MONTHS = ['Any season', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const TCAT_LABELS: Record<string, string> = {
  year_round: 'TCAT year-round',
  summer_only: 'TCAT summer only',
  not_pinned_walkable: 'Walkable area',
  none_confirmed: 'No confirmed transit',
};

const STATUS_COLORS: Record<string, string> = {
  year_round: 'bg-green-100 text-green-800',
  summer_only: 'bg-amber-100 text-amber-800',
  not_pinned_walkable: 'bg-blue-100 text-blue-800',
  none_confirmed: 'bg-gray-100 text-gray-600',
  confirmed_year_round: 'bg-green-100 text-green-800',
  provisional: 'bg-amber-100 text-amber-800',
  research_documented: 'bg-green-50 text-green-700',
};

export default function ExplorePage() {
  const [tab, setTab] = useState<Tab>('attractions');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-green-800">Cayuga Compass</Link>
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/explore" className="text-gray-900 font-medium">Explore</Link>
              <Link href="/plan" className="text-gray-600 hover:text-gray-900">Plan your trip</Link>
              <Link href="/itineraries" className="text-gray-600 hover:text-gray-900">Itineraries</Link>
              <Link href="/methodology" className="text-gray-600 hover:text-gray-900">Methodology</Link>
              <Link href="/plan" className="bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
                Plan a visit →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Tompkins County</h1>
        <p className="text-gray-600 mb-6">
          Researched attractions, lodging, and transportation — with sources and verification notes.
        </p>

        <div className="flex space-x-2 mb-6">
          {([['attractions', 'Attractions & Experiences'], ['lodging', 'Where to Stay'], ['transportation', 'Getting Around']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                tab === t ? 'bg-green-700 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'attractions' && <AttractionsExplorer />}
        {tab === 'lodging' && <LodgingExplorer />}
        {tab === 'transportation' && <TransportationExplorer />}
      </div>
    </div>
  );
}

function AttractionsExplorer() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', season: '', admission: '', tcat_access: '', tags: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.season) params.set('season', filters.season);
    if (filters.admission) params.set('admission', filters.admission);
    if (filters.tcat_access) params.set('tcat_access', filters.tcat_access);
    if (filters.tags) params.set('tags', filters.tags);
    fetch(`${API}/attractions/?${params}`)
      .then(r => r.json())
      .then(d => setItems(d.attractions || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const set = (k: string, v: string) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
        <FilterSelect label="Category" value={filters.category} onChange={v => set('category', v)}
          options={[['museums_culture', 'Museums & culture'], ['hiking_nature', 'Hiking & nature'], ['local_food', 'Local food'], ['shopping', 'Shopping'], ['wineries', 'Wineries'], ['water_activities', 'Water activities']]} />
        <FilterSelect label="Season" value={filters.season} onChange={v => set('season', v)}
          options={[['winter', 'Winter'], ['spring', 'Spring'], ['summer', 'Summer'], ['fall', 'Fall']]} />
        <FilterSelect label="Admission" value={filters.admission} onChange={v => set('admission', v)}
          options={[['free', 'Free / donation'], ['ticketed', 'Ticketed'], ['vehicle_fee', 'Vehicle fee'], ['pay_as_you_go', 'Pay as you go']]} />
        <FilterSelect label="Transit access" value={filters.tcat_access} onChange={v => set('tcat_access', v)}
          options={[['year_round', 'TCAT year-round'], ['summer_only', 'TCAT summer only'], ['not_pinned_walkable', 'Walkable area'], ['none_confirmed', 'No confirmed transit']]} />
        <FilterSelect label="Interest" value={filters.tags} onChange={v => set('tags', v)}
          options={[['waterfall', 'Waterfalls'], ['hiking', 'Hiking'], ['museum', 'Museums'], ['families', 'Families'], ['winery', 'Wine & cider'], ['shopping', 'Shopping'], ['lake', 'Lakefront'], ['campus', 'Campus']]} />
        <span className="text-xs text-gray-500 ml-auto">{items.length} results</span>
      </div>

      {loading ? <p className="text-gray-500">Loading…</p> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(a => <AttractionCard key={a.id} a={a} />)}
          {items.length === 0 && <p className="text-gray-500 col-span-3">No attractions match those filters.</p>}
        </div>
      )}
    </div>
  );
}

function AttractionCard({ a }: { a: any }) {
  const tcat = a.tcat_access?.status;
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 flex flex-col">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-900">{a.name}</h3>
        {tcat && (
          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${STATUS_COLORS[tcat]}`}>
            {TCAT_LABELS[tcat]}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-2">{a.area} · {a.category?.replaceAll('_', ' ')}</p>
      <p className="text-sm text-gray-600 mb-3">{a.description}</p>
      <div className="text-xs text-gray-500 space-y-1 mt-auto">
        {a.hours && <p><span className="font-medium">Hours:</span> {a.hours}</p>}
        {a.admission?.notes && <p><span className="font-medium">Admission:</span> {a.admission.notes}</p>}
        {a.visit_duration && <p><span className="font-medium">Typical visit:</span> {a.visit_duration}</p>}
        {a.seasonality_notes && <p className="text-amber-700"><span className="font-medium">Seasonal:</span> {a.seasonality_notes}</p>}
        {a.transportation_limitations && <p className="text-amber-700"><span className="font-medium">Getting there:</span> {a.transportation_limitations}</p>}
        {a.accessibility_notes && <p><span className="font-medium">Accessibility:</span> {a.accessibility_notes}</p>}
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        {a.website
          ? <a href={a.website} target="_blank" rel="noreferrer" className="text-xs text-green-700 hover:underline">Official site →</a>
          : <span className="text-xs text-gray-400">No official site listed</span>}
        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[a.verification_status] || 'bg-gray-100 text-gray-500'}`}>
          {a.verification_status?.replaceAll('_', ' ')}
        </span>
      </div>
    </div>
  );
}

function LodgingExplorer() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ accommodation_type: '', car_free: '', practices: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.accommodation_type) params.set('accommodation_type', filters.accommodation_type);
    if (filters.car_free) params.set('car_free_feasible', filters.car_free);
    if (filters.practices) params.set('sustainability_practices', 'true');
    fetch(`${API}/lodging/?${params}`)
      .then(r => r.json())
      .then(d => setItems(d.properties || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const set = (k: string, v: string) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
        <FilterSelect label="Type" value={filters.accommodation_type} onChange={v => set('accommodation_type', v)}
          options={[['hotel', 'Hotel'], ['motel', 'Motel'], ['inn', 'Inn'], ['bed_breakfast', 'B&B'], ['glamping', 'Glamping'], ['camping', 'Camping'], ['farm_stay', 'Farm stay']]} />
        <FilterSelect label="Walkability" value={filters.car_free} onChange={v => set('car_free', v)}
          options={[['true', 'Car-free feasible'], ['false', 'Car recommended']]} />
        <FilterSelect label="Sustainability" value={filters.practices} onChange={v => set('practices', v)}
          options={[['true', 'Documented practices']]} />
        <span className="text-xs text-gray-500 ml-auto">{items.length} properties</span>
      </div>

      {loading ? <p className="text-gray-500">Loading…</p> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => <LodgingCard key={p.id} p={p} />)}
          {items.length === 0 && <p className="text-gray-500 col-span-3">No properties match those filters.</p>}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4">
        Sustainability practices are documented by research, not independently verified.
        No property-level emissions factors exist — the calculator uses generic accommodation-type factors only.
      </p>
    </div>
  );
}

function LodgingCard({ p }: { p: any }) {
  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 flex flex-col">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-900">{p.name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${p.car_free_feasible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {p.car_free_feasible ? 'car-free feasible' : 'car recommended'}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-2">{p.area} · {p.accommodation_type?.replaceAll('_', ' ')}</p>
      <p className="text-sm text-gray-600 mb-3">{p.description}</p>
      <div className="text-xs text-gray-500 space-y-1 mt-auto">
        <p><span className="font-medium">Walkability:</span> {p.walkability}</p>
        <p><span className="font-medium">Getting there:</span> {p.transportation_access?.join(', ')}</p>
        {p.sustainability_practices?.length > 0 && (
          <p><span className="font-medium">Practices:</span> {p.sustainability_practices.join(', ')}</p>
        )}
        <p><span className="font-medium">Certification:</span> {p.certification_status}</p>
        {p.limitations && <p className="text-amber-700"><span className="font-medium">Note:</span> {p.limitations}</p>}
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        {p.source_urls?.length > 0
          ? <a href={p.source_urls[0]} target="_blank" rel="noreferrer" className="text-xs text-green-700 hover:underline">Source →</a>
          : <span className="text-xs text-gray-400">Research-documented</span>}
        <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700">{p.verification_status?.replaceAll('_', ' ')}</span>
      </div>
    </div>
  );
}

function TransportationExplorer() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ scope: '', mode: '', accessible: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.scope) params.set('scope', filters.scope);
    if (filters.mode) params.set('mode', filters.mode);
    if (filters.accessible) params.set('accessible', filters.accessible);
    fetch(`${API}/transportation/?${params}`)
      .then(r => r.json())
      .then(d => setItems(d.services || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const set = (k: string, v: string) => setFilters(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
        <FilterSelect label="Scope" value={filters.scope} onChange={v => set('scope', v)}
          options={[['local', 'Local'], ['regional', 'Regional'], ['intercity', 'Intercity']]} />
        <FilterSelect label="Mode" value={filters.mode} onChange={v => set('mode', v)}
          options={[['bus_transit', 'Bus / transit'], ['paratransit', 'Paratransit'], ['on_demand', 'On-demand'], ['intercity_bus', 'Intercity bus'], ['air', 'Air'], ['taxi_rideshare', 'Taxi & rideshare'], ['carshare', 'Carshare'], ['carpool', 'Carpool'], ['walking', 'Walking'], ['biking', 'Biking'], ['ev_charging', 'EV charging']]} />
        <FilterSelect label="Accessibility" value={filters.accessible} onChange={v => set('accessible', v)}
          options={[['true', 'Documented accessibility']]} />
        <span className="text-xs text-gray-500 ml-auto">{items.length} services</span>
      </div>

      {loading ? <p className="text-gray-500">Loading…</p> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(s => <ServiceCard key={s.id} s={s} />)}
          {items.length === 0 && <p className="text-gray-500 col-span-3">No services match those filters.</p>}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4">
        Fares, schedules, and routes are research-documented and may change — confirm with the provider before travel.
      </p>
    </div>
  );
}

function ServiceCard({ s }: { s: any }) {
  const fareText = s.fares
    ? s.fares.adult != null
      ? `$${s.fares.adult} adult` + (s.fares.daily_cap ? `, $${s.fares.daily_cap} daily cap` : '')
      : s.fares.min != null
        ? `$${s.fares.min}–$${s.fares.max}`
        : s.fares.flat != null
          ? `$${s.fares.flat} flat`
          : s.fares.notes || null
    : null;

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 flex flex-col">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-900">{s.name}</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 whitespace-nowrap ml-2">
          {s.scope} · {s.mode.replaceAll('_', ' ')}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-2">{s.provider} · {s.service_area}</p>
      {s.origins_destinations && <p className="text-sm text-gray-600 mb-3">{s.origins_destinations}</p>}
      <div className="text-xs text-gray-500 space-y-1 mt-auto">
        {fareText && <p><span className="font-medium">Fare:</span> {fareText}</p>}
        {s.accessibility && <p><span className="font-medium">Accessibility:</span> {s.accessibility}</p>}
        {s.schedule_notes && <p><span className="font-medium">Schedule:</span> {s.schedule_notes}</p>}
        {s.seasonal_limitations && <p className="text-amber-700"><span className="font-medium">Seasonal:</span> {s.seasonal_limitations}</p>}
        {s.booking_required && <p><span className="font-medium">Booking:</span> {s.booking_notes || 'Required'}</p>}
        {s.requires_recheck?.length > 0 && <p className="text-amber-700"><span className="font-medium">Recheck:</span> {s.requires_recheck.join(', ')}</p>}
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        {s.website
          ? <a href={s.website} target="_blank" rel="noreferrer" className="text-xs text-green-700 hover:underline">Official site →</a>
          : s.contact
            ? <span className="text-xs text-gray-500">{s.contact}</span>
            : <span className="text-xs text-gray-400">Research-documented</span>}
        <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700">{s.verification_status?.replaceAll('_', ' ')}</span>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="p-2 border border-gray-300 rounded-lg text-sm min-w-[140px]"
      >
        <option value="">All</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
