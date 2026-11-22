import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-green-800 tracking-tight">Cayuga Compass</Link>
            <div className="flex space-x-8 text-sm font-medium">
              <Link href="/explore" className="text-green-700">Explore</Link>
              <Link href="/plan" className="text-gray-600 hover:text-green-700 transition-colors">Plan Your Trip</Link>
              <Link href="/itineraries" className="text-gray-600 hover:text-green-700 transition-colors">Itineraries</Link>
              <Link href="/alternatives" className="text-gray-600 hover:text-green-700 transition-colors">Alternatives</Link>
              <Link href="/methodology" className="text-gray-600 hover:text-green-700 transition-colors">Methodology</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Explore Ithaca Sustainably
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
            Discover your trip&apos;s carbon footprint, explore local attractions, and plan a more sustainable visit to Tompkins County.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/plan"
              className="px-8 py-4 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition-all shadow-lg shadow-green-200 text-lg"
            >
              Plan Your Trip
            </Link>
            <Link
              href="/methodology"
              className="px-8 py-4 bg-white text-green-700 border-2 border-green-700 rounded-xl font-semibold hover:bg-green-50 transition-all text-lg"
            >
              Explore Sustainable Travel
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">🌍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Understand Your Impact</h3>
            <p className="text-gray-600 leading-relaxed">
              Calculate your trip&apos;s carbon footprint with our research-based emissions calculator. See breakdowns by transportation, lodging, food, and activities.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Discover Ithaca</h3>
            <p className="text-gray-600 leading-relaxed">
              Explore curated local attractions, itineraries, and sustainable tourism options for Tompkins County.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">🚲</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Travel Lighter</h3>
            <p className="text-gray-600 leading-relaxed">
              Compare transportation options, find lower-carbon alternatives, and discover how small changes can reduce your environmental impact.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Personalized AI Trip Planning</h3>
            <p className="text-gray-600 leading-relaxed">
              Get AI-powered recommendations for sustainable itineraries, transportation options, and local attractions tailored to your interests.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-green-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            Cornell Sustainability Consultants · Tompkins County Tourism Program
          </p>
        </div>
      </footer>
    </div>
  );
}
