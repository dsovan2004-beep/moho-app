export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Best Bars to Watch the World Cup Near San Jose — 209 Corridor | MoHo Local',
  description:
    'Looking for a bar to watch FIFA World Cup 2026 near San Jose? Tracy, Manteca, and Lathrop are 40–55 minutes away with local sports bars and restaurants showing the games.',
  openGraph: {
    title: 'Best Bars to Watch the World Cup Near San Jose',
    description:
      'Best sports bars and restaurants to watch FIFA World Cup 2026 near San Jose. Tracy, Manteca, and Lathrop in the 209 corridor are 40–55 minutes away.',
    url: 'https://www.moholocal.com/best-bars-watch-world-cup-san-jose',
  },
}

const BAR_KEYWORDS = [
  'bar', 'pub', 'brewery', 'brew', 'lounge', 'tavern', 'sports', 'grill',
  'cantina', 'taproom', 'ale', 'beer', 'billiard', 'pool', 'saloon',
]

const FEATURED_CITIES = ['Tracy', 'Manteca', 'Lathrop']

const CITY_CFG: Record<string, { gradient: string; emoji: string; slug: string; drive: string }> = {
  Tracy: {
    gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)',
    emoji: '🌿',
    slug: 'tracy',
    drive: '~42 min',
  },
  Lathrop: {
    gradient: 'linear-gradient(135deg,#581c87 0%,#7e22ce 100%)',
    emoji: '🔮',
    slug: 'lathrop',
    drive: '~48 min',
  },
  Manteca: {
    gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)',
    emoji: '🍊',
    slug: 'manteca',
    drive: '~52 min',
  },
}

function isBar(biz: Business): boolean {
  const text = `${biz.name} ${biz.description ?? ''}`.toLowerCase()
  return BAR_KEYWORDS.some((kw) => text.includes(kw))
}

async function getBarsAndRestaurants(): Promise<{ featured: Business[]; allRestaurants: Business[] }> {
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
  const featured = all.filter(isBar)
  return { featured, allRestaurants: all }
}

function buildSchema(businesses: Business[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Best Bars to Watch the World Cup Near San Jose — 209 Corridor',
      description: 'Best sports bars and restaurants to watch FIFA World Cup 2026 near San Jose in the 209 corridor.',
      url: 'https://www.moholocal.com/best-bars-watch-world-cup-san-jose',
      numberOfItems: businesses.length,
      itemListElement: businesses.slice(0, 20).map((biz, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'BarOrPub',
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
        { '@type': 'ListItem', position: 2, name: 'Best Bars to Watch the World Cup Near San Jose' },
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
          <Link href={`/business/${biz.id}`} className="font-bold text-gray-900 hover:text-blue-700 transition text-base break-words">
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
        <span className="text-xs text-gray-400">{cfg?.drive} from San Jose</span>
        <Link href={`/business/${biz.id}`}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-400 text-[#1e3a5f] hover:bg-amber-300 transition">
          View Details →
        </Link>
      </div>
    </div>
  )
}

export default async function BarsWorldCupPage() {
  const { featured, allRestaurants } = await getBarsAndRestaurants()
  const showList = featured.length >= 5 ? featured : allRestaurants
  const isFallback = featured.length < 5

  const byCity: Record<string, Business[]> = {}
  for (const biz of showList) {
    if (!byCity[biz.city]) byCity[biz.city] = []
    byCity[biz.city].push(biz)
  }

  const schemas = buildSchema(showList)

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">Best Bars to Watch the World Cup Near San Jose</span>
        </nav>

        <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 50%,#15803d 100%)' }}>
          <div className="flex items-start gap-4">
            <div className="text-5xl">🍺</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
                FIFA World Cup 2026 · 209 Corridor
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
                Best Bars to Watch the World Cup Near San Jose
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                {showList.length}+ bars and restaurants in Tracy, Manteca, and Lathrop — 40–55 minutes from San Jose. Watch the game with locals, not tourists.
              </p>
            </div>
          </div>
        </div>

        {/* FIFA match context banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6">
          <p className="text-sm font-bold text-blue-800 mb-1">⚽ FIFA World Cup 2026 at Levi&apos;s Stadium</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            Group stage and knockout matches are scheduled for June–July 2026. If you can&apos;t get tickets — or don&apos;t want to deal with stadium crowds — the 209 corridor has the best atmosphere in the Bay Area. Local sports bars, big screens, and neighbors who actually care about football.
          </p>
        </div>

        {isFallback && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 text-sm text-amber-800">
            🍺 Showing all restaurants in Tracy, Manteca & Lathrop — dedicated bars and sports bars highlighted as they&apos;re listed.
          </div>
        )}

        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          The 209 corridor sits 40–55 minutes east of San Jose on I-580 and I-205 — close enough to catch a match at Levi&apos;s Stadium, far enough to skip the $15 beers. Tracy alone has over 30 approved restaurants and bars. Manteca and Lathrop add dozens more. These are local spots with big screens, cold drinks, and crowds that actually understand the game.
        </p>

        {/* Per-city sections */}
        {FEATURED_CITIES.filter((c) => byCity[c]?.length).map((city) => {
          const cfg = CITY_CFG[city]
          return (
            <section key={city} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  {cfg.emoji} {city}
                  <span className="text-sm font-normal text-gray-400">— {cfg.drive} from San Jose</span>
                </h2>
                <Link href={`/${cfg.slug}/restaurants`}
                  className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap shrink-0">
                  All {city} →
                </Link>
              </div>
              <div className="space-y-4">
                {byCity[city].map((biz) => <BizCard key={biz.id} biz={biz} />)}
              </div>
            </section>
          )
        })}

        {/* Related */}
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">More FIFA World Cup 2026 Guides</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/restaurants-near-levis-stadium"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition">
              🍽️ Restaurants Near Levi&apos;s Stadium
            </Link>
            <Link href="/coffee-near-levis-stadium"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition">
              ☕ Coffee Near Levi&apos;s Stadium
            </Link>
            <Link href="/best-places-watch-world-cup-san-jose"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition">
              ⚽ Best Watch Party Spots Near San Jose
            </Link>
          </div>
        </div>

        <div className="rounded-2xl p-6 text-center text-white" style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)' }}>
          <p className="font-bold text-lg mb-1">Own a bar or restaurant in the 209?</p>
          <p className="text-white/80 text-sm mb-4">Get in front of World Cup fans looking for a spot to watch — free listing on MoHoLocal</p>
          <Link href="/submit-business"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-blue-50 transition"
            style={{ color: '#1e3a5f' }}>
            + Add Your Bar
          </Link>
        </div>

      </div>
    </>
  )
}
