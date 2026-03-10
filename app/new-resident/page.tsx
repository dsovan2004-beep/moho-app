export const runtime = 'edge'

import Link from 'next/link'

const CITIES = [
  {
    name: 'Mountain House',
    slug: 'mountain-house',
    emoji: '🏘️',
    gradient: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)',
    county: 'San Joaquin County',
    desc: 'Planned community · Top-rated schools · Parks & trails',
  },
  {
    name: 'Tracy',
    slug: 'tracy',
    emoji: '🌿',
    gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)',
    county: 'San Joaquin County',
    desc: 'Great shopping · Diverse dining · Easy Bay Area access',
  },
  {
    name: 'Lathrop',
    slug: 'lathrop',
    emoji: '🔮',
    gradient: 'linear-gradient(135deg,#581c87 0%,#7e22ce 100%)',
    county: 'San Joaquin County',
    desc: 'Fast-growing · River Islands · ACE Train access',
  },
  {
    name: 'Manteca',
    slug: 'manteca',
    emoji: '🍊',
    gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)',
    county: 'San Joaquin County',
    desc: 'Costco in town · Vibrant community · Big League Dreams',
  },
  {
    name: 'Brentwood',
    slug: 'brentwood',
    emoji: '🌊',
    gradient: 'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)',
    county: 'Contra Costa County',
    desc: 'U-pick farms · Liberty Union schools · East Bay gem',
  },
]

export default function NewResidentPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">New Resident Guide</h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          Moving to the 209 area or East Bay? Pick your city for a personalized welcome guide —
          utilities, schools, healthcare, and the local spots your neighbors love.
        </p>
      </div>

      {/* City Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {CITIES.map((city) => (
          <Link
            key={city.slug}
            href={`/new-resident/${city.slug}`}
            className="group rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            {/* Color band */}
            <div
              className="h-24 flex items-center justify-center"
              style={{ background: city.gradient }}
            >
              <span className="text-5xl">{city.emoji}</span>
            </div>
            {/* Info */}
            <div className="bg-white p-5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="font-extrabold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                  {city.name}
                </h2>
                <span className="text-[10px] font-semibold text-gray-400 mt-1 shrink-0">{city.county}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{city.desc}</p>
              <div className="text-xs font-semibold text-blue-600 group-hover:underline">
                View guide →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* What's inside promo */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <h2 className="font-extrabold text-gray-900 text-base mb-4 text-center">What's inside each guide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: '⚡', label: 'Utilities Setup', desc: 'Water, gas, electric, trash & internet' },
            { icon: '🏥', label: 'Healthcare',      desc: 'Local doctors, dentists & urgent care' },
            { icon: '🍽️', label: 'Food & Dining',   desc: 'Top-rated restaurants from the directory' },
            { icon: '🏫', label: 'Schools',         desc: 'District info and school ratings' },
            { icon: '🔧', label: 'Local Services',  desc: 'Home services, auto, beauty & more' },
            { icon: '💡', label: 'Neighbor Tips',   desc: 'Insider advice from locals who live there' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100">
              <span className="text-xl mt-0.5">{icon}</span>
              <div>
                <div className="text-xs font-bold text-gray-900">{label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
