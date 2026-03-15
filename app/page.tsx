export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

// ── City config ───────────────────────────────────────────────────────────────
const CITIES = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca', 'Brentwood'] as const
type City = (typeof CITIES)[number]

const CITY_CFG: Record<City, {
  slug: string
  emoji: string
  gradient: string
  chip: string
  population: string
  county: string
}> = {
  'Mountain House': {
    slug: 'mountain-house',
    emoji: '🏘️',
    gradient: 'linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)',
    chip: 'bg-blue-50 text-blue-700',
    population: '~31k',
    county: 'San Joaquin County',
  },
  Tracy: {
    slug: 'tracy',
    emoji: '🌿',
    gradient: 'linear-gradient(135deg,#14532d 0%,#16a34a 100%)',
    chip: 'bg-green-50 text-green-700',
    population: '~103k',
    county: 'San Joaquin County',
  },
  Lathrop: {
    slug: 'lathrop',
    emoji: '🔮',
    gradient: 'linear-gradient(135deg,#581c87 0%,#9333ea 100%)',
    chip: 'bg-purple-50 text-purple-700',
    population: '~28k',
    county: 'San Joaquin County',
  },
  Manteca: {
    slug: 'manteca',
    emoji: '🍊',
    gradient: 'linear-gradient(135deg,#7c2d12 0%,#ea580c 100%)',
    chip: 'bg-orange-50 text-orange-700',
    population: '~90k',
    county: 'San Joaquin County',
  },
  Brentwood: {
    slug: 'brentwood',
    emoji: '🌊',
    gradient: 'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)',
    chip: 'bg-teal-50 text-teal-700',
    population: '~65k',
    county: 'Contra Costa County',
  },
}

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: '🍽️', name: 'Restaurants',       cat: 'Restaurants' },
  { icon: '🔧', name: 'Home Services',     cat: 'Home Services' },
  { icon: '🏥', name: 'Health & Wellness', cat: 'Health & Wellness' },
  { icon: '🐾', name: 'Pet Services',      cat: 'Pet Services' },
  { icon: '💇', name: 'Beauty & Spa',      cat: 'Beauty & Spa' },
  { icon: '🚗', name: 'Automotive',        cat: 'Automotive' },
  { icon: '🏫', name: 'Education',         cat: 'Education' },
  { icon: '🏠', name: 'Real Estate',       cat: 'Real Estate' },
  { icon: '🛍️', name: 'Retail',            cat: 'Retail' },
]

// ── Quick-search tags ─────────────────────────────────────────────────────────
const QUICK_TAGS = [
  { label: '🔧 Plumber',     href: '/directory?category=Home+Services' },
  { label: '🍕 Restaurants', href: '/directory?category=Restaurants' },
  { label: '🐾 Pet Care',    href: '/directory?category=Pet+Services' },
  { label: '👶 Childcare',   href: '/directory?category=Education' },
  { label: '💇 Salon',       href: '/directory?category=Beauty+%26+Spa' },
  { label: '🏫 Tutors',      href: '/directory?category=Education' },
  { label: '🏥 Doctors',     href: '/directory?category=Health+%26+Wellness' },
]

// ── Data fetching ─────────────────────────────────────────────────────────────
async function getData(activeCity: City) {
  const supabase = getSupabaseClient()
  const [
    bizTotalResult,
    bizByCityResult,
    eventsResult,
    catCountsResult,
    popularResult,
    trendingResult,
    featuredResult,
    communityCountResult,
    lostFoundCountResult,
    activityPostsResult,
    activityLostResult,
  ] = await Promise.allSettled([
    // Total count
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'approved').eq('verified', true),
    // City breakdown
    supabase.from('businesses').select('city').eq('status', 'approved').eq('verified', true),
    // Upcoming events (next 4)
    supabase
      .from('events')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(4),
    // Category counts
    supabase.from('businesses').select('category').eq('status', 'approved').eq('verified', true),
    // Popular: top rated in active city
    supabase
      .from('businesses')
      .select('*')
      .eq('city', activeCity)
      .eq('status', 'approved')
      .eq('verified', true)
      .not('rating', 'is', null)
      .order('rating', { ascending: false })
      .limit(6),
    // Trending: most reviewed in active city (proxy for most-visited/discussed)
    supabase
      .from('businesses')
      .select('*')
      .eq('city', activeCity)
      .eq('status', 'approved')
      .eq('verified', true)
      .not('review_count', 'is', null)
      .order('review_count', { ascending: false })
      .order('rating', { ascending: false })
      .limit(6),
    // Featured businesses
    supabase
      .from('businesses')
      .select('*')
      .eq('status', 'approved')
      .eq('verified', true)
      .eq('featured', true)
      .order('name')
      .limit(6),
    // Community posts count
    supabase.from('community_posts').select('*', { count: 'exact', head: true }),
    // Active lost & found count
    supabase.from('lost_and_found').select('*', { count: 'exact', head: true }).neq('status', 'reunited'),
    // Recent community posts for activity strip
    supabase
      .from('community_posts')
      .select('id, title, category, city, created_at')
      .order('created_at', { ascending: false })
      .limit(4),
    // Recent lost & found for activity strip
    supabase
      .from('lost_and_found')
      .select('id, pet_name, type, city, created_at, status')
      .neq('status', 'reunited')
      .order('created_at', { ascending: false })
      .limit(3),
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

  // Trending: deduplicate against popular to show different businesses
  const popularIds = new Set(popularBiz.map((b) => b.id))
  const trendingRaw: Business[] =
    trendingResult.status === 'fulfilled' ? (trendingResult.value.data ?? []) as Business[] : []
  const trendingBiz = trendingRaw.filter((b) => !popularIds.has(b.id)).slice(0, 6)
  // If all trending overlaps with popular, just show trending as-is (better than empty)
  const trendingFinal = trendingBiz.length >= 2 ? trendingBiz : trendingRaw.slice(0, 6)

  const featuredBiz: Business[] =
    featuredResult.status === 'fulfilled' ? (featuredResult.value.data ?? []) as Business[] : []

  const communityPostCount =
    communityCountResult.status === 'fulfilled' ? (communityCountResult.value.count ?? 0) : 0

  const lostFoundCount =
    lostFoundCountResult.status === 'fulfilled' ? (lostFoundCountResult.value.count ?? 0) : 0

  // ── Activity strip items ─────────────────────────────────────────────────────
  type ActivityItem = {
    id: string; title: string; type: 'Community' | 'Lost Pet' | 'Event'
    city: string; href: string; created_at: string
  }
  const rawPosts: ActivityItem[] =
    activityPostsResult.status === 'fulfilled'
      ? (activityPostsResult.value.data ?? []).map((p: Record<string, unknown>) => ({
          id:         String(p.id ?? ''),
          title:      String(p.title ?? ''),
          type:       'Community' as const,
          city:       String(p.city ?? ''),
          href:       `/community/${p.id}`,
          created_at: String(p.created_at ?? ''),
        }))
      : []

  const rawLost: ActivityItem[] =
    activityLostResult.status === 'fulfilled'
      ? (activityLostResult.value.data ?? []).map((l: Record<string, unknown>) => ({
          id:         String(l.id ?? ''),
          title:      `Lost ${l.type ?? 'pet'}: ${l.pet_name ?? 'Unknown'}`,
          type:       'Lost Pet' as const,
          city:       String(l.city ?? ''),
          href:       '/lost-and-found',
          created_at: String(l.created_at ?? ''),
        }))
      : []

  // Events as fallback — pad the strip when community posts + lost pets are sparse
  const rawEvents: ActivityItem[] = (
    eventsResult.status === 'fulfilled' ? (eventsResult.value.data ?? []) : []
  ).map((e: Record<string, unknown>) => ({
    id:         String(e.id ?? ''),
    title:      String(e.title ?? ''),
    type:       'Event' as const,
    city:       String(e.city ?? ''),
    href:       '/events',
    created_at: String(e.start_date ?? e.created_at ?? ''),
  }))

  // Interleave posts + lost pets; pad with events if fewer than 3 items, take top 5
  const combinedBeforeEvents: ActivityItem[] = [...rawPosts, ...rawLost]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const existingIds = new Set(combinedBeforeEvents.map((i) => i.id))
  const eventPadding = rawEvents.filter((e) => !existingIds.has(e.id))

  const activityItems: ActivityItem[] =
    combinedBeforeEvents.length >= 3
      ? combinedBeforeEvents.slice(0, 5)
      : [...combinedBeforeEvents, ...eventPadding].slice(0, 5)

  return {
    totalBiz,
    cityBizMap,
    upcomingEvents,
    catCountMap,
    popularBiz,
    trendingFinal,
    featuredBiz,
    communityPostCount,
    lostFoundCount,
    activityItems,
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)   return `${days}d ago`
  return 'Recently'
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

// ── Business mini-card (shared by Featured, Trending, Popular) ────────────────
function BizMiniCard({
  biz, gradientOverride, chipOverride, badge,
}: {
  biz: Business
  gradientOverride?: string
  chipOverride?: string
  badge?: string
}) {
  const fallbackCfg = CITY_CFG[biz.city as City] ?? CITY_CFG['Mountain House']
  const gradient = gradientOverride ?? fallbackCfg.gradient
  const chip     = chipOverride     ?? fallbackCfg.chip
  return (
    <Link
      href={`/business/${biz.id}`}
      className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all relative"
    >
      {badge && (
        <span className="absolute top-2 right-2 text-[9px] font-bold text-orange-500">{badge}</span>
      )}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm"
        style={{ background: gradient }}
      >
        <span>{getCategoryEmoji(biz.category)}</span>
      </div>
      <h3 className="font-bold text-xs text-gray-900 group-hover:text-blue-700 transition leading-snug line-clamp-2 mb-1">
        {biz.name}
      </h3>
      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${chip}`}>
        {biz.category}
      </span>
      {biz.rating != null && (
        <div className="text-xs text-amber-500 font-semibold mt-1.5">
          ★ {biz.rating.toFixed(1)}
        </div>
      )}
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
interface PageProps {
  searchParams: Promise<{ city?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams

  // Resolve city from slug param
  const activeCity: City =
    (CITIES.find(
      (c) => CITY_CFG[c].slug === (params.city ?? '').toLowerCase()
    ) as City) ?? 'Mountain House'

  const cfg = CITY_CFG[activeCity]
  const {
    totalBiz,
    cityBizMap,
    upcomingEvents,
    catCountMap,
    popularBiz,
    trendingFinal,
    featuredBiz,
    communityPostCount,
    lostFoundCount,
    activityItems,
  } = await getData(activeCity)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Hero ── */}
      <div
        className="rounded-2xl px-6 sm:px-8 py-12 text-center text-white mb-8"
        style={{ background: cfg.gradient }}
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
          Your Local Community Hub
        </h1>
        <p className="text-sm opacity-85 mb-6">
          Find local businesses, connect with neighbors, discover events across Mountain House, Tracy, Lathrop, Manteca &amp; Brentwood
        </p>

        <form action="/directory" method="GET" className="flex gap-2 max-w-xl mx-auto mb-5 flex-col sm:flex-row">
          <input
            name="q"
            type="text"
            placeholder="🔍  Search businesses, services..."
            className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm outline-none border-0"
          />
          <button
            type="submit"
            className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-[#1e3a5f] font-bold px-6 py-3 rounded-xl text-sm whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2 justify-center flex-wrap">
          {QUICK_TAGS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="bg-white/15 text-white px-3 py-1.5 rounded-full text-xs hover:bg-white/25 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Browse by City ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Browse by City</h2>
        <Link href="/directory" className="text-sm text-blue-600 hover:underline font-medium">
          All Cities →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
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
              <div className="text-base font-extrabold mb-0.5">{city}</div>
              <div className="text-[10px] opacity-70 mb-3">{c.county}</div>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        <Link
          href="/directory"
          className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-3xl font-extrabold text-[#1e3a5f]">{totalBiz}</div>
          <div className="text-xs text-gray-500 mt-1">Total Listings</div>
        </Link>
        <Link
          href="/events"
          className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-3xl font-extrabold text-[#1e3a5f]">{upcomingEvents.length}</div>
          <div className="text-xs text-gray-500 mt-1">Upcoming Events</div>
        </Link>
        <Link
          href="/community"
          className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-3xl font-extrabold text-[#1e3a5f]">{communityPostCount}</div>
          <div className="text-xs text-gray-500 mt-1">Community Posts</div>
        </Link>
        <Link
          href="/lost-and-found"
          className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="text-3xl font-extrabold text-[#1e3a5f]">{lostFoundCount}</div>
          <div className="text-xs text-gray-500 mt-1">Active Pet Listings</div>
        </Link>
      </div>

      {/* ── Browse by Category ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Browse by Category</h2>
        <Link href="/discover" className="text-sm text-blue-600 hover:underline font-medium">
          Explore all cities →
        </Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3 mb-12">
        {CATEGORIES.map(({ icon, name, cat }) => {
          const count = catCountMap[cat] ?? 0
          // Use active city slug for direct city+category routing
          const catSlug = cat
            .toLowerCase()
            .replace(' & ', '-')
            .replace(/ /g, '-')
            .replace(/[^a-z0-9-]/g, '')
          return (
            <Link
              key={name}
              href={`/${cfg.slug}/${catSlug}`}
              className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-400 transition-all block"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-xs font-semibold text-gray-800 leading-tight">{name}</div>
              {count > 0 && (
                <div className="text-[10px] font-semibold text-gray-400 mt-1 bg-gray-50 rounded-full px-1.5 py-0.5 inline-block">
                  {count}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* ── Featured Businesses ── */}
      {featuredBiz.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⭐</span>
              <h2 className="text-lg font-bold text-gray-900">Featured Businesses</h2>
              {/* Sponsored label — intentional paid placement indicator */}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-700 tracking-wide uppercase">
                Sponsored
              </span>
            </div>
            <Link href="/directory" className="text-sm text-blue-600 hover:underline font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {featuredBiz.map((biz) => {
              const c = CITY_CFG[biz.city as City] ?? CITY_CFG['Mountain House']
              return (
                <Link
                  key={biz.id}
                  href={`/business/${biz.id}`}
                  className="group bg-white rounded-xl border-2 border-amber-300 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all relative"
                >
                  <span className="absolute top-2 right-2 text-[9px] font-bold text-amber-600">⭐</span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm"
                    style={{ background: c.gradient }}
                  >
                    <span>{getCategoryEmoji(biz.category)}</span>
                  </div>
                  <h3 className="font-bold text-xs text-gray-900 group-hover:text-blue-700 transition leading-snug line-clamp-2 mb-1">
                    {biz.name}
                  </h3>
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.chip}`}>
                    {biz.city}
                  </span>
                  {biz.rating != null && (
                    <div className="text-xs text-amber-500 font-semibold mt-1.5">
                      ★ {biz.rating.toFixed(1)}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Trending in {City} ── */}
      {trendingFinal.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                🔥 Trending in {activeCity}
              </h2>
            </div>
            <Link
              href={`/directory?city=${encodeURIComponent(activeCity)}`}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {trendingFinal.map((biz) => (
              <BizMiniCard
                key={biz.id}
                biz={biz}
                gradientOverride={cfg.gradient}
                chipOverride={cfg.chip}
                badge="🔥"
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Popular in {City} ── */}
      {popularBiz.length > 0 && (
        <div className="mb-12">
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
              <BizMiniCard
                key={biz.id}
                biz={biz}
                gradientOverride={cfg.gradient}
                chipOverride={cfg.chip}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Upcoming Events ── */}
      {upcomingEvents.length > 0 && (
        <div className="mb-12">
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
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden flex hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className="text-white px-3 py-4 text-center min-w-[56px] flex flex-col items-center justify-center shrink-0"
                    style={{ background: c.gradient }}
                  >
                    <div className="text-[10px] uppercase opacity-75 font-semibold">{month}</div>
                    <div className="text-2xl font-extrabold leading-none">{day}</div>
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition-colors leading-snug mb-1 line-clamp-2">
                      {event.title}
                    </div>
                    {event.location && (
                      <div className="text-xs text-gray-500 line-clamp-1">
                        📍 {event.location}
                      </div>
                    )}
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5 ${c.chip}`}>
                      {event.city}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── People are talking about… (Activity Strip) ── */}
      {activityItems.length > 0 && (
        <div className="mb-12">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">People are talking about…</h2>
            <p className="text-xs text-gray-400 mt-0.5">Recent local buzz from across the community</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activityItems.map((item) => {
              const cityColor = {
                'Mountain House': { bg: 'bg-blue-50',   text: 'text-blue-700'   },
                'Tracy':          { bg: 'bg-green-50',  text: 'text-green-700'  },
                'Lathrop':        { bg: 'bg-purple-50', text: 'text-purple-700' },
                'Manteca':        { bg: 'bg-orange-50', text: 'text-orange-700' },
                'Brentwood':      { bg: 'bg-teal-50',   text: 'text-teal-700'   },
              }[item.city] ?? { bg: 'bg-gray-50', text: 'text-gray-600' }

              const typeBadge = {
                'Community': { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: '💬' },
                'Lost Pet':  { bg: 'bg-red-50',    text: 'text-red-600',    icon: '🐾' },
                'Event':     { bg: 'bg-emerald-50',text: 'text-emerald-600',icon: '📅' },
              }[item.type] ?? { bg: 'bg-gray-50', text: 'text-gray-600', icon: '📌' }

              return (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  className="group flex items-start gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <span className="text-xl mt-0.5 shrink-0">{typeBadge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 line-clamp-2 leading-snug mb-1.5 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBadge.bg} ${typeBadge.text}`}>
                        {item.type}
                      </span>
                      {item.city && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cityColor.bg} ${cityColor.text}`}>
                          {item.city}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 ml-auto">
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="mt-3 text-right">
            <Link href="/community" className="text-xs text-blue-500 hover:underline font-medium">
              See all community posts →
            </Link>
          </div>
        </div>
      )}

      {/* ── Quick-nav cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {[
          { href: '/directory',    icon: '📋', label: 'Business Directory', desc: 'Find local services & shops' },
          { href: '/events',       icon: '📅', label: 'Events Calendar',    desc: "What's happening near you" },
          { href: '/community',    icon: '💬', label: 'Community Board',    desc: 'Connect with neighbors' },
          { href: '/lost-and-found', icon: '🐾', label: 'Lost & Found',    desc: 'Help reunite pets' },
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
