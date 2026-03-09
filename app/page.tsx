export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

// ── City config ───────────────────────────────────────────────────────────────
const CITIES = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca'] as const
type City = (typeof CITIES)[number]

const CITY_CFG: Record<
  City,
  {
    slug: string          // URL slug: mountain-house, tracy, etc.
    emoji: string
    gradient: string
    chip: string
    population: string
    heroTitle: string
  }
> = {
  'Mountain House': {
    slug: 'mountain-house',
    emoji: '🏘️',
    gradient: 'linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)',
    chip: 'bg-blue-50 text-blue-700',
    population: '~31k',
    heroTitle: 'Your Mountain House Community Hub',
  },
  Tracy: {
    slug: 'tracy',
    emoji: '🌿',
    gradient: 'linear-gradient(135deg,#14532d 0%,#16a34a 100%)',
    chip: 'bg-green-50 text-green-700',
    population: '~103k',
    heroTitle: 'Your Tracy Community Hub',
  },
  Lathrop: {
    slug: 'lathrop',
    emoji: '🔮',
    gradient: 'linear-gradient(135deg,#581c87 0%,#9333ea 100%)',
    chip: 'bg-purple-50 text-purple-700',
    population: '~28k',
    heroTitle: 'Your Lathrop Community Hub',
  },
  Manteca: {
    slug: 'manteca',
    emoji: '🍊',
    gradient: 'linear-gradient(135deg,#7c2d12 0%,#ea580c 100%)',
    chip: 'bg-orange-50 text-orange-700',
    population: '~90k',
    heroTitle: 'Your Manteca Community Hub',
  },
}

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: '🔧', name: 'Home Services', cat: 'Home Services' },
  { icon: '🍽️', name: 'Restaurants',   cat: 'Restaurants' },
  { icon: '🏥', name: 'Health & Wellness', cat: 'Health & Wellness' },
  { icon: '🐾', name: 'Pet Services',  cat: 'Pet Services' },
  { icon: '💇', name: 'Beauty & Spa',  cat: 'Beauty & Spa' },
  { icon: '🚗', name: 'Auto Services', cat: 'Automotive' },
  { icon: '🏫', name: 'Education',     cat: 'Education' },
  { icon: '🏠', name: 'Real Estate',   cat: 'Real Estate' },
]

// ── Data fetching ─────────────────────────────────────────────────────────────
async function getData(activeCity: City) {
  const supabase = getSupabaseClient()
  const [bizTotalResult, bizByCityResult, eventsResult, catCountsResult, popularResult] =
    await Promise.allSettled([
      // Total count
      supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      // City breakdown
      supabase.from('businesses').select('city').eq('status', 'approved'),
      // Upcoming events (next 4)
      supabase
        .from('events')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(4),
      // Category counts
      supabase.from('businesses').select('category').eq('status', 'approved'),
      // Popular businesses in active city
      supabase
        .from('businesses')
        .select('*')
        .eq('city', activeCity)
        .eq('status', 'approved')
        .not('rating', 'is', null)
        .order('rating', { ascending: false })
        .limit(6),
    ])

  const totalBiz =
    bizTotalResult.status === 'fulfilled' ? (bizTotalResult.value.count ?? 0) : 0

  const cityBizMap: Record<string, number> = {}
  if (bizByCityResult.status === 'fulfilled' && bizByCityResult.value.data) {
    for (const row of bizByCityResult.value.data) {
      cityBizMap[row.city] = (cityBizMap[row.city] ?? 0) + 1
    }
  }

  const catCountMap: Record<string, number> = {}
  if (catCountsResult.status === 'fulfilled' && catCountsResult.value.data) {
    for (const row of catCountsResult.value.data) {
      catCountMap[row.category] = (catCountMap[row.category] ?? 0) + 1
    }
  }

  const upcomingEvents =
    eventsResult.status === 'fulfilled' ? (eventsResult.value.data ?? []) : []

  const popularBiz: Business[] =
    popularResult.status === 'fulfilled' ? (popularResult.value.data ?? []) as Business[] : []

  return { totalBiz, cityBizMap, upcomingEvents, catCountMap, popularBiz }
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: d.getDate(),
  }
}

function getCategoryEmoji(category: string): string {
  const c = category.toLowerCase()
  if (c.includes('restaurant') || c.includes('food')) return '🍽️'
  if (c.includes('home') || c.includes('plumb') || c.includes('repair')) return '🔧'
  if (c.includes('health') || c.includes('medical') || c.includes('dental')) return '🏥'
  if (c.includes('pet')) return '🐾'
  if (c.includes('beauty') || c.includes('salon') || c.includes('spa')) return '💇'
  if (c.includes('auto') || c.includes('car')) return '🚗'
  if (c.includes('edu') || c.includes('school') || c.includes('tutor')) return '🏫'
  if (c.includes('real estate')) return '🏠'
  if (c.includes('retail') || c.includes('shop')) return '🛍️'
  return '🏢'
}

// ── Page ──────────────────────────────────────────────────────────────────────
interface PageProps {
  searchParams: Promise<{ city?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams

  // Match city slug param to a valid city (e.g. ?city=mountain-house → 'Mountain House')
  const activeCity: City =
    (CITIES.find(
      (c) => CITY_CFG[c].slug === (params.city ?? '').toLowerCase()
    ) as City) ?? 'Mountain House'

  const cfg = CITY_CFG[activeCity]
  const { totalBiz, cityBizMap, upcomingEvents, catCountMap, popularBiz } = await getData(activeCity)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Hero ── */}
      <div
        className="rounded-2xl px-6 sm:px-8 py-12 text-center text-white mb-8"
        style={{ background: cfg.gradient }}
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">{cfg.heroTitle}</h1>
        <p className="text-sm opacity-85 mb-6">
          Find local businesses, connect with neighbors, discover events — all in one place
        </p>
        <div className="flex gap-2 max-w-xl mx-auto mb-5 flex-col sm:flex-row">
          <input
            type="text"
            placeholder="🔍  Search businesses, services..."
            className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm outline-none border-0"
          />
          <button className="bg-amber-400 text-[#1e3a5f] font-bold px-6 py-3 rounded-xl text-sm whitespace-nowrap">
            Search
          </button>
        </div>
        <div className="flex gap-2 justify-center flex-wrap">
          {['🔧 Plumber', '🍕 Restaurants', '🐾 Pet Care', '👶 Childcare', '💇 Salon', '🏫 Tutors', '🏥 Doctors'].map(
            (tag) => (
              <span
                key={tag}
                className="bg-white/15 text-white px-3 py-1.5 rounded-full text-xs cursor-pointer hover:bg-white/25 transition-all"
              >
                {tag}
              </span>
            )
          )}
        </div>
      </div>

      {/* ── Browse by City ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Browse by City</h2>
        <Link href="/directory" className="text-sm text-blue-600 hover:underline font-medium">
          All Cities →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {CITIES.map((city) => {
          const c = CITY_CFG[city]
          const count = cityBizMap[city] ?? 0
          const isActive = city === activeCity
          return (
            <Link
              key={city}
              href={`/${c.slug}`}
              className="rounded-2xl p-5 text-white relative overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all block"
              style={{ background: c.gradient }}
            >
              {isActive && (
                <span className="absolute top-3 right-3 bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Selected
                </span>
              )}
              <div className="text-base font-extrabold mb-1">{city}</div>
              <div className="text-xs opacity-75 mb-3">San Joaquin County</div>
              <div className="flex gap-4">
                <div className="text-xs opacity-85">
                  <strong className="block text-base font-extrabold">{count || '—'}</strong>
                  Businesses
                </div>
                <div className="text-xs opacity-85">
                  <strong className="block text-base font-extrabold">{c.population}</strong>
                  Pop.
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-extrabold text-[#1e3a5f]">{totalBiz}</div>
          <div className="text-xs text-gray-500 mt-1">Total Listings</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-extrabold text-[#1e3a5f]">4</div>
          <div className="text-xs text-gray-500 mt-1">Cities Covered</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-extrabold text-[#1e3a5f]">9</div>
          <div className="text-xs text-gray-500 mt-1">Categories</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="text-3xl font-extrabold text-[#1e3a5f]">{upcomingEvents.length}</div>
          <div className="text-xs text-gray-500 mt-1">Upcoming Events</div>
        </div>
      </div>

      {/* ── Browse by Category ── */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by Category</h2>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 mb-8">
        {CATEGORIES.map(({ icon, name, cat }) => {
          const count = catCountMap[cat] ?? 0
          return (
            <Link
              key={name}
              href={`/directory?category=${encodeURIComponent(cat)}`}
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-400 transition-all block"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-xs font-semibold text-gray-800 leading-tight">{name}</div>
              {count > 0 && (
                <div className="text-[10px] text-gray-400 mt-1">{count}</div>
              )}
            </Link>
          )
        })}
      </div>

      {/* ── Popular Near You ── */}
      {popularBiz.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Popular in {activeCity}
            </h2>
            <Link
              href={`/directory?city=${encodeURIComponent(activeCity)}`}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularBiz.map((biz) => (
              <Link
                key={biz.id}
                href={`/business/${biz.id}`}
                className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm"
                  style={{ background: cfg.gradient }}
                >
                  <span>{getCategoryEmoji(biz.category)}</span>
                </div>
                <h3 className="font-bold text-xs text-gray-900 group-hover:text-blue-700 transition leading-snug line-clamp-2 mb-1">
                  {biz.name}
                </h3>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.chip}`}>
                  {biz.category}
                </span>
                {biz.rating && (
                  <div className="text-xs text-amber-500 font-semibold mt-1.5">
                    ★ {biz.rating.toFixed(1)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Upcoming Events ── */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
            <Link href="/events" className="text-sm text-blue-600 hover:underline font-medium">
              Full calendar →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingEvents.map((event) => {
              const { month, day } = formatEventDate(event.start_date)
              const c = CITY_CFG[event.city as City] ?? CITY_CFG['Mountain House']
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden flex hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <div
                    className="text-white px-3 py-4 text-center min-w-[56px] flex flex-col items-center justify-center shrink-0"
                    style={{ background: c.gradient }}
                  >
                    <div className="text-[10px] uppercase opacity-75 font-semibold">{month}</div>
                    <div className="text-2xl font-extrabold leading-none">{day}</div>
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 leading-snug mb-1 line-clamp-2">
                      {event.title}
                    </div>
                    {event.location && (
                      <div className="text-xs text-gray-500 line-clamp-1">
                        📍 {event.location}
                      </div>
                    )}
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${c.chip}`}
                    >
                      {event.city}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Quick-nav cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/directory', icon: '📋', label: 'Business Directory', desc: 'Find local services & shops' },
          { href: '/events', icon: '📅', label: 'Events Calendar', desc: "What's happening near you" },
          { href: '/community', icon: '💬', label: 'Community Board', desc: 'Connect with neighbors' },
          { href: '/lost-and-found', icon: '🐾', label: 'Lost & Found', desc: 'Help reunite pets' },
        ].map(({ href, icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-bold text-sm text-gray-900 mb-1">{label}</div>
            <div className="text-xs text-gray-500">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
