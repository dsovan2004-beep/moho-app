export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Best Places to Watch the World Cup Near San Jose — 209 Corridor | MoHo Local',
  description:
    'Hosting a World Cup watch party or just looking for a great spot to watch FIFA 2026 near San Jose? Tracy, Manteca, and Lathrop are 40–55 minutes away with local restaurants and bars showing every match.',
  openGraph: {
    title: 'Best Places to Watch the World Cup Near San Jose',
    description:
      'Best watch party spots and restaurants to catch FIFA World Cup 2026 near San Jose. Tracy, Manteca, and Lathrop in the 209 corridor — 40–55 minutes from the stadium.',
    url: 'https://www.moholocal.com/best-places-watch-world-cup-san-jose',
  },
}

const WATCH_PARTY_KEYWORDS = [
  'bar', 'pub', 'brewery', 'brew', 'lounge', 'tavern', 'sports', 'grill',
  'cantina', 'taproom', 'ale', 'beer', 'billiard', 'pool', 'saloon',
  'restaurant', 'pizza', 'burger', 'cantina', 'taqueria', 'kabob', 'kebab',
]

const FEATURED_CITIES = ['Tracy', 'Manteca', 'Lathrop']

const CITY_CFG: Record<string, { gradient: string; emoji: string; slug: string; drive: string; vibe: string }> = {
  Tracy: {
    gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)',
    emoji: '🌿',
    slug: 'tracy',
    drive: '~42 min',
    vibe: 'Biggest selection — 30+ restaurants and bars',
  },
  Lathrop: {
    gradient: 'linear-gradient(135deg,#581c87 0%,#7e22ce 100%)',
    emoji: '🔮',
    slug: 'lathrop',
    drive: '~48 min',
    vibe: 'Cozy neighborhood spots perfect for groups',
  },
  Manteca: {
    gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)',
    emoji: '🍊',
    slug: 'manteca',
    drive: '~52 min',
    vibe: 'Local favorites with a strong community feel',
  },
}

function isWatchPartySpot(biz: Business): boolean {
  const text = `${biz.name} ${biz.description ?? ''}`.toLowerCase()
  return WATCH_PARTY_KEYWORDS.some((kw) => text.includes(kw))
}

async function getWatchPartySpots(): Promise<{ featured: Business[]; allRestaurants: Business[] }> {
  const supabase = getSupabaseClient()
  const { data } = await supabase
    .from('businesses')
    .select('id,name,description,category,city,address,phone,website,rating,review_count')
    .in('city', FEATURED_CITIES)
    .eq('category', 'Restaurants')
    .eq('status', 'approved')
    .eq('verified', true)
    .order('review_count', { ascending: false })
    .limit(200)

  const all = (data as Business[]) ?? []
  const featured = all.filter(isWatchPartySpot)
  return { featured, allRestaurants: all }
}

function buildSchema(businesses: Business[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Best Places to Watch the World Cup Near San Jose — 209 Corridor',
      description:
        'Best watch party spots, bars, and restaurants to catch FIFA World Cup 2026 near San Jose in the 209 corridor.',
      url: 'https://www.moholocal.com/best-places-watch-world-cup-san-jose',
      numberOfItems: businesses.length,
      itemListElement: businesses.slice(0, 20).map((biz, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'FoodEstablishment',
          name: biz.name,
          address: biz.address,
          url: `https://www.moholocal.com/business/${biz.id}`,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.moholocal.com' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Best Places to Watch the World Cup Near San Jose',
        },
      ],
    },
  ]
}

function BizCard({ biz }: { biz: Business }) {
  const cfg = CITY_CFG[biz.city]
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/business/${biz.id}`}
            className="font-bold text-gray-900 hover:text-blue-700 transition text-base break-words"
          >
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
              <a
                href={`tel:${biz.phone}`}
                className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
              >
                <span>📞</span>
                <span>{biz.phone}</span>
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white"
            style={{ background: cfg?.gradient }}
          >
            {cfg?.emoji} {biz.city}
          </span>
          {(biz.rating ?? 0) > 0 && (
            <span className="text-xs text-amber-600 font-semibold">★ {biz.rating!.toFixed(1)}</span>
          )}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">{cfg?.drive} from San Jose</span>
        <Link
          href={`/business/${biz.id}`}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-400 text-[#1e3a5f] hover:bg-amber-300 transition"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}

export default async function WatchPartyPage() {
  const { featured, allRestaurants } = await getWatchPartySpots()
  const showList = featured.length >= 3 ? featured : allRestaurants
  const isFallback = featured.length < 3

  const byCity: Record<string, Business[]> = {}
  for (const biz of showList) {
    if (!byCity[biz.city]) byCity[biz.city] = []
    byCity[biz.city].push(biz)
  }

  const schemas = buildSchema(showList)

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">Best Places to Watch the World Cup Near San Jose</span>
        </nav>

        {/* Hero */}
        <div
          className="rounded-2xl p-8 mb-6 text-white"
          style={{ background: 'linear-gradient(135deg,#14532d 0%,#15803d 50%,#1e3a5f 100%)' }}
        >
          <div className="flex items-start gap-4">
            <div className="text-5xl">⚽</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
                FIFA World Cup 2026 · 209 Corridor
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
                Best Places to Watch the World Cup Near San Jose
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                {showList.length}+ restaurants and bars in Tracy, Manteca, and Lathrop — 40–55 minutes from
                Levi&apos;s Stadium. Skip the crowds. Watch with your community.
              </p>
            </div>
          </div>
        </div>

        {/* FIFA context */}
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6">
          <p className="text-sm font-bold text-green-800 mb-1">⚽ FIFA World Cup 2026 at Levi&apos;s Stadium — June &amp; July 2026</p>
          <p className="text-xs text-green-700 leading-relaxed">
            Levi&apos;s Stadium in Santa Clara is hosting group stage and knockout matches all summer. If you&apos;re watching from home, the 209 corridor is the next best thing — local atmosphere, real fans, and none of the Santa Clara parking situation. Tracy is under 45 minutes from the stadium. Manteca and Lathrop aren&apos;t far behind.
          </p>
        </div>

        {isFallback && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 text-sm text-amber-800">
            ⚽ Showing all verified restaurants in Tracy, Manteca &amp; Lathrop — great for watch parties and group dinners.
          </div>
        )}

        {/* Intro */}
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          The 209 corridor runs along I-580 and I-205 east of the Bay — 40 to 55 minutes from Levi&apos;s Stadium depending on traffic. Tracy, Lathrop, and Manteca are tight-knit communities with serious food scenes: taqueriAs, kabob houses, pizza spots, and neighborhood bars that actually know their regulars. These aren&apos;t chain-filled strip malls. They&apos;re real local spots where the World Cup watch party actually feels like a party.
        </p>

        {/* City sections */}
        {FEATURED_CITIES.filter((c) => byCity[c]?.length).map((city) => {
          const cfg = CITY_CFG[city]
          return (
            <section key={city} className="mb-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  {cfg.emoji} {city}
                  <span className="text-sm font-normal text-gray-400">— {cfg.drive} from San Jose</span>
                </h2>
                <Link
                  href={`/${cfg.slug}/restaurants`}
                  className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap shrink-0"
                >
                  All {city} →
                </Link>
              </div>
              <p className="text-xs text-gray-400 mb-4">{cfg.vibe}</p>
              <div className="space-y-4">
                {byCity[city].map((biz) => (
                  <BizCard key={biz.id} biz={biz} />
                ))}
              </div>
            </section>
          )
        })}

        {/* Related pages */}
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            More FIFA World Cup 2026 Guides
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/restaurants-near-levis-stadium"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition"
            >
              🍽️ Restaurants Near Levi&apos;s Stadium
            </Link>
            <Link
              href="/best-bars-watch-world-cup-san-jose"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition"
            >
              🍺 Best Bars for the World Cup
            </Link>
            <Link
              href="/coffee-near-levis-stadium"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition"
            >
              ☕ Coffee Near Levi&apos;s Stadium
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-6 text-center text-white"
          style={{ background: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)' }}
        >
          <p className="font-bold text-lg mb-1">Hosting a watch party in the 209?</p>
          <p className="text-white/80 text-sm mb-4">
            Get your restaurant or bar in front of World Cup fans — free listing on MoHoLocal
          </p>
          <Link
            href="/submit-business"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-green-50 transition"
            style={{ color: '#14532d' }}
          >
            + Add Your Spot
          </Link>
        </div>

      </div>
    </>
  )
}
