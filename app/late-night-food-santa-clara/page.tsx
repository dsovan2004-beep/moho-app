export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Late Night Food Near Santa Clara — Eat After the Game | MoHo Local',
  description:
    "Game over and still hungry? Find late night food near Santa Clara and Levi's Stadium in the 209 corridor — Tracy, Manteca, Lathrop, and Mountain House are all 45–60 min away.",
  openGraph: {
    title: 'Late Night Food Near Santa Clara — After the Game Guide',
    description:
      'Best late night food near Santa Clara and Levi\'s Stadium. The 209 corridor — Tracy, Manteca, Lathrop, Mountain House — 45–60 min from Santa Clara.',
    url: 'https://www.moholocal.com/late-night-food-santa-clara',
  },
}

const ALL_CITIES = ['Tracy', 'Manteca', 'Lathrop', 'Mountain House', 'Brentwood']

const CITY_CFG: Record<string, { gradient: string; emoji: string; slug: string; drive: string }> = {
  Tracy: {
    gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)',
    emoji: '🌿',
    slug: 'tracy',
    drive: '~45 min',
  },
  'Mountain House': {
    gradient: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)',
    emoji: '🏘️',
    slug: 'mountain-house',
    drive: '~50 min',
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
    drive: '~55 min',
  },
  Brentwood: {
    gradient: 'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)',
    emoji: '🌾',
    slug: 'brentwood',
    drive: '~55 min',
  },
}

// Late-night indicators: fast food, diners, 24hr spots, delivery-friendly names
const LATE_NIGHT_KEYWORDS = [
  'diner', '24', 'night', 'late', 'ihop', 'denny', 'jack', 'in-n-out', 'in n out',
  'taco', 'pizza', 'burger', 'wings', 'kebab', 'shawarma', 'pho',
  'ramen', 'noodle', 'fast', 'drive', 'express', 'quick',
]

function isLikelyLateNight(biz: Business): boolean {
  const text = `${biz.name} ${biz.description ?? ''}`.toLowerCase()
  return LATE_NIGHT_KEYWORDS.some((kw) => text.includes(kw))
}

async function getRestaurants(): Promise<Business[]> {
  const supabase = getSupabaseClient()
  const { data } = await supabase
    .from('businesses')
    .select('id,name,description,category,city,address,phone,website,rating,review_count')
    .in('city', ALL_CITIES)
    .eq('category', 'Restaurants')
    .eq('status', 'approved')
    .eq('verified', true)
    .order('review_count', { ascending: false })
    .limit(300)
  return (data as Business[]) ?? []
}

function buildSchema(businesses: Business[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Late Night Food Near Santa Clara — 209 Corridor',
      description:
        'Best late night restaurants near Santa Clara and Levi\'s Stadium. The 209 corridor is 45–60 minutes east.',
      url: 'https://www.moholocal.com/late-night-food-santa-clara',
      numberOfItems: businesses.length,
      itemListElement: businesses.slice(0, 20).map((biz, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Restaurant',
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
        { '@type': 'ListItem', position: 2, name: 'Late Night Food Near Santa Clara' },
      ],
    },
  ]
}

function BizCard({ biz, isHighlighted }: { biz: Business; isHighlighted: boolean }) {
  const cfg = CITY_CFG[biz.city]
  return (
    <div className={`bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow ${isHighlighted ? 'border-amber-300' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/business/${biz.id}`} className="font-bold text-gray-900 hover:text-blue-700 transition text-base break-words">
              {biz.name}
            </Link>
            {isHighlighted && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shrink-0">
                🌙 Late Night
              </span>
            )}
          </div>
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
          {biz.rating > 0 && (
            <span className="text-xs text-amber-600 font-semibold">★ {biz.rating.toFixed(1)}</span>
          )}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">{cfg?.drive} from Santa Clara</span>
        <Link href={`/business/${biz.id}`}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-400 text-[#1e3a5f] hover:bg-amber-300 transition">
          View Details →
        </Link>
      </div>
    </div>
  )
}

export default async function LateNightFoodPage() {
  const allRestaurants = await getRestaurants()

  // Sort: late-night-likely first, then by review count
  const lateNightSet = new Set(allRestaurants.filter(isLikelyLateNight).map((b) => b.id))
  const sorted = [
    ...allRestaurants.filter((b) => lateNightSet.has(b.id)),
    ...allRestaurants.filter((b) => !lateNightSet.has(b.id)),
  ]

  const byCity: Record<string, Business[]> = {}
  for (const biz of sorted) {
    if (!byCity[biz.city]) byCity[biz.city] = []
    byCity[biz.city].push(biz)
  }

  const schemas = buildSchema(sorted)

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">Late Night Food Near Santa Clara</span>
        </nav>

        <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#15803d 100%)' }}>
          <div className="flex items-start gap-4">
            <div className="text-5xl">🌙</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
                FIFA World Cup 2026 · After the Final Whistle
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
                Late Night Food Near Santa Clara
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                {sorted.length}+ restaurants across the 209 corridor — all 45–60 minutes east of Santa Clara. Game over. Now eat.
              </p>
            </div>
          </div>
        </div>

        {/* Hours disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 mb-6">
          <p className="text-xs text-gray-600">
            <span className="font-bold text-gray-800">📋 Tip:</span> Hours vary by location. Always call ahead or check Google Maps to confirm late-night availability — especially on match days when restaurants may extend hours.
          </p>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          After a FIFA World Cup match at Levi&apos;s Stadium, the last thing you want is a two-hour wait at an overpriced Santa Clara restaurant. Head east on I-580 or I-205 and you&apos;ll hit the 209 corridor — Tracy, Lathrop, Manteca, Mountain House, and Brentwood — in under an hour. Dozens of local restaurants stay open late, including taquerias, diners, and spots that know how to feed a crowd after the game.
        </p>

        {/* Highlight: late-night-likely */}
        {lateNightSet.size > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-amber-800">🌙 Late night tagged</span>
              <span className="text-xs text-gray-400">— names suggest extended hours</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Always confirm hours before you go.</p>
          </div>
        )}

        {/* Per-city sections */}
        {ALL_CITIES.filter((c) => byCity[c]?.length).map((city) => {
          const cfg = CITY_CFG[city]
          const cityBizList = byCity[city] ?? []
          return (
            <section key={city} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                  {cfg.emoji} {city}
                  <span className="text-sm font-normal text-gray-400">— {cfg.drive} from Santa Clara</span>
                </h2>
                <Link href={`/${cfg.slug}/restaurants`}
                  className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap shrink-0">
                  All {city} →
                </Link>
              </div>
              <div className="space-y-4">
                {cityBizList.map((biz) => (
                  <BizCard key={biz.id} biz={biz} isHighlighted={lateNightSet.has(biz.id)} />
                ))}
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
            <Link href="/best-bars-watch-world-cup-san-jose"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition">
              🍺 Best Bars to Watch the World Cup
            </Link>
          </div>
        </div>

        <div className="rounded-2xl p-6 text-center text-white" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)' }}>
          <p className="font-bold text-lg mb-1">Know a late-night spot in the 209?</p>
          <p className="text-white/80 text-sm mb-4">Help World Cup fans find food after the game — list it free on MoHoLocal</p>
          <Link href="/submit-business"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-blue-50 transition"
            style={{ color: '#0f172a' }}>
            + Add Your Restaurant
          </Link>
        </div>

      </div>
    </>
  )
}
