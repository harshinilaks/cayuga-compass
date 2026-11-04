import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-800">STAMP</span>
              <span className="ml-2 text-sm text-gray-600">Sustainable Tourism Asset Management Program</span>
            </div>
            <div className="flex space-x-8">
              <Link href="/plan" className="text-gray-700 hover:text-green-700 transition">
                Plan Your Trip
              </Link>
              <Link href="/methodology" className="text-gray-700 hover:text-green-700 transition">
                Methodology
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Explore Ithaca Sustainably
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover your trip's carbon footprint, explore local attractions, and plan a more sustainable visit to Tompkins County.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/plan"
              className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-800 transition"
            >
              Plan Your Trip
            </Link>
            <Link
              href="/methodology"
              className="bg-white text-green-700 border-2 border-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              Explore Sustainable Travel
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Understand Your Impact</h3>
            <p className="text-gray-600">
              Calculate your trip's carbon footprint with our research-based emissions calculator. See breakdowns by transportation, lodging, food, and activities.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Discover Ithaca</h3>
            <p className="text-gray-600">
              Explore curated local attractions, itineraries, and sustainable tourism options for Tompkins County.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Travel Lighter</h3>
            <p className="text-gray-600">
              Compare transportation options, find lower-carbon alternatives, and discover how small changes can reduce your environmental impact.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personalized AI Trip Planning</h3>
            <p className="text-gray-600">
              Get AI-powered recommendations for sustainable itineraries, transportation options, and local attractions tailored to your interests.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            Cornell Sustainability Consultants · Tompkins County Tourism Program
          </p>
        </div>
      </footer>
    </div>
  );
}
