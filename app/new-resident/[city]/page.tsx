export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// ─── Slug → canonical city ────────────────────────────────────────────────────
const CITY_SLUGS: Record<string, string> = {
  'mountain-house': 'Mountain House',
  tracy:            'Tracy',
  lathrop:          'Lathrop',
  manteca:          'Manteca',
  brentwood:        'Brentwood',
}

type CityName = 'Mountain House' | 'Tracy' | 'Lathrop' | 'Manteca' | 'Brentwood'
const CITIES: CityName[] = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca', 'Brentwood']
function toSlug(city: string) { return city.toLowerCase().replace(/\s+/g, '-') }

// ─── Themes ───────────────────────────────────────────────────────────────────
const CITY_THEME: Record<CityName, { gradient: string; emoji: string; county: string; chip: string; accent: string }> = {
  'Mountain House': { gradient: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)', emoji: '🏘️', county: 'San Joaquin County', chip: 'bg-blue-50 text-blue-700',   accent: '#1e40af' },
  Tracy:            { gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)', emoji: '🌿', county: 'San Joaquin County', chip: 'bg-green-50 text-green-700',  accent: '#15803d' },
  Lathrop:          { gradient: 'linear-gradient(135deg,#581c87 0%,#7e22ce 100%)', emoji: '🔮', county: 'San Joaquin County', chip: 'bg-purple-50 text-purple-700', accent: '#7e22ce' },
  Manteca:          { gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)', emoji: '🍊', county: 'San Joaquin County', chip: 'bg-orange-50 text-orange-700', accent: '#c2410c' },
  Brentwood:        { gradient: 'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)', emoji: '🌊', county: 'Contra Costa County', chip: 'bg-teal-50 text-teal-700',   accent: '#0d9488' },
}

// ─── Static city content ──────────────────────────────────────────────────────
const CITY_CONTENT: Record<CityName, {
  welcome: string
  sub: string
  schools: { name: string; grades: string; rating: string }[]
  utilities: { name: string; desc: string; url: string }[]
  essentials: { icon: string; label: string; value: string }[]
  tips: string[]
}> = {
  'Mountain House': {
    welcome: 'Welcome to Mountain House! 🎉',
    sub: "One of the Bay Area's fastest-growing planned communities — beautiful parks, top-rated schools, and friendly neighbors await.",
    schools: [
      { name: 'Mountain House Elementary', grades: 'K–5',  rating: '9/10' },
      { name: 'Bethany Elementary',        grades: 'K–5',  rating: '9/10' },
      { name: 'Mountain House Middle',     grades: '6–8',  rating: '8/10' },
      { name: 'Mountain House High',       grades: '9–12', rating: '9/10' },
    ],
    utilities: [
      { name: 'PG&E (Gas & Electric)',      desc: 'Set up your gas and electricity account online',     url: 'https://www.pge.com' },
      { name: 'Mountain House CSD (Water)', desc: 'Water & wastewater services for Mountain House',     url: 'https://www.mhcsd.ca.gov' },
      { name: 'Recology (Trash)',           desc: 'Curbside pickup — bins provided after signup',       url: 'https://www.recology.com' },
      { name: 'Comcast / AT&T Fiber',       desc: 'Internet & cable — fiber available in most areas',  url: 'https://www.xfinity.com' },
    ],
    essentials: [
      { icon: '🛒', label: 'Nearest Costco',    value: 'Tracy — ~10 min' },
      { icon: '🛍️', label: 'Target / Walmart',  value: 'Tracy on 11th St — ~12 min' },
      { icon: '🏥', label: 'Nearest ER',        value: 'Sutter Tracy Community Hospital' },
      { icon: '🚂', label: 'ACE Train',         value: 'Lathrop/Manteca Station — ~15 min' },
      { icon: '✈️', label: 'Airport',           value: 'SFO ~60 min · OAK ~45 min' },
      { icon: '🏛️', label: 'CSD Office',        value: '(209) 831-2300' },
    ],
    tips: [
      'Mountain House has some of the best-rated public schools in San Joaquin County — a huge draw for families.',
      'The Central Community Park has walking trails, a splash pad, and hosts most city events.',
      'Summers get hot (100°F+) — get your A/C serviced in spring before the rush.',
      'Tracy is your nearest city for most big-box shopping, restaurants, and medical care.',
      'Join the Mountain House Community Facebook group — neighbors are incredibly welcoming.',
    ],
  },
  Tracy: {
    welcome: 'Welcome to Tracy! 🎉',
    sub: 'A thriving Central Valley city with excellent shopping, diverse dining, and easy Bay Area access via I-205.',
    schools: [
      { name: 'Tracy Unified School District', grades: 'K–12', rating: '7/10' },
      { name: 'Kimball High School',           grades: '9–12', rating: '8/10' },
      { name: 'West High School',              grades: '9–12', rating: '7/10' },
      { name: 'Monte Vista Middle School',     grades: '6–8',  rating: '7/10' },
    ],
    utilities: [
      { name: 'PG&E (Gas & Electric)', desc: 'Set up your gas and electricity account online',   url: 'https://www.pge.com' },
      { name: 'City of Tracy (Water)', desc: 'Water & sewer billing through the city',           url: 'https://www.cityoftracy.org' },
      { name: 'Recology (Trash)',      desc: 'Curbside pickup — bins provided after signup',     url: 'https://www.recology.com' },
      { name: 'Comcast / AT&T',        desc: 'Internet & cable — multiple providers available',  url: 'https://www.xfinity.com' },
    ],
    essentials: [
      { icon: '🛒', label: 'Costco',        value: 'On Naglee Rd — in town' },
      { icon: '🛍️', label: 'Major Retail',  value: 'Target, Walmart, Home Depot on 11th St' },
      { icon: '🏥', label: 'Hospital',      value: 'Sutter Tracy Community Hospital' },
      { icon: '🚂', label: 'ACE Train',     value: 'Downtown Tracy Station' },
      { icon: '✈️', label: 'Airport',       value: 'SFO ~55 min · OAK ~40 min' },
      { icon: '🏛️', label: 'City Hall',     value: '(209) 831-6000' },
    ],
    tips: [
      'Downtown Tracy has a growing food scene — try the restaurants on 10th and 11th Street.',
      'Tracy has a Costco, Target, Walmart, and Home Depot all within 2 miles of each other.',
      'I-205 connects directly to I-580 for Bay Area commutes — expect 45–90 min to the Bay.',
      'The ACE Train from Downtown Tracy to San Jose is a stress-free commute option.',
      'The Tracy Press Facebook group is a great resource for local news and recommendations.',
    ],
  },
  Lathrop: {
    welcome: 'Welcome to Lathrop! 🎉',
    sub: 'A fast-growing community with new developments, a tight-knit feel, and convenient freeway access to the whole region.',
    schools: [
      { name: 'Lathrop Elementary',    grades: 'K–5',  rating: '7/10' },
      { name: 'Mossdale Elementary',   grades: 'K–5',  rating: '7/10' },
      { name: 'Lathrop High School',   grades: '9–12', rating: '7/10' },
      { name: 'River Islands TK–8',    grades: 'TK–8', rating: '8/10' },
    ],
    utilities: [
      { name: 'PG&E (Gas & Electric)',   desc: 'Set up your gas and electricity account online',     url: 'https://www.pge.com' },
      { name: 'City of Lathrop (Water)', desc: 'Water & sewer billing through the city',             url: 'https://www.ci.lathrop.ca.us' },
      { name: 'Recology (Trash)',        desc: 'Curbside pickup — bins provided after signup',       url: 'https://www.recology.com' },
      { name: 'Comcast / AT&T',          desc: 'Internet & cable options in most neighborhoods',     url: 'https://www.xfinity.com' },
    ],
    essentials: [
      { icon: '🛒', label: 'Nearest Costco', value: 'Manteca or Tracy — ~10 min' },
      { icon: '🛍️', label: 'Shopping',       value: 'Manteca & Tracy corridors — ~10 min' },
      { icon: '🏥', label: 'Hospital',       value: 'Doctors Medical Center, Manteca' },
      { icon: '🚂', label: 'ACE Train',      value: 'Lathrop/Manteca Station — nearby' },
      { icon: '✈️', label: 'Airport',        value: 'SFO ~65 min · OAK ~55 min' },
      { icon: '🏛️', label: 'City Hall',      value: '(209) 941-7200' },
    ],
    tips: [
      'Lathrop is one of the fastest-growing cities in California — new amenities are added regularly.',
      'The Lathrop/Manteca ACE Train station makes Bay Area commuting very convenient.',
      'River Islands is a master-planned community within Lathrop with parks and its own TK–8 school.',
      'Manteca (10 min away) has most major retailers including Costco and Target.',
      'Join the Lathrop Community Facebook group to stay up to date on new businesses and events.',
    ],
  },
  Manteca: {
    welcome: 'Welcome to Manteca! 🎉',
    sub: 'A vibrant city with great shopping, a strong sense of community, and that perfect Central Valley small-town feel.',
    schools: [
      { name: 'Manteca Unified School District', grades: 'K–12', rating: '7/10' },
      { name: 'East Union High School',          grades: '9–12', rating: '7/10' },
      { name: 'Manteca High School',             grades: '9–12', rating: '7/10' },
      { name: 'Lincoln Elementary',              grades: 'K–5',  rating: '7/10' },
    ],
    utilities: [
      { name: 'PG&E (Gas & Electric)',   desc: 'Set up your gas and electricity account online', url: 'https://www.pge.com' },
      { name: 'City of Manteca (Water)', desc: 'Water & sewer billing through the city',         url: 'https://www.ci.manteca.ca.us' },
      { name: 'Recology (Trash)',        desc: 'Curbside pickup — bins provided after signup',   url: 'https://www.recology.com' },
      { name: 'Comcast / AT&T',          desc: 'Internet & cable options in most neighborhoods', url: 'https://www.xfinity.com' },
    ],
    essentials: [
      { icon: '🛒', label: 'Costco',         value: 'In town — very convenient' },
      { icon: '🛍️', label: 'Major Retail',   value: 'Target, Walmart, Home Depot in town' },
      { icon: '🏥', label: 'Hospital',       value: 'Doctors Medical Center of Manteca' },
      { icon: '🚂', label: 'ACE Train',      value: 'Lathrop/Manteca Station' },
      { icon: '✈️', label: 'Airport',        value: 'SFO ~70 min · OAK ~60 min' },
      { icon: '🏛️', label: 'City Hall',      value: '(209) 456-8000' },
    ],
    tips: [
      "Manteca has its own Costco — one of the best perks of living here!",
      'Downtown Manteca is being revitalized with great local restaurants and boutique shops.',
      'Big League Dreams sports complex is a major community hub for families.',
      'The Manteca Unified School District has strong sports and arts programs.',
      "Summer brings the Manteca Pumpkin Fair — one of the area's biggest annual events.",
    ],
  },
  Brentwood: {
    welcome: 'Welcome to Brentwood! 🎉',
    sub: 'A beautiful East Bay gem known for farm-fresh living, award-winning schools, and a community surrounded by vineyards and orchards.',
    schools: [
      { name: 'Heritage High School',       grades: '9–12', rating: '8/10' },
      { name: 'Liberty High School',        grades: '9–12', rating: '8/10' },
      { name: 'Freedom High School',        grades: '9–12', rating: '8/10' },
      { name: 'Brentwood Union Elementary', grades: 'K–8',  rating: '7/10' },
    ],
    utilities: [
      { name: 'PG&E (Gas & Electric)',      desc: 'Set up your gas and electricity account online',     url: 'https://www.pge.com' },
      { name: 'East Bay MUD (Water)',        desc: 'Water & wastewater services for Brentwood area',    url: 'https://www.ebmud.com' },
      { name: 'Delta Diablo (Sanitation)',  desc: 'Wastewater services for East Contra Costa',          url: 'https://www.deltadiablo.org' },
      { name: 'Recology (Trash)',           desc: 'Curbside pickup — bins provided after signup',       url: 'https://www.recology.com' },
    ],
    essentials: [
      { icon: '🛒', label: 'Target / Walmart',  value: 'In town on Lone Tree Way' },
      { icon: '🛒', label: 'Nearest Costco',    value: 'Pittsburg — ~20 min' },
      { icon: '🏥', label: 'Hospital',          value: 'Sutter Delta, Antioch ~15 min' },
      { icon: '🚇', label: 'BART',              value: 'Pittsburg/Bay Point — ~20 min' },
      { icon: '✈️', label: 'Airport',           value: 'OAK ~45 min · SFO ~55 min' },
      { icon: '🏛️', label: 'City Hall',         value: '(925) 516-5444' },
    ],
    tips: [
      "Brentwood is famous for u-pick farms — summer weekends at the local orchards are a must.",
      'Liberty Union High School District has three outstanding high schools — great for teen families.',
      'Highway 4 and Vasco Road are your primary Bay Area connectors — plan for 45–60 min commutes.',
      'The Saturday farmers market in Downtown Brentwood is a beloved weekly community tradition.',
      'Note: Brentwood is in Contra Costa County — utilities, schools, and county services differ from the 209 cities.',
    ],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCategoryEmoji(cat: string): string {
  const c = cat.toLowerCase()
  if (c.includes('restaurant') || c.includes('food') || c.includes('dining')) return '🍽️'
  if (c.includes('health') || c.includes('medical') || c.includes('doctor') || c.includes('dental') || c.includes('wellness')) return '🏥'
  if (c.includes('beauty') || c.includes('salon') || c.includes('spa') || c.includes('hair')) return '💇'
  if (c.includes('retail') || c.includes('shop') || c.includes('store')) return '🛍️'
  if (c.includes('edu') || c.includes('school') || c.includes('tutor') || c.includes('child')) return '🏫'
  if (c.includes('auto') || c.includes('car') || c.includes('vehicle')) return '🚗'
  if (c.includes('real estate') || c.includes('housing')) return '🏠'
  if (c.includes('home') || c.includes('plumb') || c.includes('electric') || c.includes('repair')) return '🔧'
  if (c.includes('pet')) return '🐾'
  return '🏢'
}

// ─── Business card (server component) ────────────────────────────────────────
function BizCard({ biz }: { biz: Business }) {
  return (
    <Link
      href={`/business/${biz.id}`}
      className="group flex gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        {biz.image_url ? (
          <img src={biz.image_url} alt={biz.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">{getCategoryEmoji(biz.category)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors truncate">{biz.name}</div>
        {biz.rating != null && (
          <div className="text-amber-500 text-xs mt-0.5">
            {'★'.repeat(Math.min(5, Math.floor(biz.rating)))}{'☆'.repeat(Math.max(0, 5 - Math.floor(biz.rating)))}
            <span className="text-gray-400 ml-1">{biz.rating.toFixed(1)}</span>
          </div>
        )}
        {biz.address && (
          <div className="text-xs text-gray-500 mt-0.5 truncate">📍 {biz.address}</div>
        )}
        {biz.phone && (
          <div className="text-xs text-gray-500 mt-0.5">📞 {biz.phone}</div>
        )}
      </div>
    </Link>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  id, emoji, title, viewAllHref, children,
}: {
  id: string; emoji: string; title: string; viewAllHref: string; children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-gray-900">{emoji} {title}</h2>
        <Link href={viewAllHref} className="text-xs font-semibold text-blue-600 hover:underline">
          View all in directory →
        </Link>
      </div>
      {children}
    </section>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyBiz({ category, cityName, accent }: { category: string; cityName: string; accent: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-gray-400">
      <p className="text-3xl mb-2">{getCategoryEmoji(category)}</p>
      <p className="text-sm font-medium">No {category} listings yet in {cityName}</p>
      <Link
        href="/submit-business"
        className="inline-block mt-3 text-xs font-semibold px-4 py-1.5 rounded-full text-white"
        style={{ backgroundColor: accent }}
      >
        + Add a business
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { city: slug } = await params
  const cityName = CITY_SLUGS[slug]
  if (!cityName) return {}
  return {
    title: `New Resident Guide — ${cityName} | MoHo Local`,
    description: `Moving to ${cityName}? Find utilities, schools, healthcare, restaurants, and essential services in your new neighborhood.`,
  }
}

export default async function NewResidentCityPage({ params }: PageProps) {
  const { city: slug } = await params
  const cityName = CITY_SLUGS[slug] as CityName | undefined
  if (!cityName) notFound()

  const theme   = CITY_THEME[cityName]
  const content = CITY_CONTENT[cityName]
  const supabase = getSupabaseClient()

  // ── Parallel DB queries ──────────────────────────────────────────────────────
  const [healthRes, foodRes, essentialRes] = await Promise.all([
    supabase
      .from('businesses').select('*')
      .eq('city', cityName).eq('category', 'Health & Wellness').eq('status', 'approved')
      .order('rating', { ascending: false }).limit(6),
    supabase
      .from('businesses').select('*')
      .eq('city', cityName).eq('category', 'Restaurants').eq('status', 'approved')
      .order('rating', { ascending: false }).limit(6),
    supabase
      .from('businesses').select('*')
      .eq('city', cityName).eq('status', 'approved')
      .in('category', ['Home Services', 'Pet Services', 'Automotive', 'Beauty & Spa', 'Retail', 'Education', 'Real Estate'])
      .order('rating', { ascending: false }).limit(8),
  ])

  const healthBizzes    = (healthRes.data    ?? []) as Business[]
  const foodBizzes      = (foodRes.data      ?? []) as Business[]
  const essentialBizzes = (essentialRes.data ?? []) as Business[]

  return (
    <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── City Picker ──────────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CITIES.map((c) => {
          const t = CITY_THEME[c]
          const isActive = c === cityName
          return (
            <Link
              key={c}
              href={`/new-resident/${toSlug(c)}`}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-all ${
                isActive
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'
              }`}
              style={isActive ? { background: t.gradient } : {}}
            >
              {t.emoji} {c}
            </Link>
          )
        })}
      </div>

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-7 text-white mb-8 flex items-center justify-between gap-6 flex-wrap"
        style={{ background: theme.gradient }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">{theme.county} · New Resident Guide</p>
          <h1 className="text-2xl font-extrabold mb-2">{content.welcome}</h1>
          <p className="text-sm opacity-90 max-w-xl leading-relaxed">{content.sub}</p>
        </div>
        <Link
          href={`/directory?city=${encodeURIComponent(cityName)}`}
          className="bg-white font-bold text-sm px-5 py-2.5 rounded-xl shrink-0 hover:opacity-90 transition-all"
          style={{ color: theme.accent }}
        >
          Explore Local Businesses →
        </Link>
      </div>

      {/* ── Jump-to Checklist ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {[
          { icon: '⚡', label: 'Utilities',      href: '#utilities' },
          { icon: '🏥', label: 'Healthcare',     href: '#healthcare' },
          { icon: '🍽️', label: 'Food & Dining',  href: '#food' },
          { icon: '🏫', label: 'Schools',        href: '#schools' },
          { icon: '🔧', label: 'Local Services', href: '#services' },
          { icon: '💡', label: 'Neighbor Tips',  href: '#tips' },
        ].map(({ icon, label, href }) => (
          <a
            key={label}
            href={href}
            className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:-translate-y-0.5 hover:shadow-md transition-all group"
          >
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">{label}</div>
          </a>
        ))}
      </div>

      {/* ── Healthcare ───────────────────────────────────────────────────────── */}
      <Section
        id="healthcare"
        emoji="🏥"
        title={`Healthcare in ${cityName}`}
        viewAllHref={`/directory?city=${encodeURIComponent(cityName)}&category=Health+%26+Wellness`}
      >
        {healthBizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthBizzes.map((biz) => <BizCard key={biz.id} biz={biz} />)}
          </div>
        ) : (
          <EmptyBiz category="Health & Wellness" cityName={cityName} accent={theme.accent} />
        )}
      </Section>

      {/* ── Food & Dining ────────────────────────────────────────────────────── */}
      <Section
        id="food"
        emoji="🍽️"
        title={`Food & Dining in ${cityName}`}
        viewAllHref={`/directory?city=${encodeURIComponent(cityName)}&category=Restaurants`}
      >
        {foodBizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {foodBizzes.map((biz) => <BizCard key={biz.id} biz={biz} />)}
          </div>
        ) : (
          <EmptyBiz category="Restaurants" cityName={cityName} accent={theme.accent} />
        )}
      </Section>

      {/* ── Utilities + Schools ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        {/* Utilities */}
        <div id="utilities" className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-extrabold text-gray-900 mb-4">⚡ Utilities Setup</h2>
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
                  className="text-xs font-semibold hover:underline shrink-0"
                  style={{ color: theme.accent }}
                >
                  Set up →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Schools */}
        <div id="schools" className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-extrabold text-gray-900 mb-4">🏫 Schools in {cityName}</h2>
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
          <Link
            href={`/directory?city=${encodeURIComponent(cityName)}&category=Education`}
            className="block text-xs font-medium hover:underline mt-3"
            style={{ color: theme.accent }}
          >
            Find tutors & childcare in our directory →
          </Link>
        </div>
      </div>

      {/* ── Essential Local Services ─────────────────────────────────────────── */}
      <Section
        id="services"
        emoji="🔧"
        title={`Essential Services in ${cityName}`}
        viewAllHref={`/directory?city=${encodeURIComponent(cityName)}`}
      >
        {essentialBizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {essentialBizzes.map((biz) => <BizCard key={biz.id} biz={biz} />)}
          </div>
        ) : (
          <EmptyBiz category="local services" cityName={cityName} accent={theme.accent} />
        )}
      </Section>

      {/* ── Quick Reference ──────────────────────────────────────────────────── */}
      <h2 className="text-lg font-extrabold text-gray-900 mb-4">📍 Quick Reference</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {content.essentials.map(({ icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xs font-bold text-gray-900 leading-tight">{label}</div>
            <div className="text-xs text-gray-500 mt-1 leading-snug">{value}</div>
          </div>
        ))}
      </div>

      {/* ── Neighbor Tips ────────────────────────────────────────────────────── */}
      <div id="tips" className="bg-white rounded-xl border border-gray-200 p-6 mb-10">
        <h2 className="text-base font-extrabold text-gray-900 mb-4">
          💡 Neighbor Tips for {cityName}
        </h2>
        <ul className="space-y-3">
          {content.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
              <span
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: theme.gradient }}
              >
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Footer CTA ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-7 text-center" style={{ background: theme.gradient }}>
        <h2 className="text-xl font-extrabold text-white mb-2">Ready to explore {cityName}?</h2>
        <p className="text-white/85 text-sm mb-5">
          Browse local businesses, upcoming events, and connect with your new neighbors.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href={`/directory?city=${encodeURIComponent(cityName)}`}
            className="bg-white font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
            style={{ color: theme.accent }}
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
