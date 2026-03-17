export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: "Coffee Near Levi's Stadium — Best Cafés in Tracy & the 209 | MoHo Local",
  description:
    "Best coffee shops and cafés near Levi's Stadium for FIFA World Cup 2026. Tracy and Mountain House are 45–55 minutes away — grab a coffee before the game.",
  openGraph: {
    title: "Coffee Near Levi's Stadium — Best Cafés in the 209 Corridor",
    description:
      "Skip the stadium lines. Best coffee near Levi's Stadium in Tracy, Mountain House, and the 209 corridor for FIFA World Cup 2026.",
    url: 'https://www.moholocal.com/coffee-near-levis-stadium',
  },
}

const COFFEE_KEYWORDS = [
  'coffee', 'café', 'cafe', 'brew', 'espresso', 'roast', 'boba',
  'tea', 'latte', 'cappuccino', 'barista', 'press', 'grind', 'bean',
]

const FEATURED_CITIES = ['Tracy', 'Mountain House']

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
}

function isCoffeeShop(biz: Business): boolean {
  const text = `${biz.name} ${biz.description ?? ''}`.toLowerCase()
  return COFFEE_KEYWORDS.some((kw) => text.includes(kw))
}

async function getCoffeeShops(): Promise<{ featured: Business[]; allRestaurants: Business[] }> {
  const supabase = getSupabaseClient()
  const { data } = await supabase
    .from('businesses')
    .select('id,name,description,category,city,address,phone,website,rating,review_count')
    .in('city', FEATURED_CITIES)
    .eq('category', 'Restaurants')
    .eq('status', 'approved')
    .eq('verified', true)
    .order('name')
    .limit(200)

  const all = (data as Business[]) ?? []
  const featured = all.filter(isCoffeeShop)
  return { featured, allRestaurants: all }
}

function buildSchema(businesses: Business[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: "Coffee Near Levi's Stadium — 209 Corridor",
      description: 'Best coffee shops and cafés near Levi\'s Stadium in Santa Clara. Tracy and Mountain House are 45–55 minutes away.',
      url: 'https://www.moholocal.com/coffee-near-levis-stadium',
      numberOfItems: businesses.length,
      itemListElement: businesses.slice(0, 15).map((biz, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'CafeOrCoffeeShop',
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
        { '@type': 'ListItem', position: 2, name: "Coffee Near Levi's Stadium" },
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
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shrink-0" style={{ background: cfg?.gradient }}>
          {cfg?.emoji} {biz.city}
        </span>
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

export default async function CoffeeNearLevisPage() {
  const { featured, allRestaurants } = await getCoffeeShops()
  const showList = featured.length >= 3 ? featured : allRestaurants
  const isFallback = featured.length < 3

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
          <span className="text-gray-700 font-medium">Coffee Near Levi&apos;s Stadium</span>
        </nav>

        <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: 'linear-gradient(135deg,#78350f 0%,#92400e 50%,#1e3a5f 100%)' }}>
          <div className="flex items-start gap-4">
            <div className="text-5xl">☕</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
                FIFA World Cup 2026 · 209 Corridor
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
                Coffee Near Levi&apos;s Stadium
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                {showList.length} cafés and coffee spots in Tracy and Mountain House — 45–55 minutes from Levi&apos;s Stadium. Fuel up before kickoff.
              </p>
            </div>
          </div>
        </div>

        {isFallback && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 text-sm text-amber-800">
            ☕ Showing all restaurants in Tracy & Mountain House — dedicated coffee shops added as they&apos;re listed.
          </div>
        )}

        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          Heading to Levi&apos;s Stadium in Santa Clara for FIFA World Cup 2026? The 209 corridor — Tracy and Mountain House — puts you less than an hour out with plenty of coffee shops, cafés, and breakfast spots to fuel up before the match. Whether you&apos;re an early arrival looking for an espresso or a fan stopping for boba before the drive, the local spots here are a world apart from stadium concessions.
        </p>

        <div className="space-y-4 mb-10">
          {showList.map((biz) => <BizCard key={biz.id} biz={biz} />)}
        </div>

        {/* Related */}
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">More FIFA World Cup 2026 Guides</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/directory"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition">
              🗂️ Full Business Directory
            </Link>
            <Link href="/restaurants-near-levis-stadium"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition">
              🍽️ Restaurants Near Levi&apos;s Stadium
            </Link>
            <Link href="/best-bars-watch-world-cup-san-jose"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-amber-300 hover:text-amber-800 transition">
              🍺 Best Bars to Watch the World Cup
            </Link>
            <Link href="/best-coffee-tracy"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-300 hover:text-green-800 transition">
              ☕ Best Coffee in Tracy
            </Link>
            <Link href="/best-breakfast-tracy"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-300 hover:text-green-800 transition">
              🍳 Best Breakfast in Tracy
            </Link>
          </div>
        </div>

        <div className="rounded-2xl p-6 text-center text-white" style={{ background: 'linear-gradient(135deg,#78350f 0%,#92400e 100%)' }}>
          <p className="font-bold text-lg mb-1">Own a café or coffee shop in the 209?</p>
          <p className="text-white/80 text-sm mb-4">Get listed on MoHoLocal — free for local businesses</p>
          <Link href="/submit-business"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-amber-50 transition"
            style={{ color: '#78350f' }}>
            + Add Your Café
          </Link>
        </div>

      </div>
    </>
  )
}
