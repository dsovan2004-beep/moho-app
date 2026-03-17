export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

export const metadata = {
  title: 'Best Hair Salons in Mountain House CA — Local Stylists | MoHo Local',
  description:
    "Find the best hair salons and barbershops in Mountain House, CA. Verified local stylists and barbers serving the Mountain House community.",
  openGraph: {
    title: 'Best Hair Salons in Mountain House CA',
    description: 'Top-rated hair salons in Mountain House, CA — verified picks from your neighbors in the 209.',
    url: 'https://www.moholocal.com/best-hair-salon-mountain-house',
  },
}

const CITY = 'Mountain House'
const CITY_GRADIENT = 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)'

const HAIR_KEYWORDS = [
  'hair', 'salon', 'barber', 'barbershop', 'stylist', 'cut', 'color',
  'highlights', 'blowout', 'keratin', 'extensions', 'locs', 'braids',
  'shear', 'studio',
]

function isHairSpot(biz: Business): boolean {
  const text = `${biz.name} ${biz.description ?? ''}`.toLowerCase()
  return HAIR_KEYWORDS.some((kw) => text.includes(kw))
}

async function getListings(): Promise<{ featured: Business[]; all: Business[] }> {
  const supabase = getSupabaseClient()
  const { data } = await supabase
    .from('businesses')
    .select('id,name,description,category,city,address,phone,website,rating,review_count')
    .eq('city', CITY)
    .eq('category', 'Beauty & Spa')
    .eq('status', 'approved')
    .eq('verified', true)
    .order('review_count', { ascending: false })
    .limit(40)
  const all = (data as Business[]) ?? []
  const featured = all.filter(isHairSpot)
  return { featured, all }
}

function buildSchema(businesses: Business[]) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Best Hair Salons in Mountain House CA',
      description: 'Top-rated hair salons in Mountain House, CA verified by the MoHo Local community.',
      url: 'https://www.moholocal.com/best-hair-salon-mountain-house',
      numberOfItems: businesses.length,
      itemListElement: businesses.slice(0, 20).map((biz, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'HairSalon',
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
        { '@type': 'ListItem', position: 2, name: 'Mountain House', item: 'https://www.moholocal.com/mountain-house' },
        { '@type': 'ListItem', position: 3, name: 'Best Hair Salons in Mountain House' },
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

export default async function BestHairSalonMountainHousePage() {
  const { featured, all } = await getListings()
  const listings = featured.length >= 3 ? featured : all
  const isFallback = featured.length < 3

  if (listings.length < 3) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">
        <p>Listings loading — check back soon.</p>
        <Link href="/mountain-house/beauty-spa" className="text-blue-600 hover:underline mt-4 inline-block">Browse Mountain House Beauty & Spa →</Link>
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
          <Link href="/mountain-house" className="hover:text-blue-600 transition">Mountain House</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">Best Hair Salons</span>
        </nav>

        <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: CITY_GRADIENT }}>
          <div className="flex items-start gap-4">
            <div className="text-5xl">💇</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
                Mountain House, CA · San Joaquin County
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
                Best Hair Salons in Mountain House, CA
              </h1>
              <p className="text-white/80 text-sm leading-relaxed">
                {listings.length} verified local hair salons and beauty spots.
              </p>
            </div>
          </div>
        </div>

        {isFallback && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 mb-6 text-sm text-blue-800">
            💇 Showing all Mountain House beauty & spa listings while we grow dedicated salon listings.
          </div>
        )}

        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          Mountain House residents have built a tight-knit community — and word of mouth travels fast here. The local hair salon scene has grown with the population, offering everything from quick cuts to full color services. These are all verified local businesses, not chain imports. Find your next stylist right here in Mountain House.
        </p>

        <div className="space-y-4 mb-10">
          {listings.map((biz) => <BizCard key={biz.id} biz={biz} />)}
        </div>

        {/* Related Local Guides */}
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Related Local Guides</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/mountain-house/beauty-spa"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-blue-300 hover:text-blue-800 transition">
              💇 All Beauty & Spa in Mountain House
            </Link>
            <Link href="/mountain-house"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-blue-300 hover:text-blue-800 transition">
              🏘️ Mountain House City Guide
            </Link>
            <Link href="/best-nail-salon-mountain-house"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-blue-300 hover:text-blue-800 transition">
              💅 Best Nail Salons in Mountain House
            </Link>
            <Link href="/best-hair-salon-tracy"
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 hover:border-blue-300 hover:text-blue-800 transition">
              💇 Best Hair Salons in Tracy
            </Link>
          </div>
        </div>

        <div className="rounded-2xl p-6 text-center text-white" style={{ background: CITY_GRADIENT }}>
          <p className="font-bold text-lg mb-1">Own a salon in Mountain House?</p>
          <p className="text-white/80 text-sm mb-4">Get discovered by Mountain House residents looking for a local stylist — free listing on MoHoLocal.</p>
          <Link href="/submit-business"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-blue-50 transition"
            style={{ color: '#1e3a5f' }}>
            + Add Your Salon
          </Link>
        </div>

      </div>
    </>
  )
}
