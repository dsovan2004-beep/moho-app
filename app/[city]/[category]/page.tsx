export const runtime = 'edge'

import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// ── Slug maps ─────────────────────────────────────────────────────────────────

const CITY_MAP: Record<string, string> = {
  'mountain-house': 'Mountain House',
  'tracy':          'Tracy',
  'lathrop':        'Lathrop',
  'manteca':        'Manteca',
}

const CATEGORY_MAP: Record<string, string> = {
  'restaurants':          'Restaurants',
  'health-wellness':      'Health & Wellness',
  'health-and-wellness':  'Health & Wellness',
  'beauty-spa':           'Beauty & Spa',
  'beauty-and-spa':       'Beauty & Spa',
  'salons':               'Beauty & Spa',
  'retail':               'Retail',
  'shopping':             'Retail',
  'education':            'Education',
  'tutoring':             'Education',
  'automotive':           'Automotive',
  'auto-services':        'Automotive',
  'auto':                 'Automotive',
  'plumbers':             'Home Services',
  'home-services':        'Home Services',
  'contractors':          'Home Services',
  'real-estate':          'Real Estate',
  'housing':              'Real Estate',
  'pet-services':         'Pet Services',
  'vets':                 'Pet Services',
  'childcare':            'Childcare',
  'daycares':             'Childcare',
}

// ── City config ───────────────────────────────────────────────────────────────

const CITY_CFG: Record<string, { gradient: string; chip: string; emoji: string }> = {
  'Mountain House': {
    gradient: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)',
    chip: 'bg-blue-50 text-blue-700',
    emoji: '🏘️',
  },
  Tracy: {
    gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)',
    chip: 'bg-green-50 text-green-700',
    emoji: '🌿',
  },
  Lathrop: {
    gradient: 'linear-gradient(135deg,#581c87 0%,#7e22ce 100%)',
    chip: 'bg-purple-50 text-purple-700',
    emoji: '🔮',
  },
  Manteca: {
    gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)',
    chip: 'bg-orange-50 text-orange-700',
    emoji: '🍊',
  },
}

// ── Category emoji ────────────────────────────────────────────────────────────

function getCategoryEmoji(category: string): string {
  const c = category.toLowerCase()
  if (c.includes('restaurant') || c.includes('food')) return '🍽️'
  if (c.includes('home') || c.includes('plumb') || c.includes('contractor')) return '🔧'
  if (c.includes('health') || c.includes('medical') || c.includes('dental')) return '🏥'
  if (c.includes('pet')) return '🐾'
  if (c.includes('beauty') || c.includes('salon') || c.includes('spa')) return '💇'
  if (c.includes('auto') || c.includes('car')) return '🚗'
  if (c.includes('edu') || c.includes('school') || c.includes('tutor') || c.includes('child')) return '🏫'
  if (c.includes('real estate') || c.includes('housing')) return '🏠'
  if (c.includes('retail') || c.includes('shop')) return '🛍️'
  return '🏢'
}

// ── SEO Metadata ──────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ city: string; category: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { city: citySlug, category: categorySlug } = await params
  const city     = CITY_MAP[citySlug]
  const category = CATEGORY_MAP[categorySlug]
  if (!city || !category) return { title: 'MoHoLocal' }

  return {
    title: `Best ${category} in ${city}, CA | MoHoLocal`,
    description: `Find the best ${category.toLowerCase()} in ${city}, CA. Browse verified local listings, get phone numbers, addresses, and connect with trusted ${city} businesses on MoHoLocal.`,
    openGraph: {
      title: `Best ${category} in ${city}, CA | MoHoLocal`,
      description: `Discover top-rated ${category.toLowerCase()} in ${city}, CA. Your local guide to San Joaquin County businesses.`,
      url: `https://www.moholocal.com/${citySlug}/${categorySlug}`,
      siteName: 'MoHoLocal',
    },
  }
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getBusinesses(city: string, category: string): Promise<Business[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('city', city)
    .eq('category', category)
    .order('rating', { ascending: false })
  if (error) return []
  return (data ?? []) as Business[]
}

// ── Business card ─────────────────────────────────────────────────────────────

function BusinessCard({ biz, cityCfg, catEmoji }: {
  biz: Business
  cityCfg: { gradient: string; chip: string; emoji: string }
  catEmoji: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: cityCfg.gradient }}
        >
          {catEmoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h2 className="text-base font-bold text-gray-900 leading-snug">{biz.name}</h2>
            {biz.rating && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                ★ {biz.rating.toFixed(1)}
              </span>
            )}
          </div>

          {biz.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {biz.description}
            </p>
          )}

          {/* Contact details */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {biz.address && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>📍</span>
                <span>{biz.address}</span>
              </span>
            )}
            {biz.phone && (
              <a href={`tel:${biz.phone}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
                <span>📞</span>
                <span>{biz.phone}</span>
              </a>
            )}
            {biz.website && (
              <a href={biz.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline">
                <span>🌐</span>
                <span>{biz.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* View details link */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cityCfg.chip}`}>
          {cityCfg.emoji} {biz.city}
        </span>
        <Link href={`/business/${biz.id}`}
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition hover:opacity-90"
          style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}>
          View Details →
        </Link>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CityLandingPage({ params }: PageProps) {
  const { city: citySlug, category: categorySlug } = await params

  const city     = CITY_MAP[citySlug]
  const category = CATEGORY_MAP[categorySlug]

  if (!city || !category) notFound()

  const businesses = await getBusinesses(city!, category!)
  const cfg        = CITY_CFG[city!] ?? CITY_CFG['Mountain House']
  const catEmoji   = getCategoryEmoji(category!)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Breadcrumb ── */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition">Home</Link>
        <span>›</span>
        <Link href={`/directory?city=${encodeURIComponent(city!)}`}
          className="hover:text-blue-600 transition capitalize">
          {cfg.emoji} {city}
        </Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">{catEmoji} {category}</span>
      </nav>

      {/* ── Hero banner ── */}
      <div
        className="rounded-2xl p-8 mb-8 text-white"
        style={{ background: cfg.gradient }}
      >
        <div className="flex items-center gap-4">
          <div className="text-5xl">{catEmoji}</div>
          <div>
            <h1 className="text-3xl font-extrabold mb-1">
              {category} in {city}
            </h1>
            <p className="text-white/80 text-sm">
              {businesses.length > 0
                ? `${businesses.length} local ${category.toLowerCase()} business${businesses.length === 1 ? '' : 'es'} in ${city}, CA`
                : `Be the first to list your ${category.toLowerCase()} business in ${city}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── SEO intro paragraph ── */}
      <p className="text-gray-600 text-sm leading-relaxed mb-8">
        Looking for {category.toLowerCase()} in {city}, CA? MoHoLocal is your local guide to the
        best businesses in Mountain House, Tracy, Lathrop, and Manteca — San Joaquin County&apos;s
        fastest-growing communities. Browse verified listings below, call direct, or get directions.
      </p>

      {/* ── Business list or empty state ── */}
      {businesses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="text-6xl mb-4">{catEmoji}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No {category} listings yet in {city}
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Know a great {category.toLowerCase()} business in {city}? Help your community by adding it — it&apos;s free!
          </p>
          <Link
            href="/submit-business"
            className="inline-block px-6 py-3 rounded-xl text-sm font-bold transition hover:opacity-90"
            style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
          >
            + Be the First to List Here
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-10">
            {businesses.map((biz) => (
              <BusinessCard key={biz.id} biz={biz} cityCfg={cfg} catEmoji={catEmoji} />
            ))}
          </div>

          {/* Submit CTA at bottom */}
          <div
            className="rounded-2xl p-6 text-center text-white"
            style={{ background: cfg.gradient }}
          >
            <p className="font-bold text-lg mb-1">Own a {category} business in {city}?</p>
            <p className="text-white/80 text-sm mb-4">
              Get listed on MoHoLocal — free for local businesses
            </p>
            <Link
              href="/submit-business"
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90 bg-white"
              style={{ color: '#1e3a5f' }}
            >
              + Add Your Business
            </Link>
          </div>
        </>
      )}

      {/* ── Browse more ── */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Browse more in {city}</p>
        <div className="flex flex-wrap gap-2">
          {['Restaurants', 'Health & Wellness', 'Beauty & Spa', 'Home Services', 'Automotive', 'Pet Services', 'Real Estate', 'Education', 'Retail'].map((cat) => {
            if (cat === category) return null
            const slug = cat.toLowerCase()
              .replace(/ & /g, '-')
              .replace(/ /g, '-')
              .replace(/[^a-z0-9-]/g, '')
            return (
              <Link
                key={cat}
                href={`/${citySlug}/${slug}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 transition"
              >
                {getCategoryEmoji(cat)} {cat}
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
