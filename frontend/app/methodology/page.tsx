import Link from 'next/link';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-green-800 tracking-tight">Cayuga Compass</Link>
            <div className="flex space-x-8 text-sm font-medium">
              <Link href="/" className="text-gray-600 hover:text-green-700 transition-colors">Explore</Link>
              <Link href="/plan" className="text-gray-600 hover:text-green-700 transition-colors">Plan Your Trip</Link>
              <Link href="/methodology" className="text-green-700">Methodology</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Methodology</h1>

        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Carbon Emissions Model</h2>
            <p className="text-gray-600 mb-4">
              Cayuga Compass uses a deterministic carbon calculation model based on emissions factors from the U.S. Environmental Protection Agency (EPA) and the UK Department for Energy Security and Net Zero (DESNZ).
            </p>
            <p className="text-gray-600">
              The model estimates carbon dioxide equivalent (CO₂e) emissions across five categories: arrival travel, local mobility, lodging, food, and activities.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Emissions Categories</h2>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Arrival Travel</h3>
                <p className="text-gray-600">
                  Emissions from transportation to Tompkins County. Factors vary by mode (car, SUV, electric vehicle, airplane, train, bus) and distance. Flight emissions are categorized by distance (short, medium, long haul).
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Local Mobility</h3>
                <p className="text-gray-600">
                  Emissions from transportation within Tompkins County. Includes local driving and public transit use.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Lodging</h3>
                <p className="text-gray-600">
                  Emissions from accommodation. Based on room-nights and lodging type. Currently uses U.S. average hotel factor; local factors are being developed.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Food</h3>
                <p className="text-gray-600">
                  Emissions from dining during the trip. Based on spending (USD) and restaurant type using EPA Supply Chain GHG Emission Factors.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Activities</h3>
                <p className="text-gray-600">
                  Emissions from recreational activities and shopping. Based on spending (USD) and activity category using EPA Supply Chain GHG Emission Factors.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>U.S. EPA GHG Emission Factors Hub (2025)</li>
              <li>U.S. EPA Supply Chain GHG Emission Factors v1.3 (2022)</li>
              <li>UK DESNZ GHG Conversion Factors</li>
              <li>Tompkins County Visitor Profile Study (Future Partners, 2024)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations & Assumptions</h2>
            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>The model focuses on CO₂ only; non-CO₂ aviation effects are excluded</li>
                <li>Some emissions factors are approximate and require independent verification</li>
                <li>TCAT bus factor uses a national proxy; local data is being sought</li>
                <li>Electric vehicle efficiency is assumed at 0.3 kWh/mile</li>
                <li>Hotel emissions use a U.S. average; Ithaca-specific factors are unavailable</li>
                <li>Some lodging categories (vacation rental, B&B, camping) lack verified factors</li>
                <li>Food and activity factors are spend-based economic proxies, not direct measurements</li>
                <li>Reference scenarios are illustrative, not statistically representative averages</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Visitor Personas</h2>
            <p className="text-gray-600 mb-4">
              The calculator includes three reference scenarios based on Tompkins County visitor research:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Regional Weekend Visitor:</strong> NY State visitors for festivals and weekend getaways (~135 kg CO₂e)</li>
              <li><strong>Experience-Seeking Leisure Traveler:</strong> Out-of-region visitors flying in for nature and wineries (~865 kg CO₂e)</li>
              <li><strong>University-Connected Visitor:</strong> Visitors for campus visits and conferences (~265 kg CO₂e)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Research Transparency</h2>
            <p className="text-gray-600">
              Full research documentation, including emissions factor sources, assumptions logs, and methodology details, is available in the project repository. We are committed to transparency and continuous improvement of our emissions model.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
