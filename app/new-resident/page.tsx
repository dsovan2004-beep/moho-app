export const runtime = 'edge'

import Link from 'next/link'

// ── Types ────────────────────────────────────────────────────────────────────
type City = 'Mountain House' | 'Tracy' | 'Lathrop' | 'Manteca'

interface PageProps {
  searchParams: Promise<{ city?: string }>
}

// ── City config ──────────────────────────────────────────────────────────────
const CITY_KEYS: Record<string, City> = {
  mountainhouse: 'Mountain House',
  mh: 'Mountain House',
  tracy: 'Tracy',
  lathrop: 'Lathrop',
  manteca: 'Manteca',
}

const CITY_STYLE: Record<City, { gradient: string; btnActive: string; chip: string; emoji: string }> = {
  'Mountain House': {
    gradient: 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)',
    btnActive: 'bg-blue-700 text-white',
    chip: 'bg-blue-50 text-blue-700',
    emoji: '🏘️',
  },
  Tracy: {
    gradient: 'linear-gradient(135deg,#16a34a 0%,#15803d 100%)',
    btnActive: 'bg-green-700 text-white',
    chip: 'bg-green-50 text-green-700',
    emoji: '🌿',
  },
  Lathrop: {
    gradient: 'linear-gradient(135deg,#9333ea 0%,#7e22ce 100%)',
    btnActive: 'bg-purple-700 text-white',
    chip: 'bg-purple-50 text-purple-700',
    emoji: '🔮',
  },
  Manteca: {
    gradient: 'linear-gradient(135deg,#ea580c 0%,#c2410c 100%)',
    btnActive: 'bg-orange-700 text-white',
    chip: 'bg-orange-50 text-orange-700',
    emoji: '🍊',
  },
}

// ── City-specific content ─────────────────────────────────────────────────────
const CITY_CONTENT: Record<
  City,
  {
    welcome: string
    sub: string
    schools: { name: string; grades: string; rating: string }[]
    utilities: { name: string; desc: string; url: string }[]
    essentials: { icon: string; label: string; value: string }[]
    tips: string[]
  }
> = {
  'Mountain House': {
    welcome: 'Welcome to Mountain House! 🎉',
    sub: 'One of the Bay Area\'s fastest-growing planned communities — beautiful parks, top-rated schools, and friendly neighbors await.',
    schools: [
      { name: 'Mountain House Elementary', grades: 'K–5', rating: '9/10' },
      { name: 'Bethany Elementary', grades: 'K–5', rating: '9/10' },
      { name: 'Mountain House Middle School', grades: '6–8', rating: '8/10' },
      { name: 'Mountain House High School', grades: '9–12', rating: '9/10' },
    ],
    utilities: [
      { name: 'PG&E (Gas & Electric)', desc: 'Set up your gas and electricity account online', url: 'https://www.pge.com' },
      { name: 'Mountain House CSD (Water)', desc: 'Water & wastewater services for Mountain House', url: 'https://www.mhcsd.ca.gov' },
      { name: 'Recology (Trash & Recycling)', desc: 'Curbside pickup — bins provided after signup', url: 'https://www.recology.com' },
      { name: 'Comcast / AT&T Fiber', desc: 'Internet & cable — fiber available in most areas', url: 'https://www.xfinity.com' },
    ],
    essentials: [
      { icon: '🛒', label: 'Nearest Costco', value: 'Tracy — ~10 min drive' },
      { icon: '🛍️', label: 'Target / Walmart', value: 'Tracy on 11th St — ~12 min' },
      { icon: '🏥', label: 'Nearest ER', value: 'Sutter Tracy Community Hospital' },
      { icon: '🚂', label: 'ACE Train', value: 'Lathrop/Manteca Station — ~15 min' },
      { icon: '✈️', label: 'Airport', value: 'SFO ~60 min · OAK ~45 min' },
      { icon: '🏛️', label: 'City Hall / CSD', value: '(209) 831-2300' },
    ],
    tips: [
      'Mountain House has some of the best-rated public schools in San Joaquin County — great for families.',
      'The Central Community Park has walking trails, a splash pad, and hosts most city events.',
      'Join the Mountain House Community Facebook group — neighbors are incredibly welcoming.',
      'Summers get hot (100°F+) — get your A/C serviced in spring before the rush.',
      'Tracy is your nearest city for most big-box shopping, restaurants, and medical care.',
    ],
  },
  Tracy: {
    welcome: 'Welcome to Tracy! 🎉',
    sub: 'A thriving Central Valley city with excellent shopping, diverse dining, and easy Bay Area access via I-205.',
    schools: [
      { name: 'Tracy Unified School District', grades: 'K–12', rating: '7/10' },
      { name: 'Kimball High School', grades: '9–12', rating: '8/10' },
      { name: 'West High School', grades: '9–12', rating: '7/10' },
      { name: 'Monte Vista Middle School', grades: '6–8', rating: '7/10' },
    ],
    utilities: [
      { name: 'PG&E (Gas & Electric)', desc: 'Set up your gas and electricity account online', url: 'https://www.pge.com' },
      { name: 'City of Tracy (Water)', desc: 'Water & sewer billing through the city', url: 'https://www.cityoftracy.org' },
      { name: 'Recology (Trash & Recycling)', desc: 'Curbside pickup — bins provided after signup', url: 'https://www.recology.com' },
      { name: 'Comcast / AT&T', desc: 'Internet & cable — multiple providers available', url: 'https://www.xfinity.com' },
    ],
    essentials: [
      { icon: '🛒', label: 'Costco', value: 'On Naglee Rd — very close' },
      { icon: '🛍️', label: 'Target / Walmart / Home Depot', value: 'All on 11th St corridor' },
      { icon: '🏥', label: 'Hospital', value: 'Sutter Tracy Community Hospital' },
      { icon: '🚂', label: 'ACE Train', value: 'Downtown Tracy Station' },
      { icon: '✈️', label: 'Airport', value: 'SFO ~55 min · OAK ~40 min' },
      { icon: '🏛️', label: 'City Hall', value: '(209) 831-6000' },
    ],
    tips: [
      'Downtown Tracy has a growing food scene — try the restaurants on 10th and 11th Street.',
      'Tracy has a Costco, Target, Walmart, and Home Depot all within 2 miles of each other.',
      'The Tracy Press Facebook group is a great resource for local news and recommendations.',
      'I-205 connects directly to I-580 for Bay Area commutes — expect 45–90 min to the Bay.',
      'The ACE Train from Downtown Tracy to San Jose is a stress-free commute option.',
    ],
  },
  Lathrop: {
    welcome: 'Welcome to Lathrop! 🎉',
    sub: 'A fast-growing community with new developments, a tight-knit feel, and convenient freeway access to the whole region.',
    schools: [
      { name: 'Lathrop Elementary', grades: 'K–5', rating: '7/10' },
      { name: 'Mossdale Elementary', grades: 'K–5', rating: '7/10' },
      { name: 'Lathrop High School', grades: '9–12', rating: '7/10' },
      { name: 'Manteca Unified (covers Lathrop)', grades: 'K–12', rating: '7/10' },
    ],
    utilities: [
      { name: 'PG&E (Gas & Electric)', desc: 'Set up your gas and electricity account online', url: 'https://www.pge.com' },
      { name: 'City of Lathrop (Water)', desc: 'Water & sewer billing through the city', url: 'https://www.ci.lathrop.ca.us' },
      { name: 'Recology (Trash & Recycling)', desc: 'Curbside pickup — bins provided after signup', url: 'https://www.recology.com' },
      { name: 'Comcast / AT&T', desc: 'Internet & cable options in most neighborhoods', url: 'https://www.xfinity.com' },
    ],
    essentials: [
      { icon: '🛒', label: 'Nearest Costco', value: 'Manteca or Tracy — ~10 min' },
      { icon: '🛍️', label: 'Shopping', value: 'Manteca & Tracy corridors — ~10 min' },
      { icon: '🏥', label: 'Hospital', value: 'Doctors Medical Center, Manteca' },
      { icon: '🚂', label: 'ACE Train', value: 'Lathrop/Manteca Station — very close' },
      { icon: '✈️', label: 'Airport', value: 'SFO ~65 min · OAK ~55 min' },
      { icon: '🏛️', label: 'City Hall', value: '(209) 941-7200' },
    ],
    tips: [
      'Lathrop is one of the fastest-growing cities in California — new amenities are added regularly.',
      'The Lathrop/Manteca ACE Train station makes Bay Area commuting very convenient.',
      'River Islands is a master-planned community within Lathrop with parks and a K–8 school.',
      'Manteca (10 min away) has most major retailers including Costco and Target.',
      'Join the Lathrop Community Facebook group to stay up to date on new businesses and events.',
    ],
  },
  Manteca: {
    welcome: 'Welcome to Manteca! 🎉',
    sub: 'A vibrant city with great shopping, a strong sense of community, and that perfect Central Valley small-town feel.',
    schools: [
      { name: 'Manteca Unified School District', grades: 'K–12', rating: '7/10' },
      { name: 'East Union High School', grades: '9–12', rating: '7/10' },
      { name: 'Manteca High School', grades: '9–12', rating: '7/10' },
      { name: 'Lincoln Elementary', grades: 'K–5', rating: '7/10' },
    ],
    utilities: [
      { name: 'PG&E (Gas & Electric)', desc: 'Set up your gas and electricity account online', url: 'https://www.pge.com' },
      { name: 'City of Manteca (Water)', desc: 'Water & sewer billing through the city', url: 'https://www.ci.manteca.ca.us' },
      { name: 'Recology (Trash & Recycling)', desc: 'Curbside pickup — bins provided after signup', url: 'https://www.recology.com' },
      { name: 'Comcast / AT&T', desc: 'Internet & cable options in most neighborhoods', url: 'https://www.xfinity.com' },
    ],
    essentials: [
      { icon: '🛒', label: 'Costco', value: 'Manteca — right in town' },
      { icon: '🛍️', label: 'Target / Walmart / Home Depot', value: 'All in town on main corridors' },
      { icon: '🏥', label: 'Hospital', value: 'Doctors Medical Center of Manteca' },
      { icon: '🚂', label: 'ACE Train', value: 'Lathrop/Manteca Station' },
      { icon: '✈️', label: 'Airport', value: 'SFO ~70 min · OAK ~60 min' },
      { icon: '🏛️', label: 'City Hall', value: '(209) 456-8000' },
    ],
    tips: [
      'Manteca has its own Costco — one of the best perks of living here!',
      'Downtown Manteca is being revitalized — great local restaurants and boutique shops.',
      'The Manteca Unified School District has strong sports and arts programs.',
      'Big League Dreams sports complex is a major community hub for families.',
      'Summer brings the Manteca Pumpkin Fair — one of the area\'s biggest annual events.',
    ],
  },
}

// ── Checklist cards (shared across cities) ────────────────────────────────────
const CHECKLIST = [
  { icon: '⚡', title: 'Set Up Utilities', desc: 'PG&E, water, and trash pickup — links, account setup guides, and avg monthly costs.', href: '#utilities' },
  { icon: '🏫', title: 'School Enrollment', desc: 'Find your local school district, enrollment forms, and school ratings.', href: '#schools' },
  { icon: '🏥', title: 'Find a Doctor', desc: 'Top-rated primary care, pediatricians, dentists, and urgent care nearby.', href: '/directory?category=Health+%26+Wellness' },
  { icon: '🛒', title: 'Grocery & Shopping', desc: 'Nearest Costco, Target, Safeway, and specialty stores with drive times.', href: '/directory?category=Retail' },
  { icon: '🚌', title: 'Commute Options', desc: 'ACE Train, BART connections, highway routes, and morning commute tips.', href: '#tips' },
  { icon: '📱', title: 'Community Apps', desc: 'MoHo Local, city alert notifications, school apps, and local Facebook groups.', href: '/community' },
  { icon: '🐕', title: 'Pet Resources', desc: 'Dog parks, vets, groomers, and pet-friendly trails in your city.', href: '/directory?category=Pet+Services' },
  { icon: '🏘️', title: 'Know Your Neighborhood', desc: 'Local parks, community centers, events, and who to call for city services.', href: '/events' },
]

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function NewResidentPage({ searchParams }: PageProps) {
  const params = await searchParams
  const rawCity = decodeURIComponent(params.city ?? '').toLowerCase().replace(/\s+/g, '')
  const activeCity: City = CITY_KEYS[rawCity] ?? 'Mountain House'

  const style = CITY_STYLE[activeCity]
  const content = CITY_CONTENT[activeCity]
  const cities: City[] = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca']

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── City Picker ── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {cities.map((city) => {
          const s = CITY_STYLE[city]
          const isActive = city === activeCity
          return (
            <Link
              key={city}
              href={`/new-resident?city=${encodeURIComponent(city)}`}
              className={`text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                isActive
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700'
              }`}
              style={isActive ? { background: style.gradient, borderColor: 'transparent' } : {}}
            >
              {s.emoji} {city}
            </Link>
          )
        })}
      </div>

      {/* ── Welcome Banner ── */}
      <div
        className="rounded-2xl p-7 text-white mb-8 flex items-center justify-between gap-6 flex-wrap"
        style={{ background: style.gradient }}
      >
        <div>
          <h1 className="text-2xl font-extrabold mb-1">{content.welcome}</h1>
          <p className="text-sm opacity-90 max-w-xl">{content.sub}</p>
        </div>
        <Link
          href={`/directory?city=${encodeURIComponent(activeCity)}`}
          className="bg-white text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl shrink-0 hover:opacity-90 transition-all"
        >
          Explore Local Businesses →
        </Link>
      </div>

      {/* ── New Resident Checklist ── */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Your New Resident Checklist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {CHECKLIST.map(({ icon, title, desc, href }) => (
          <Link
            key={title}
            href={href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all group"
          >
            <div className="text-3xl mb-3">{icon}</div>
            <div className="font-bold text-sm text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{title}</div>
            <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
          </Link>
        ))}
      </div>

      {/* ── Two-column: Utilities + Schools ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        {/* Utilities */}
        <div id="utilities" className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⚡ Utilities Setup
          </h2>
          <div className="space-y-3">
            {content.utilities.map(({ name, desc, url }) => (
              <div key={name} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:underline shrink-0"
                >
                  Set up →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Schools */}
        <div id="schools" className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            🏫 Schools in {activeCity}
          </h2>
          <div className="space-y-3">
            {content.schools.map(({ name, grades, rating }) => (
              <div key={name} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900">{name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Grades {grades}</div>
                </div>
                <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-full shrink-0">
                  ★ {rating}
                </span>
              </div>
            ))}
          </div>
          <Link href="/directory?category=Education" className="block text-xs text-blue-600 hover:underline mt-3 font-medium">
            Find tutors & childcare in our directory →
          </Link>
        </div>
      </div>

      {/* ── Essentials Quick-Reference ── */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">📍 Quick Reference</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {content.essentials.map(({ icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xs font-bold text-gray-900 leading-tight">{label}</div>
            <div className="text-xs text-gray-500 mt-1 leading-snug">{value}</div>
          </div>
        ))}
      </div>

      {/* ── Local Tips ── */}
      <div id="tips" className="bg-white rounded-xl border border-gray-200 p-6 mb-10">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          💡 Neighbor Tips for {activeCity}
        </h2>
        <ul className="space-y-3">
          {content.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
              <span
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: style.gradient }}
              >
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Footer CTA ── */}
      <div className="rounded-2xl p-7 text-center" style={{ background: style.gradient }}>
        <h2 className="text-xl font-extrabold text-white mb-2">Ready to explore {activeCity}?</h2>
        <p className="text-white/85 text-sm mb-5">Browse local businesses, upcoming events, and connect with your neighbors.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href={`/directory?city=${encodeURIComponent(activeCity)}`}
            className="bg-white text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
          >
            📋 Business Directory
          </Link>
          <Link
            href="/community"
            className="bg-white/15 border border-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/25 transition-all"
          >
            💬 Community Board
          </Link>
          <Link
            href="/events"
            className="bg-white/15 border border-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/25 transition-all"
          >
            📅 Upcoming Events
          </Link>
        </div>
      </div>
    </div>
  )
}
