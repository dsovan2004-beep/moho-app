export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// ─── Category slug → display + DB mapping ────────────────────────────────────
const CATEGORY_MAP: Record<string, {
  label: string
  dbCategory: string
  emoji: string
  desc: string
  singular: string
}> = {
  'restaurants':         { label: 'Restaurants',       dbCategory: 'Restaurants',       emoji: '🍽️', desc: 'restaurants & dining',                singular: 'restaurant'              },
  'health-and-wellness': { label: 'Health & Wellness',  dbCategory: 'Health & Wellness',  emoji: '🏥', desc: 'health & wellness providers',          singular: 'health & wellness business' },
  'beauty-and-spa':      { label: 'Beauty & Spa',       dbCategory: 'Beauty & Spa',       emoji: '💇', desc: 'beauty & spa services',                singular: 'beauty or spa business'   },
  'retail':              { label: 'Retail',             dbCategory: 'Retail',             emoji: '🛍️', desc: 'retail & shopping',                   singular: 'retail business'          },
  'education':           { label: 'Education',          dbCategory: 'Education',          emoji: '🏫', desc: 'education & childcare',                singular: 'education business'       },
  'automotive':          { label: 'Automotive',         dbCategory: 'Automotive',         emoji: '🚗', desc: 'automotive services',                  singular: 'auto service business'    },
  'real-estate':         { label: 'Real Estate',        dbCategory: 'Real Estate',        emoji: '🏠', desc: 'real estate services',                 singular: 'real estate business'     },
  'home-services':       { label: 'Home Services',      dbCategory: 'Home Services',      emoji: '🔧', desc: 'home services & repair',               singular: 'home services business'   },
  'pet-services':        { label: 'Pet Services',       dbCategory: 'Pet Services',       emoji: '🐾', desc: 'pet services',                         singular: 'pet services business'    },
  // Friendly subcategory aliases
  'dentists':            { label: 'Dentists',           dbCategory: 'Health & Wellness',  emoji: '🦷', desc: 'dental offices & orthodontists',       singular: 'dental office'            },
  'gyms':                { label: 'Gyms & Fitness',     dbCategory: 'Health & Wellness',  emoji: '🏋️', desc: 'gyms & fitness centers',              singular: 'gym or fitness center'    },
  'coffee':              { label: 'Coffee Shops',       dbCategory: 'Restaurants',        emoji: '☕', desc: 'coffee shops & cafés',                 singular: 'coffee shop'              },
  'hair-salons':         { label: 'Hair Salons',        dbCategory: 'Beauty & Spa',       emoji: '💈', desc: 'hair salons & barbers',                singular: 'hair salon'               },
  'doctors':             { label: 'Doctors',            dbCategory: 'Health & Wellness',  emoji: '👨‍⚕️', desc: 'primary care & physicians',         singular: 'medical office'           },
  'pizza':               { label: 'Pizza',              dbCategory: 'Restaurants',        emoji: '🍕', desc: 'pizza restaurants',                    singular: 'pizza place'              },
  'spas':                { label: 'Spas',               dbCategory: 'Beauty & Spa',       emoji: '💆', desc: 'spas & wellness centers',              singular: 'spa'                      },
  'plumbers':            { label: 'Plumbers',           dbCategory: 'Home Services',      emoji: '🔧', desc: 'plumbers & plumbing services',          singular: 'plumbing business'        },
  'electricians':        { label: 'Electricians',       dbCategory: 'Home Services',      emoji: '⚡', desc: 'electricians & electrical services',    singular: 'electrician business'     },
  'nail-salons':         { label: 'Nail Salons',        dbCategory: 'Beauty & Spa',       emoji: '💅', desc: 'nail salons',                          singular: 'nail salon'               },
  'chiropractors':       { label: 'Chiropractors',      dbCategory: 'Health & Wellness',  emoji: '🩺', desc: 'chiropractors & physical therapy',      singular: 'chiropractic office'      },
  'mexican-food':        { label: 'Mexican Food',       dbCategory: 'Restaurants',        emoji: '🌮', desc: 'Mexican restaurants',                  singular: 'Mexican restaurant'       },
  'tutors':              { label: 'Tutors',             dbCategory: 'Education',          emoji: '📚', desc: 'tutors & academic services',            singular: 'tutoring service'         },
  'real-estate-agents':  { label: 'Real Estate Agents', dbCategory: 'Real Estate',        emoji: '🏡', desc: 'real estate agents & brokers',          singular: 'real estate agent'        },
}

// ─── City slug → canonical name ───────────────────────────────────────────────
const CITY_SLUGS: Record<string, string> = {
  'mountain-house': 'Mountain House',
  'tracy':          'Tracy',
  'lathrop':        'Lathrop',
  'manteca':        'Manteca',
  'brentwood':      'Brentwood',
}

type CityName = 'Mountain House' | 'Tracy' | 'Lathrop' | 'Manteca' | 'Brentwood'

// ─── City themes ──────────────────────────────────────────────────────────────
const CITY_THEME: Record<string, { gradient: string; accent: string; chip: string; county: string }> = {
  'Mountain House': { gradient: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)', accent: '#1e40af', chip: 'bg-blue-50 text-blue-700',   county: 'San Joaquin County'  },
  'Tracy':          { gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)', accent: '#15803d', chip: 'bg-green-50 text-green-700',  county: 'San Joaquin County'  },
  'Lathrop':        { gradient: 'linear-gradient(135deg,#581c87 0%,#7e22ce 100%)', accent: '#7e22ce', chip: 'bg-purple-50 text-purple-700', county: 'San Joaquin County'  },
  'Manteca':        { gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)', accent: '#c2410c', chip: 'bg-orange-50 text-orange-700', county: 'San Joaquin County'  },
  'Brentwood':      { gradient: 'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)', accent: '#0d9488', chip: 'bg-teal-50 text-teal-700',    county: 'Contra Costa County' },
}

// ─── DB category → city/category page slug  (/[city]/[category]) ─────────────
// NOTE: city/category uses 'health-wellness' / 'beauty-spa' (no "and"),
//       while Best Of uses 'health-and-wellness' / 'beauty-and-spa'.
const DB_TO_CITY_CAT_SLUG: Record<string, string> = {
  'Restaurants':      'restaurants',
  'Health & Wellness':'health-wellness',
  'Beauty & Spa':     'beauty-spa',
  'Retail':           'retail',
  'Education':        'education',
  'Automotive':       'automotive',
  'Real Estate':      'real-estate',
  'Home Services':    'home-services',
  'Pet Services':     'pet-services',
}

// ─── Related category links ───────────────────────────────────────────────────
const RELATED: Record<string, string[]> = {
  'Restaurants':      ['coffee', 'pizza', 'mexican-food'],
  'Health & Wellness':['dentists', 'doctors', 'gyms', 'chiropractors'],
  'Beauty & Spa':     ['hair-salons', 'nail-salons', 'spas'],
  'Home Services':    ['plumbers', 'electricians'],
  'Education':        ['tutors'],
  'Real Estate':      ['real-estate-agents'],
}

// ─── SEO intro copy per category ──────────────────────────────────────────────
function getIntroCopy(label: string, city: string): string {
  switch (label) {
    case 'Restaurants':
      return `Hungry in ${city}? Whether you're craving tacos, pho, boba, or a classic diner breakfast, ${city} has a growing food scene worth exploring. These are the highest-rated spots as reviewed by your neighbors — real people, real recommendations.`
    case 'Health & Wellness':
      return `Finding quality healthcare close to home matters. These are the most trusted health & wellness providers in ${city} — from family doctors and urgent care to physical therapists and chiropractors — as rated by local residents.`
    case 'Beauty & Spa':
      return `Treat yourself without the commute. From nail salons to full-service spas and hair studios, ${city} has talented beauty professionals right in your backyard. Here's who your community recommends.`
    case 'Home Services':
      return `Need a plumber, electrician, roofer, or handyman in ${city}? These are the home service pros your neighbors trust most — vetted through community reviews and local word of mouth.`
    case 'Automotive':
      return `Keep your car running right with a trusted local mechanic. These are the top-rated auto service shops in ${city} — from oil changes and smog checks to major repairs — recommended by the people who live here.`
    case 'Real Estate':
      return `Buying, selling, or renting in ${city}? The local market moves fast. These are the agents, brokers, and property managers your neighbors have worked with and trust.`
    case 'Retail':
      return `Shop local in ${city}. From boutiques and gift shops to specialty stores and markets, supporting local retail keeps money in the community. Here's what neighbors say is worth checking out.`
    case 'Education':
      return `Great learning options are right here in ${city}. From tutors and learning centers to daycares and preschools, these are the top-rated education providers your community stands behind.`
    case 'Pet Services':
      return `Your pets deserve local love too. These are the most trusted vets, groomers, trainers, and pet care providers in ${city} — as recommended by fellow pet owners in the neighborhood.`
    case 'Dentists':
      return `Looking for a dentist in ${city}? These are the dental offices and orthodontists your neighbors trust most for cleanings, fillings, braces, and emergency dental care.`
    case 'Gyms & Fitness':
      return `Staying active in ${city} is easy when you find the right gym. Here are the most popular fitness centers, yoga studios, CrossFit boxes, and personal training spots locals recommend.`
    case 'Coffee Shops':
      return `Great coffee is a morning essential. These are the best coffee shops and cafés in ${city} — whether you're after a quick drip, a meticulously crafted latte, or just a cozy spot to work.`
    case 'Hair Salons':
      return `A good haircut starts with a great stylist. These are the highest-rated hair salons and barbers in ${city}, as recommended by the people who live here.`
    default:
      return `Looking for the best ${label.toLowerCase()} in ${city}? These are the top-rated local businesses recommended by your neighbors on MoHoLocal — the hyperlocal guide to the 209.`
  }
}

// ─── Business card ────────────────────────────────────────────────────────────
function BizCard({ biz, rank, accent }: { biz: Business; rank: number; accent: string }) {
  return (
    <Link
      href={`/business/${biz.id}`}
      className="group flex gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      {/* Rank badge */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-extrabold text-gray-500 self-start mt-1">
        {rank}
      </div>

      {/* Thumbnail */}
      <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
        {biz.image_url ? (
          <img src={biz.image_url} alt={biz.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl">🏢</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
          {biz.name}
        </div>
        {biz.rating != null && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-amber-400 text-sm">
              {'★'.repeat(Math.min(5, Math.floor(biz.rating)))}{'☆'.repeat(Math.max(0, 5 - Math.floor(biz.rating)))}
            </span>
            <span className="text-xs text-gray-500">{biz.rating.toFixed(1)}</span>
            {biz.review_count != null && biz.review_count > 0 && (
              <span className="text-xs text-gray-400">({biz.review_count} reviews)</span>
            )}
          </div>
        )}
        {biz.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{biz.description}</p>
        )}
        {biz.address && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 truncate">
            <span>📍</span><span className="truncate">{biz.address}</span>
          </div>
        )}
        {biz.phone && (
          <div className="text-xs text-gray-500 mt-0.5">📞 {biz.phone}</div>
        )}
        <div className="mt-2">
          <span className="text-xs font-semibold text-blue-600 group-hover:underline">View profile →</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ category: string; city: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { category: catSlug, city: citySlug } = await params
  const catInfo  = CATEGORY_MAP[catSlug]
  const cityName = CITY_SLUGS[citySlug]
  if (!catInfo || !cityName) return {}

  const theme = CITY_THEME[cityName]
  const county = theme?.county ?? 'San Joaquin County'

  return {
    title: `Best ${catInfo.label} in ${cityName}, CA | MoHoLocal`,
    description: `Discover the best ${catInfo.desc} in ${cityName}, ${county}. Top rated local businesses recommended by your neighbors on MoHoLocal — the hyperlocal guide to the 209 and East Bay.`,
    openGraph: {
      title: `Best ${catInfo.label} in ${cityName} | MoHoLocal`,
      description: `Top rated ${catInfo.desc} in ${cityName}, CA — recommended by locals on MoHoLocal.`,
      url: `https://www.moholocal.com/best/${catSlug}/${citySlug}`,
      siteName: 'MoHoLocal',
    },
  }
}

export default async function BestOfPage({ params }: PageProps) {
  const { category: catSlug, city: citySlug } = await params

  const catInfo  = CATEGORY_MAP[catSlug]
  const cityName = CITY_SLUGS[citySlug] as CityName | undefined
  if (!catInfo || !cityName) notFound()

  const theme = CITY_THEME[cityName]

  // ── Fetch top businesses ──────────────────────────────────────────────────
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('city', cityName)
    .eq('category', catInfo.dbCategory)
    .eq('status', 'approved')
    .eq('verified', true)
    .order('rating', { ascending: false })
    .limit(10)

  if (error) console.error('BestOfPage fetch error:', error)
  const businesses = (data ?? []) as Business[]

  // Related slugs to suggest
  const relatedSlugs = (RELATED[catInfo.dbCategory] ?? []).filter((s) => s !== catSlug).slice(0, 4)

  // Other cities (always shown)
  const otherCities = Object.entries(CITY_SLUGS).filter(([slug]) => slug !== citySlug)

  // Schema.org ItemList
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${catInfo.label} in ${cityName}`,
    description: `Top rated ${catInfo.desc} in ${cityName}, CA`,
    numberOfItems: businesses.length,
    itemListElement: businesses.map((biz, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LocalBusiness',
        name: biz.name,
        ...(biz.address ? { address: biz.address } : {}),
        ...(biz.phone   ? { telephone: biz.phone }  : {}),
        ...(biz.website ? { url: biz.website }       : {}),
        ...(biz.rating  ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: biz.rating,
            reviewCount: biz.review_count ?? 1,
          },
        } : {}),
      },
    })),
  }

  // Schema.org BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://www.moholocal.com' },
      { '@type': 'ListItem', position: 2, name: cityName,  item: `https://www.moholocal.com/${citySlug}` },
      {
        '@type': 'ListItem', position: 3,
        name: catInfo.label,
        item: `https://www.moholocal.com/${citySlug}/${DB_TO_CITY_CAT_SLUG[catInfo.dbCategory] ?? catSlug}`,
      },
      { '@type': 'ListItem', position: 4, name: `Best ${catInfo.label} in ${cityName}` },
    ],
  }

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 flex-wrap">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <Link href={`/${citySlug}`} className="hover:text-gray-600">{cityName}</Link>
          <span>/</span>
          <Link
            href={`/${citySlug}/${DB_TO_CITY_CAT_SLUG[catInfo.dbCategory] ?? catSlug}`}
            className="hover:text-gray-600"
          >
            {catInfo.label}
          </Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">Best Of</span>
        </nav>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-7 text-white mb-6"
          style={{ background: theme.gradient }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">
            {theme.county} · Community Picks
          </p>
          <h1 className="text-3xl font-extrabold mb-2">
            {catInfo.emoji} Best {catInfo.label} in {cityName}
          </h1>
          <p className="text-white/85 text-sm leading-relaxed">
            Top rated {catInfo.desc} in {cityName} — ranked by community reviews.
            {businesses.length > 0 ? ` Showing ${businesses.length} local result${businesses.length === 1 ? '' : 's'}.` : ''}
          </p>
        </div>

        {/* ── SEO intro paragraph ────────────────────────────────────────── */}
        <p className="text-gray-600 text-sm leading-relaxed mb-7">
          {getIntroCopy(catInfo.label, cityName)}
        </p>

        {/* ── Business List ──────────────────────────────────────────────── */}
        {businesses.length > 0 ? (
          <>
            <div className="space-y-4 mb-6">
              {businesses.map((biz, i) => (
                <BizCard key={biz.id} biz={biz} rank={i + 1} accent={theme.accent} />
              ))}
            </div>

            {/* Low data nudge — shown when fewer than 3 results */}
            {businesses.length < 3 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 px-6 text-center mb-8">
                <p className="text-2xl mb-2">🌱</p>
                <p className="font-semibold text-gray-700 text-sm">
                  We&apos;re still building this list.
                </p>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Know a great {catInfo.singular} in {cityName}? Help your neighbors discover it.
                </p>
                <Link
                  href="/submit-business"
                  className="inline-block text-xs font-bold px-5 py-2 rounded-xl text-white hover:opacity-90 transition-all"
                  style={{ backgroundColor: theme.accent }}
                >
                  + Submit a Business
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400 mb-10">
            <p className="text-4xl mb-3">{catInfo.emoji}</p>
            <p className="font-semibold text-lg text-gray-600">No listings yet in {cityName}</p>
            <p className="text-sm mt-1 mb-4">
              Be the first to add a {catInfo.singular} here and help your community find local options.
            </p>
            <Link
              href="/submit-business"
              className="inline-block text-xs font-bold px-5 py-2 rounded-xl text-white hover:opacity-90 transition-all"
              style={{ backgroundColor: theme.accent }}
            >
              + Submit a Business
            </Link>
          </div>
        )}

        {/* ── Own a business CTA ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center mb-6">
          <h2 className="font-extrabold text-gray-900 text-lg mb-1">
            Own a {catInfo.singular} in {cityName}?
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Get discovered by thousands of {cityName} residents looking for trusted local businesses.
          </p>
          <Link
            href="/submit-business"
            className="inline-block font-bold text-sm px-6 py-2.5 rounded-xl text-white hover:opacity-90 transition-all"
            style={{ backgroundColor: theme.accent }}
          >
            + Add Your Business — It&apos;s Free
          </Link>
        </div>

        {/* ── View all in directory ──────────────────────────────────────── */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 mb-8">
          <div>
            <div className="font-semibold text-sm text-gray-900">
              View all {catInfo.label} in {cityName}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Browse the full directory with filters</div>
          </div>
          <Link
            href={`/${citySlug}/${DB_TO_CITY_CAT_SLUG[catInfo.dbCategory] ?? catSlug}`}
            className="text-sm font-bold px-4 py-2 rounded-lg text-white hover:opacity-90 transition shrink-0"
            style={{ backgroundColor: theme.accent }}
          >
            View all →
          </Link>
        </div>

        {/* ── Related searches ───────────────────────────────────────────── */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Related Searches</h3>
          <div className="flex flex-wrap gap-2">
            {relatedSlugs.map((slug) => {
              const rel = CATEGORY_MAP[slug]
              if (!rel) return null
              return (
                <Link
                  key={slug}
                  href={`/best/${slug}/${citySlug}`}
                  className="text-sm font-medium px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-all"
                >
                  {rel.emoji} Best {rel.label} in {cityName}
                </Link>
              )
            })}
            {relatedSlugs.length === 0 && (
              <span className="text-sm text-gray-400 italic">No subcategories for this category.</span>
            )}
          </div>
        </div>

        {/* ── Same category in other cities — always shown ───────────────── */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            Best {catInfo.label} in Other Cities
          </h3>
          <div className="flex flex-wrap gap-2">
            {otherCities.map(([slug, name]) => (
              <Link
                key={slug}
                href={`/best/${catSlug}/${slug}`}
                className="text-sm font-medium px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800 transition-all"
              >
                Best {catInfo.label} in {name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
