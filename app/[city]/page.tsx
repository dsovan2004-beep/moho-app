export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// ── City config ───────────────────────────────────────────────────────────────

const CITY_MAP: Record<string, string> = {
  'mountain-house': 'Mountain House',
  'tracy':          'Tracy',
  'lathrop':        'Lathrop',
  'manteca':        'Manteca',
  'brentwood':      'Brentwood',
}

const COUNTY_MAP: Record<string, string> = {
  'Mountain House': 'San Joaquin County',
  'Tracy':          'San Joaquin County',
  'Lathrop':        'San Joaquin County',
  'Manteca':        'San Joaquin County',
  'Brentwood':      'Contra Costa County',
}

const CITY_CFG: Record<string, {
  gradient: string
  chip: string
  emoji: string
  description: string
  population: string
  tagline: string
}> = {
  'Mountain House': {
    gradient: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)',
    chip: 'bg-blue-50 text-blue-700',
    emoji: '🏘️',
    description: 'A master-planned community in western San Joaquin County — diverse, fast-growing, and close-knit. Home to one of the largest South Asian communities in the Central Valley.',
    population: '~31k',
    tagline: 'Mountain House\'s local business directory',
  },
  Tracy: {
    gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)',
    chip: 'bg-green-50 text-green-700',
    emoji: '🌿',
    description: 'A thriving Bay Area bedroom community with deep roots, great schools, a growing downtown, and one of the most active local economies in the 209.',
    population: '~103k',
    tagline: 'Find the best local businesses in Tracy, CA',
  },
  Lathrop: {
    gradient: 'linear-gradient(135deg,#581c87 0%,#7e22ce 100%)',
    chip: 'bg-purple-50 text-purple-700',
    emoji: '🔮',
    description: 'One of California\'s fastest-growing cities, nestled along the San Joaquin Delta. Big logistics hub, but an even bigger community spirit.',
    population: '~28k',
    tagline: 'Lathrop\'s local business guide',
  },
  Manteca: {
    gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)',
    chip: 'bg-orange-50 text-orange-700',
    emoji: '🍊',
    description: 'A family-friendly city with proud agricultural roots, a booming dining scene, and neighborhoods that still feel like hometown America.',
    population: '~90k',
    tagline: 'Find local businesses in Manteca, CA',
  },
  Brentwood: {
    gradient: 'linear-gradient(135deg,#0f5040 0%,#0d9488 100%)',
    chip: 'bg-teal-50 text-teal-700',
    emoji: '🌾',
    description: 'A fast-growing East Bay gem in Contra Costa County — known for its U-pick farms, top-rated schools, and a welcoming small-town spirit just 50 miles from San Francisco.',
    population: '~65k',
    tagline: 'Find local businesses in Brentwood, CA',
  },
}

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Restaurants',       emoji: '🍽️', slug: 'restaurants' },
  { name: 'Home Services',     emoji: '🔧', slug: 'home-services' },
  { name: 'Health & Wellness', emoji: '🏥', slug: 'health-wellness' },
  { name: 'Automotive',        emoji: '🚗', slug: 'automotive' },
  { name: 'Beauty & Spa',      emoji: '💇', slug: 'beauty-spa' },
  { name: 'Pet Services',      emoji: '🐾', slug: 'pet-services' },
  { name: 'Education',         emoji: '🏫', slug: 'education' },
  { name: 'Real Estate',       emoji: '🏠', slug: 'real-estate' },
  { name: 'Retail',            emoji: '🛍️', slug: 'retail' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCategoryEmoji(category: string): string {
  const c = category.toLowerCase()
  if (c.includes('restaurant') || c.includes('food') || c.includes('dining')) return '🍽️'
  if (c.includes('home') || c.includes('plumb') || c.includes('electric') || c.includes('repair') || c.includes('contractor')) return '🔧'
  if (c.includes('health') || c.includes('medical') || c.includes('doctor') || c.includes('dental')) return '🏥'
  if (c.includes('pet')) return '🐾'
  if (c.includes('beauty') || c.includes('salon') || c.includes('spa') || c.includes('hair')) return '💇'
  if (c.includes('auto') || c.includes('car') || c.includes('vehicle')) return '🚗'
  if (c.includes('edu') || c.includes('school') || c.includes('tutor') || c.includes('child')) return '🏫'
  if (c.includes('real estate') || c.includes('housing')) return '🏠'
  if (c.includes('retail') || c.includes('shop') || c.includes('store')) return '🛍️'
  if (c.includes('fit') || c.includes('gym')) return '🏋️'
  return '🏢'
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getCityData(cityName: string) {
  const supabase = getSupabaseClient()
  const [popularResult, recentResult, catCountsResult] = await Promise.allSettled([
    // Top-rated businesses in this city
    supabase
      .from('businesses')
      .select('*')
      .eq('city', cityName)
      .eq('status', 'approved')
      .eq('verified', true)
      .not('rating', 'is', null)
      .order('rating', { ascending: false })
      .limit(6),
    // Most recently added
    supabase
      .from('businesses')
      .select('*')
      .eq('city', cityName)
      .eq('status', 'approved')
      .eq('verified', true)
      .order('created_at', { ascending: false })
      .limit(4),
    // Category counts for this city
    supabase
      .from('businesses')
      .select('category')
      .eq('city', cityName)
      .eq('status', 'approved')
      .eq('verified', true),
  ])

  const popular = popularResult.status === 'fulfilled'
    ? (popularResult.value.data ?? []) as Business[]
    : []

  const recent = recentResult.status === 'fulfilled'
    ? (recentResult.value.data ?? []) as Business[]
    : []

  const catCounts: Record<string, number> = {}
  if (catCountsResult.status === 'fulfilled' && catCountsResult.value.data) {
    for (const row of catCountsResult.value.data) {
      catCounts[row.category] = (catCounts[row.category] ?? 0) + 1
    }
  }

  const total = Object.values(catCounts).reduce((sum, n) => sum + n, 0)

  return { popular, recent, catCounts, total }
}

// ── SEO Metadata ──────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { city: citySlug } = await params
  const cityName = CITY_MAP[citySlug]
  if (!cityName) return { title: 'MoHoLocal' }
  const cfg = CITY_CFG[cityName]
  return {
    title: `${cityName} Local Businesses & Directory | MoHoLocal`,
    description: `Find the best local businesses in ${cityName}, CA — restaurants, home services, health & wellness, automotive, and more. Your hyperlocal ${COUNTY_MAP[cityName] ?? 'California'} directory.`,
    openGraph: {
      title: `${cityName} Local Directory | MoHoLocal`,
      description: cfg.tagline,
      url: `https://www.moholocal.com/${citySlug}`,
      siteName: 'MoHoLocal',
    },
  }
}

// ── Business card ─────────────────────────────────────────────────────────────

function BusinessCard({
  biz,
  cfg,
}: {
  biz: Business
  cfg: (typeof CITY_CFG)[string]
}) {
  const emoji = getCategoryEmoji(biz.category)
  return (
    <Link
      href={`/business/${biz.id}`}
      className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all block"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm"
          style={{ background: cfg.gradient }}
        >
          <span>{emoji}</span>
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition leading-snug line-clamp-2">
            {biz.name}
          </h3>
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${cfg.chip}`}>
            {biz.category}
          </span>
          {biz.rating && (
            <div className="text-xs text-amber-500 font-semibold mt-1">
              ★ {biz.rating.toFixed(1)}
              {biz.review_count ? (
                <span className="text-gray-400 font-normal ml-1">({biz.review_count})</span>
              ) : null}
            </div>
          )}
          {biz.phone && (
            <div className="text-xs text-gray-400 mt-1 truncate">📞 {biz.phone}</div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CityPage({ params }: PageProps) {
  const { city: citySlug } = await params
  const cityName = CITY_MAP[citySlug]
  if (!cityName) notFound()

  const cfg = CITY_CFG[cityName]
  const { popular, recent, catCounts, total } = await getCityData(cityName)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-5 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition">Home</Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">{cfg.emoji} {cityName}</span>
      </nav>

      {/* ── Hero ── */}
      <div
        className="rounded-2xl px-7 py-12 text-white mb-8 relative overflow-hidden"
        style={{ background: cfg.gradient }}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="text-5xl mb-4">{cfg.emoji}</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{cityName}, CA</h1>
          <p className="text-white/80 text-sm leading-relaxed mb-2">{cfg.description}</p>
          <p className="text-white/50 text-xs mb-6">
            Population {cfg.population} · {COUNTY_MAP[cityName] ?? 'California'} · {total > 0 ? `${total} local businesses listed` : 'Growing fast'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/directory?city=${encodeURIComponent(cityName)}`}
              className="inline-block bg-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-amber-50 transition"
              style={{ color: '#1e3a5f' }}
            >
              Browse All {cityName} Businesses →
            </Link>
            <Link
              href="/submit-business"
              className="inline-block bg-white/15 border border-white/30 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-white/25 transition"
            >
              + Add Your Business
            </Link>
          </div>
        </div>
      </div>

      {/* ── Category chips ── */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by Category</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ name, emoji, slug }) => {
            const count = catCounts[name] ?? 0
            return (
              <Link
                key={name}
                href={`/${citySlug}/${slug}`}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-blue-300 hover:text-blue-700 hover:shadow-sm transition"
              >
                <span>{emoji}</span>
                <span>{name}</span>
                {count > 0 && (
                  <span className="text-[11px] text-gray-400 font-normal">({count})</span>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Popular in [City] ── */}
      {popular.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Popular in {cityName}</h2>
            <Link
              href={`/directory?city=${encodeURIComponent(cityName)}`}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((biz) => (
              <BusinessCard key={biz.id} biz={biz} cfg={cfg} />
            ))}
          </div>
        </div>
      )}

      {/* ── Recently Added ── */}
      {recent.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recently Added</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recent.map((biz) => (
              <BusinessCard key={biz.id} biz={biz} cfg={cfg} />
            ))}
          </div>
        </div>
      )}

      {/* ── Nearby Cities ── */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Explore Nearby Cities</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(CITY_MAP)
            .filter(([slug]) => slug !== citySlug)
            .map(([slug, name]) => {
              const c = CITY_CFG[name]
              return (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border border-gray-200 bg-white hover:border-blue-300 hover:text-blue-700 transition"
                >
                  <span>{c.emoji}</span>
                  <span>{name}</span>
                </Link>
              )
            })}
        </div>
      </div>

      {/* ── Submit CTA ── */}
      <div
        className="rounded-2xl p-8 text-center text-white"
        style={{ background: cfg.gradient }}
      >
        <p className="font-extrabold text-xl mb-2">Own a business in {cityName}?</p>
        <p className="text-white/75 text-sm mb-5">
          Get listed on MoHoLocal for free — reach thousands of {cityName} residents.
        </p>
        <Link
          href="/submit-business"
          className="inline-block bg-white font-bold text-sm px-8 py-3 rounded-xl hover:bg-amber-50 transition"
          style={{ color: '#1e3a5f' }}
        >
          + Add Your Business — It&apos;s Free
        </Link>
      </div>

    </div>
  )
}
