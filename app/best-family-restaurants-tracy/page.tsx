export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Best Family Restaurants in Tracy CA — Kid-Friendly Local Picks | MoHo Local',
  description:
    'Looking for family-friendly restaurants in Tracy, CA? Here are the best local spots for dining out with kids in San Joaquin County.',
  openGraph: {
    title: 'Best Family Restaurants in Tracy CA',
    description:
      'Top kid-friendly and family restaurants in Tracy, CA — verified picks from parents in the 209.',
    url: 'https://www.moholocal.com/best-family-restaurants-tracy',
  },
}

const CITY = 'Tracy'
const CITY_GRADIENT = 'linear-gradient(135deg,#14532d 0%,#15803d 100%)'

// Broader keyword list — most full-service restaurants are family-friendly
const FAMILY_KEYWORDS = [
  'family', 'kids', 'pizza', 'burger', 'burgers', 'chicken', 'sandwich',
  'grill', 'diner', 'buffet', 'pasta', 'italian', 'mexican', 'taqueria',
  'american', 'bbq', 'barbecue', 'wings', 'chinese', 'thai', 'pho',
  'sushi', 'seafood', 'steak', 'kabob', 'kebab', 'indian', 'halal',
  'mediterranean', 'breakfast', 'brunch',
]

function isFamilySpot(biz: Business): boolean {
  const text = `${biz.name} ${biz.description ?? ''}`.toLowerCase()
  return FAMILY_KEYWORDS.some((kw) => text.includes(kw))
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
  const featured = all.filter(isFamilySpot)
  return { featured, all }
}

function buildSchema(businesses: Business[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Best Family Restaurants in Tracy CA',
      description: 'Top kid-friendly and family restaurants in Tracy, CA verified by the MoHo Local community.',
      url: 'https://www.moholocal.com/best-family-restaurants-tracy',
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
        { '@type': 'ListItem', position: 2, name: 'Tracy', item: 'https://www.moholocal.com/tracy' },
        { '@type': 'ListItem', position: 3, name: 'Best Family Restaurants in Tracy' },
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
          {(biz.rating ?? 0) > 0 && (
            <span className="text-xs text-amber-600 font-semibold">★ {biz.rating!.toFixed(1)}</span>
          )}
          {(biz.review_count ?? 0) > 0 && (
            <span className="text-xs text-gray-400">{biz.review_count} reviews</span>
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

export default async function BestFamilyRestaurantsTracyPage() {
  const { featured, all } = await getListings()
  const listings = featured.length >= 3 ? featured : all
  const isFallback = featured.length < 3

  if (listings.length < 3) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">
        <p>Listings loading — check back soon.</p>
        <Link href="/tracy/restaurants" className="text-blue-600 hover:underline mt-4 inline-block">Browse Tracy Restaurants →</Link>
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
          <Link href="/tracy" className="hover:text-blue-600 transition">Tracy</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">Best Family Restaurants</span>
        </nav>

        <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: CITY_GRADIENT }}>
          <div className="flex items-start gap-4">
            <div className="text-5xl">👨‍👩‍👧</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
                Tracy, CA · San Joaquin County
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
                Best Family Restaurants in Tracy, CA
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                {listings.length} verified local restaurants great for dining out with the family.
              </p>
            </div>
          </div>
        </div>

        {isFallback && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 text-sm text-amber-800">
            👨‍👩‍👧 Showing all Tracy restaurants — these are the top community-reviewed spots for families.
          </div>
        )}

        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          Tracy is a family city through and through. With a large percentage of households with kids, the restaurant scene here reflects it: roomy spots with broad menus, places where a busy Friday night means families, not just happy hour crowds. Whether you're after pizza, a sit-down Mexican dinner, or something the whole table can agree on, these are the verified local picks that Tracy families actually visit.
        </p>

        <div className="space-y-4 mb-10">
          {listings.map((biz) => <BizCard key={biz.id} biz={biz} />)}
        </div>

        {/* Related Local Guides */}
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Related Local Guides</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/best-restaurants-tracy"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-300 hover:text-green-800 transition">
              🍽️ All Restaurants in Tracy
            </Link>
            <Link href="/best-coffee-tracy"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-300 hover:text-green-800 transition">
              ☕ Best Coffee in Tracy
            </Link>
            <Link href="/best-brunch-manteca"
              className="flex-1 bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-green-300 hover:text-green-800 transition">
              🥞 Best Brunch in Manteca
            </Link>
          </div>
        </div>

        <div className="rounded-2xl p-6 text-center text-white" style={{ background: CITY_GRADIENT }}>
          <p className="font-bold text-lg mb-1">Own a family restaurant in Tracy?</p>
          <p className="text-white/80 text-sm mb-4">Connect with local families looking for dinner — free listing on MoHoLocal.</p>
          <Link href="/submit-business"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-green-50 transition"
            style={{ color: '#14532d' }}>
            + Add Your Restaurant
          </Link>
        </div>

      </div>
    </>
  )
}
