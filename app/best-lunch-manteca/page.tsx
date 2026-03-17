export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Best Lunch in Manteca CA — Local Midday Eats | MoHo Local',
  description:
    "Where to eat lunch in Manteca, CA? Browse verified local restaurants and lunch spots in Manteca, San Joaquin County.",
  openGraph: {
    title: 'Best Lunch in Manteca CA',
    description: 'Top lunch spots in Manteca, CA — verified picks from your neighbors in the 209.',
    url: 'https://www.moholocal.com/best-lunch-manteca',
  },
}

const CITY = 'Manteca'
const CITY_GRADIENT = 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)'

const LUNCH_KEYWORDS = [
  'lunch', 'sandwich', 'deli', 'wrap', 'sub', 'burrito', 'taco',
  'bowl', 'salad', 'soup', 'ramen', 'pho', 'noodle', 'sushi',
  'thai', 'chinese', 'teriyaki', 'grill',
]

function isLunchSpot(biz: Business): boolean {
  const text = `${biz.name} ${biz.description ?? ''}`.toLowerCase()
  return LUNCH_KEYWORDS.some((kw) => text.includes(kw))
}

async function getListings(): Promise<{ featured: Business[]; all: Business[] }> {
  const supabase = getSupabaseClient()
  const { data } = await supabase
    .from('businesses')
    .select('id,name,description,category,city,address,phone,website,rating,review_count')
    .eq('city', CITY)
    .eq('category', 'Restaurants')
    .eq('status', 'approved')
    .eq('verified', true)
    .order('review_count', { ascending: false })
    .limit(60)
  const all = (data as Business[]) ?? []
  const featured = all.filter(isLunchSpot)
  return { featured, all }
}

function buildSchema(businesses: Business[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Best Lunch in Manteca CA',
      description: 'Top lunch spots in Manteca, CA verified by the MoHo Local community.',
      url: 'https://www.moholocal.com/best-lunch-manteca',
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
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.moholocal.com' },
        { '@type': 'ListItem', position: 2, name: 'Manteca', item: 'https://www.moholocal.com/manteca' },
        { '@type': 'ListItem', position: 3, name: 'Best Lunch in Manteca' },
      ],
    },
  ]
}

function BizCard({ biz }: { biz: Business }) {
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
          {biz.website && (
            <a href={biz.website} target="_blank" rel="noopener noreferrer"
              className="text-[10px] font-semibold text-blue-600 hover:underline">
              Website ↗
            </a>
          )}
          {(biz.rating ?? 0) > 0 && (
            <span className="text-xs text-amber-600 font-semibold">★ {biz.rating!.toFixed(1)}</span>
          )}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
        <Link href={`/business/${biz.id}`}
          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-400 text-[#1e3a5f] hover:bg-amber-300 transition">
          View Details →
        </Link>
      </div>
    </div>
  )
}

export default async function BestLunchMantecaPage() {
  const { featured, all } = await getListings()
  const listings = featured.length >= 3 ? featured : all
  const isFallback = featured.length < 3

  if (listings.length < 3) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">
        <p>Listings loading — check back soon.</p>
        <Link href="/manteca/restaurants" className="text-blue-600 hover:underline mt-4 inline-block">Browse Manteca Restaurants →</Link>
      </div>
    )
  }

  const schemas = buildSchema(listings)

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>›</span>
          <Link href="/manteca" className="hover:text-blue-600 transition">Manteca</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">Best Lunch</span>
        </nav>

        <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: CITY_GRADIENT }}>
          <div className="flex items-start gap-4">
            <div className="text-5xl">🥗</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
                Manteca, CA · San Joaquin County
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
                Best Lunch in Manteca, CA
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                {listings.length} verified local restaurants open for lunch.
              </p>
            </div>
          </div>
        </div>

        {isFallback && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 text-sm text-amber-800">
            🥗 Showing top Manteca restaurants while we grow dedicated lunch listings.
          </div>
        )}

        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          Manteca has a well-rounded lunch scene — you can find everything from quick tacos to sit-down Chinese food to a good sandwich. The city has a strong local dining culture, and midday options have grown alongside the population. All listings here are verified by the MoHo Local community.
        </p>

        <div className="space-y-4 mb-10">
          {listings.map((biz) => <BizCard key={biz.id} biz={biz} />)}
        </div>

        {/* Related Local Guides */}
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Related Local Guides</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/manteca/restaurants"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-orange-300 hover:text-orange-800 transition">
              🍊 All Manteca Restaurants
            </Link>
            <Link href="/manteca"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-orange-300 hover:text-orange-800 transition">
              🍊 Manteca City Guide
            </Link>
            <Link href="/best-brunch-manteca"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-orange-300 hover:text-orange-800 transition">
              🥞 Best Brunch in Manteca
            </Link>
            <Link href="/best-dinner-manteca"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-orange-300 hover:text-orange-800 transition">
              🌙 Best Dinner in Manteca
            </Link>
          </div>
        </div>

        <div className="rounded-2xl p-6 text-center text-white" style={{ background: CITY_GRADIENT }}>
          <p className="font-bold text-lg mb-1">Own a restaurant in Manteca?</p>
          <p className="text-white/80 text-sm mb-4">Reach the lunch crowd — free listing on MoHoLocal.</p>
          <Link href="/submit-business"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-orange-50 transition"
            style={{ color: '#7c2d12' }}>
            + Add Your Restaurant
          </Link>
        </div>

      </div>
    </>
  )
}
