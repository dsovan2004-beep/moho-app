export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Restaurants Near Levi's Stadium — 209 Corridor Guide | MoHo Local",
  description:
    "Hungry before or after the World Cup? Find the best restaurants near Levi's Stadium in Tracy, Mountain House, and the 209 corridor — just 45–55 minutes away.",
  openGraph: {
    title: "Restaurants Near Levi's Stadium — 209 Corridor Guide",
    description:
      "Best restaurants near Levi's Stadium for FIFA World Cup 2026. Tracy and Mountain House are 45–55 min away with hundreds of local spots.",
    url: 'https://www.moholocal.com/restaurants-near-levis-stadium',
  },
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURED_CITIES = ['Tracy', 'Mountain House']

const CITY_CFG: Record<string, { gradient: string; emoji: string; slug: string; miles: string; drive: string }> = {
  Tracy: {
    gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)',
    emoji: '🌿',
    slug: 'tracy',
    miles: '~42 miles',
    drive: '~45 min',
  },
  'Mountain House': {
    gradient: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)',
    emoji: '🏘️',
    slug: 'mountain-house',
    miles: '~47 miles',
    drive: '~50 min',
  },
}

async function getRestaurants(): Promise<Business[]> {
  const supabase = getSupabaseClient()
  const { data } = await supabase
    .from('businesses')
    .select('id,name,description,category,city,address,phone,website,rating,review_count')
    .in('city', FEATURED_CITIES)
    .eq('category', 'Restaurants')
    .eq('status', 'approved')
    .eq('verified', true)
    .order('review_count', { ascending: false })
    .limit(60)
  return (data as Business[]) ?? []
}

// ── Schema ────────────────────────────────────────────────────────────────────

function buildSchema(businesses: Business[]) {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "Restaurants Near Levi's Stadium — 209 Corridor",
    description:
      "Best restaurants in Tracy, Mountain House and the 209 corridor — 45–55 minutes from Levi's Stadium in Santa Clara, CA.",
    url: 'https://www.moholocal.com/restaurants-near-levis-stadium',
    numberOfItems: businesses.length,
    itemListElement: businesses.slice(0, 20).map((biz, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Restaurant',
        name: biz.name,
        address: biz.address,
        telephone: biz.phone,
        url: `https://www.moholocal.com/business/${biz.id}`,
      },
    })),
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.moholocal.com' },
      { '@type': 'ListItem', position: 2, name: "Restaurants Near Levi's Stadium" },
    ],
  }

  return [itemList, breadcrumb]
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BizCard({ biz }: { biz: Business }) {
  const cfg = CITY_CFG[biz.city]
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link href={`/business/${biz.id}`} className="font-bold text-gray-900 hover:text-blue-700 transition text-base leading-snug break-words">
            {biz.name}
          </Link>
          {biz.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{biz.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {biz.address && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span>📍</span>
                <span className="line-clamp-1">{biz.address.replace(/, CA.*$/, '')}</span>
              </span>
            )}
            {biz.phone && (
              <a href={`tel:${biz.phone}`} className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1">
                <span>📞</span><span>{biz.phone}</span>
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: cfg?.gradient }}>
            {cfg?.emoji} {biz.city}
          </span>
          {(biz.rating ?? 0) > 0 && (
            <span className="text-xs text-amber-600 font-semibold">★ {biz.rating!.toFixed(1)}</span>
          )}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">{cfg?.drive} from Levi&apos;s Stadium</span>
        <Link href={`/business/${biz.id}`}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-400 text-[#1e3a5f] hover:bg-amber-300 transition">
          View Details →
        </Link>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function RestaurantsNearLevisPage() {
  const businesses = await getRestaurants()

  const byCity: Record<string, Business[]> = {}
  for (const biz of businesses) {
    if (!byCity[biz.city]) byCity[biz.city] = []
    byCity[biz.city].push(biz)
  }

  const schemas = buildSchema(businesses)

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">Restaurants Near Levi&apos;s Stadium</span>
        </nav>

        {/* Hero */}
        <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: 'linear-gradient(135deg,#7c2d12 0%,#b45309 50%,#15803d 100%)' }}>
          <div className="flex items-start gap-4">
            <div className="text-5xl">⚽</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
                FIFA World Cup 2026 · San Joaquin Valley
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
                Restaurants Near Levi&apos;s Stadium
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                {businesses.length}+ local restaurants in Tracy and Mountain House — 45–55 minutes from Levi&apos;s Stadium in Santa Clara. Skip the stadium prices and eat like a local.
              </p>
            </div>
          </div>
        </div>

        {/* Distance callout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {FEATURED_CITIES.map((city) => {
            const cfg = CITY_CFG[city]
            const count = byCity[city]?.length ?? 0
            return (
              <div key={city} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ background: cfg.gradient }}>
                  {cfg.emoji}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{city}, CA</p>
                  <p className="text-xs text-gray-500">{cfg.miles} · {cfg.drive} to Levi&apos;s Stadium</p>
                  <p className="text-xs text-green-700 font-semibold mt-0.5">{count} restaurants listed</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* SEO intro */}
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          Levi&apos;s Stadium in Santa Clara hosts FIFA World Cup 2026 matches starting June 2026. If you&apos;re driving in from the East Bay or Central Valley, the 209 corridor — Tracy, Mountain House, Manteca, and Lathrop — puts you 45–55 minutes away with a massive selection of local restaurants, zero stadium markup, and easy parking. Whether you&apos;re looking for a pre-game meal, a post-match bite, or somewhere to catch extra time, your neighbors in the 209 have you covered.
        </p>

        {/* Tracy section */}
        {byCity['Tracy'] && byCity['Tracy'].length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                🌿 Tracy Restaurants
                <span className="text-sm font-normal text-gray-400">— ~45 min from Levi&apos;s</span>
              </h2>
              <Link href="/tracy/restaurants"
                className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap shrink-0">
                All Tracy →
              </Link>
            </div>
            <div className="space-y-4">
              {byCity['Tracy'].map((biz) => <BizCard key={biz.id} biz={biz} />)}
            </div>
          </section>
        )}

        {/* Mountain House section */}
        {byCity['Mountain House'] && byCity['Mountain House'].length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                🏘️ Mountain House Restaurants
                <span className="text-sm font-normal text-gray-400">— ~50 min from Levi&apos;s</span>
              </h2>
              <Link href="/mountain-house/restaurants"
                className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap shrink-0">
                All MH →
              </Link>
            </div>
            <div className="space-y-4">
              {byCity['Mountain House'].map((biz) => <BizCard key={biz.id} biz={biz} />)}
            </div>
          </section>
        )}

        {/* Related pages */}
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">More FIFA World Cup 2026 Guides</p>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <Link href="/coffee-near-levis-stadium"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition">
              ☕ Coffee Near Levi&apos;s Stadium
            </Link>
            <Link href="/best-bars-watch-world-cup-san-jose"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition">
              🍺 Best Bars to Watch the World Cup
            </Link>
            <Link href="/best-places-watch-world-cup-san-jose"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition">
              ⚽ Watch Party Spots Near San Jose
            </Link>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Local Guides</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/best-restaurants-tracy"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-300 hover:text-green-800 transition">
              🍽️ Best Restaurants in Tracy
            </Link>
            <Link href="/best-family-restaurants-tracy"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-300 hover:text-green-800 transition">
              👨‍👩‍👧 Family Restaurants in Tracy
            </Link>
            <Link href="/best-coffee-tracy"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-300 hover:text-green-800 transition">
              ☕ Best Coffee in Tracy
            </Link>
          </div>
        </div>

        {/* Submit CTA */}
        <div className="rounded-2xl p-6 text-center text-white" style={{ background: 'linear-gradient(135deg,#7c2d12 0%,#b45309 100%)' }}>
          <p className="font-bold text-lg mb-1">Own a restaurant in Tracy or Mountain House?</p>
          <p className="text-white/80 text-sm mb-4">Get in front of 209 locals and World Cup visitors — free listing on MoHoLocal</p>
          <Link href="/submit-business"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-amber-50 transition"
            style={{ color: '#7c2d12' }}>
            + Add Your Restaurant
          </Link>
        </div>

      </div>
    </>
  )
}
