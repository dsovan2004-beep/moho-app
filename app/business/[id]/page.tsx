export const runtime = 'edge'

import { getSupabaseClient, type Business, type BusinessImage } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReviewSection from '@/app/components/ReviewSection'
import ImageGallery from '@/app/components/ImageGallery'

import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

// ── JSON-LD builder ──────────────────────────────────────────────────────────
function buildJsonLd(biz: Business) {
  const isRestaurant = biz.category?.toLowerCase().includes('restaurant')
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': isRestaurant ? 'Restaurant' : 'LocalBusiness',
    name: biz.name,
    ...(biz.description && { description: biz.description }),
    ...(biz.image_url && { image: biz.image_url }),
    ...(biz.phone && { telephone: biz.phone }),
    ...(biz.website && { url: biz.website }),
    address: {
      '@type': 'PostalAddress',
      ...(biz.address && { streetAddress: biz.address }),
      addressLocality: biz.city,
      addressRegion: 'CA',
      addressCountry: 'US',
    },
  }
  if (biz.rating && biz.review_count && biz.review_count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: biz.rating.toFixed(1),
      reviewCount: biz.review_count,
      bestRating: '5',
      worstRating: '1',
    }
  }
  if (biz.category) {
    schema.additionalType = biz.category
  }
  return schema
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const biz = await getBusiness(id)
  if (!biz) return { title: 'Business Not Found | MoHo Local' }

  const title = `${biz.name} — ${biz.category} in ${biz.city}, CA | MoHo Local`
  const description = biz.description
    ? biz.description.slice(0, 160)
    : `Find ${biz.name} in ${biz.city}, CA. Browse ${biz.category.toLowerCase()} listings on MoHo Local — your hyperlocal community directory for the 209.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.moholocal.com/business/${id}`,
      ...(biz.image_url && { images: [{ url: biz.image_url }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ── City / category slug maps (for internal links) ───────────────────────────

const CITY_TO_SLUG: Record<string, string> = {
  'Mountain House': 'mountain-house',
  'Tracy':          'tracy',
  'Lathrop':        'lathrop',
  'Manteca':        'manteca',
  'Brentwood':      'brentwood',
}

// Maps DB category name → city/category page slug  (/[city]/[category])
const CAT_TO_SLUG: Record<string, string> = {
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

// Maps DB category name → best-of page slug  (/best/[category]/[city])
const CAT_TO_BEST_SLUG: Record<string, string> = {
  'Restaurants':      'restaurants',
  'Health & Wellness':'health-and-wellness',
  'Beauty & Spa':     'beauty-and-spa',
  'Retail':           'retail',
  'Education':        'education',
  'Automotive':       'automotive',
  'Real Estate':      'real-estate',
  'Home Services':    'home-services',
  'Pet Services':     'pet-services',
}

// ── City config ───────────────────────────────────────────────────────────────
const CITY_CFG: Record<string, { gradient: string; chip: string; emoji: string; accent: string }> = {
  'Mountain House': {
    gradient: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)',
    chip: 'bg-blue-50 text-blue-700',
    emoji: '🏘️',
    accent: '#1e40af',
  },
  Tracy: {
    gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)',
    chip: 'bg-green-50 text-green-700',
    emoji: '🌿',
    accent: '#15803d',
  },
  Lathrop: {
    gradient: 'linear-gradient(135deg,#581c87 0%,#7e22ce 100%)',
    chip: 'bg-purple-50 text-purple-700',
    emoji: '🔮',
    accent: '#7e22ce',
  },
  Manteca: {
    gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)',
    chip: 'bg-orange-50 text-orange-700',
    emoji: '🍊',
    accent: '#c2410c',
  },
  Brentwood: {
    gradient: 'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)',
    chip: 'bg-teal-50 text-teal-700',
    emoji: '🌊',
    accent: '#0d9488',
  },
}

// ── Category emojis ───────────────────────────────────────────────────────────
function getCategoryEmoji(category: string): string {
  const c = category.toLowerCase()
  if (c.includes('restaurant') || c.includes('food') || c.includes('dining')) return '🍽️'
  if (c.includes('home') || c.includes('plumb') || c.includes('electric') || c.includes('repair')) return '🔧'
  if (c.includes('health') || c.includes('medical') || c.includes('doctor') || c.includes('dental') || c.includes('wellness')) return '🏥'
  if (c.includes('pet')) return '🐾'
  if (c.includes('beauty') || c.includes('salon') || c.includes('spa') || c.includes('hair')) return '💇'
  if (c.includes('auto') || c.includes('car') || c.includes('vehicle')) return '🚗'
  if (c.includes('edu') || c.includes('school') || c.includes('tutor') || c.includes('child')) return '🏫'
  if (c.includes('real estate') || c.includes('housing')) return '🏠'
  if (c.includes('retail') || c.includes('shop') || c.includes('store')) return '🛍️'
  if (c.includes('fit') || c.includes('gym') || c.includes('sport')) return '🏋️'
  return '🏢'
}

// ── Hours parsing ─────────────────────────────────────────────────────────────
// hours field is free-text (e.g. "Mon-Fri 9am-6pm, Sat 10am-4pm")
// We just display as-is but split on commas/semicolons for readability
function parseHours(hours: string): string[] {
  return hours
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function getBusiness(id: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .eq('verified', true)
    .single()
  if (error) return null
  return data as Business
}

async function getRelated(city: string, category: string, excludeId: string) {
  const supabase = getSupabaseClient()
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('city', city)
    .eq('category', category)
    .eq('status', 'approved')
    .eq('verified', true)
    .neq('id', excludeId)
    .order('rating', { ascending: false })
    .limit(4)
  return (data ?? []) as Business[]
}

async function getBusinessImages(businessId: string) {
  const supabase = getSupabaseClient()
  const { data } = await supabase
    .from('business_images')
    .select('*')
    .eq('business_id', businessId)
    .eq('verified', true)
    .in('source', ['google_places', 'owner_upload', 'admin_verified'])
    .order('position', { ascending: true })
  return (data ?? []) as BusinessImage[]
}

// ── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ rating, reviewCount }: { rating?: number; reviewCount?: number }) {
  if (!rating) return null
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <div className="flex items-center gap-2">
      <span className="flex text-amber-400 text-lg">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>{i < full ? '★' : i === full && half ? '½' : '☆'}</span>
        ))}
      </span>
      <span className="font-bold text-white">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && reviewCount > 0 && (
        <span className="text-white/70 text-sm">({reviewCount} reviews)</span>
      )}
    </div>
  )
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({
  icon, label, value, href, internalHref,
}: {
  icon: string; label: string; value: string; href?: string; internalHref?: string
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-base shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {value}
          </a>
        ) : internalHref ? (
          <Link href={internalHref} className="text-sm text-blue-600 hover:underline break-all">
            {value}
          </Link>
        ) : (
          <p className="text-sm text-gray-800 break-words">{value}</p>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function BusinessDetailPage({ params }: PageProps) {
  const { id } = await params
  const biz = await getBusiness(id)
  if (!biz) notFound()

  const [related, images] = await Promise.all([
    getRelated(biz.city, biz.category, biz.id),
    getBusinessImages(biz.id),
  ])
  const city = CITY_CFG[biz.city] ?? CITY_CFG['Mountain House']
  const catEmoji = getCategoryEmoji(biz.category)
  const hasContact = !!(biz.phone || biz.website || biz.contact_email)
  const hoursList = biz.hours ? parseHours(biz.hours) : []

  const jsonLd = buildJsonLd(biz)
  // Gallery images are now filtered at query level:
  // getBusinessImages() only returns verified=true + source in (google_places, owner_upload, admin_verified)
  const verifiedImages = images

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* JSON-LD structured data for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-5 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-blue-600 transition">Home</Link>
        <span>›</span>
        <Link
          href={`/${CITY_TO_SLUG[biz.city] ?? biz.city.toLowerCase().replace(/\s+/g, '-')}`}
          className="hover:text-blue-600 transition"
        >
          {city.emoji} {biz.city}
        </Link>
        <span>›</span>
        <Link
          href={`/${CITY_TO_SLUG[biz.city] ?? biz.city.toLowerCase().replace(/\s+/g, '-')}/${CAT_TO_SLUG[biz.category] ?? biz.category.toLowerCase().replace(/\s+/g, '-')}`}
          className="hover:text-blue-600 transition"
        >
          {biz.category}
        </Link>
        <span>›</span>
        <span className="text-gray-700 font-medium truncate">{biz.name}</span>
      </nav>

      {/* ── Hero Banner ── */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-8"
        style={{ background: city.gradient }}
      >
        <div className="flex items-start gap-5 flex-wrap">
          {/* Logo / icon */}
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-lg">
            {catEmoji}
          </div>

          {/* Core info */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-2">
              {biz.verified && (
                <span className="inline-flex items-center gap-1 bg-green-400/20 border border-green-300/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
              {biz.claimed && (
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  🏷️ Claimed
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 leading-tight">
              {biz.name}
            </h1>

            {biz.description && (
              <p className="text-white/80 text-sm line-clamp-2 mb-3 leading-relaxed">
                {biz.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {catEmoji} {biz.category}
              </span>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                📍 {biz.city}, CA
              </span>
              {biz.rating && (
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  ⭐ {biz.rating.toFixed(1)}
                  {biz.review_count ? ` · ${biz.review_count} reviews` : ''}
                </span>
              )}
            </div>

            <StarRating rating={biz.rating} reviewCount={biz.review_count} />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            {biz.phone && (
              <a
                href={`tel:${biz.phone}`}
                className="bg-amber-400 text-[#1e3a5f] font-bold text-sm px-5 py-2.5 rounded-xl text-center hover:bg-amber-300 transition"
              >
                📞 Call Now
              </a>
            )}
            {biz.website && (
              <a
                href={biz.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/15 border border-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl text-center hover:bg-white/25 transition"
              >
                🌐 Visit Website
              </a>
            )}
            {!hasContact && (
              <Link
                href={`/claim-listing/${biz.id}`}
                className="bg-white/15 border border-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl text-center hover:bg-white/25 transition"
              >
                🏷️ Claim &amp; Add Contact Info
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Photo Gallery ── only verified Google Places / owner / admin images */}
      {verifiedImages.length > 0 && (
        <div className="mb-8">
          <ImageGallery
            images={verifiedImages}
            businessName={biz.name}
            accentColor={city.accent}
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* About */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">About {biz.name}</h2>
            {biz.description ? (
              <p className="text-gray-600 leading-relaxed text-sm">{biz.description}</p>
            ) : (
              <p className="text-gray-400 text-sm italic">
                No description yet.{' '}
                <Link href={`/claim-listing/${biz.id}`} className="text-blue-500 hover:underline not-italic">
                  Own this business? Add one →
                </Link>
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href={`/${CITY_TO_SLUG[biz.city] ?? biz.city.toLowerCase().replace(/\s+/g, '-')}/${CAT_TO_SLUG[biz.category] ?? biz.category.toLowerCase().replace(/\s+/g, '-')}`}
                className={`text-xs font-semibold px-3 py-1 rounded-full hover:opacity-80 transition ${city.chip}`}
              >
                {catEmoji} {biz.category}
              </Link>
              <Link
                href={`/${CITY_TO_SLUG[biz.city] ?? biz.city.toLowerCase().replace(/\s+/g, '-')}`}
                className={`text-xs font-semibold px-3 py-1 rounded-full hover:opacity-80 transition ${city.chip}`}
              >
                {city.emoji} {biz.city}
              </Link>
            </div>
          </div>

          {/* Reviews */}
          <ReviewSection
            businessId={biz.id}
            businessName={biz.name}
            initialRating={biz.rating}
            initialCount={biz.review_count}
          />
        </div>

        {/* ── Sidebar ── */}
        <aside className="lg:w-72 shrink-0 space-y-4">

          {/* Contact Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3">📋 Contact &amp; Info</h2>

            {biz.address && (
              <InfoRow
                icon="📍"
                label="Address"
                value={biz.address}
                href={`https://maps.google.com/?q=${encodeURIComponent(biz.address + ', ' + biz.city + ', CA')}`}
              />
            )}
            {biz.phone && (
              <InfoRow icon="📞" label="Phone" value={biz.phone} href={`tel:${biz.phone}`} />
            )}
            {biz.website && (
              <InfoRow
                icon="🌐"
                label="Website"
                value={biz.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                href={biz.website}
              />
            )}
            {biz.contact_email && !biz.phone && (
              <InfoRow
                icon="✉️"
                label="Email"
                value={biz.contact_email}
                href={`mailto:${biz.contact_email}`}
              />
            )}
            {hoursList.length === 0 && biz.hours && (
              <InfoRow icon="🕐" label="Hours" value={biz.hours} />
            )}
            <InfoRow
              icon="🏙️"
              label="City"
              value={`${city.emoji} ${biz.city}, CA`}
              internalHref={`/${CITY_TO_SLUG[biz.city] ?? biz.city.toLowerCase().replace(/\s+/g, '-')}`}
            />
            <InfoRow
              icon="📂"
              label="Category"
              value={`${catEmoji} ${biz.category}`}
              internalHref={`/${CITY_TO_SLUG[biz.city] ?? biz.city.toLowerCase().replace(/\s+/g, '-')}/${CAT_TO_SLUG[biz.category] ?? biz.category.toLowerCase().replace(/\s+/g, '-')}`}
            />

            {/* No contact info fallback */}
            {!hasContact && (
              <div className="mt-3 p-3 bg-amber-50 rounded-xl text-xs text-amber-700 leading-relaxed">
                📬 No contact info on file yet.{' '}
                <Link href={`/claim-listing/${biz.id}`} className="font-semibold underline">
                  Claim this listing
                </Link>{' '}
                to add it.
              </div>
            )}

            {/* Primary CTA */}
            {biz.phone && (
              <a
                href={`tel:${biz.phone}`}
                className="mt-5 block w-full text-center text-sm font-bold py-3 rounded-xl text-white transition hover:opacity-90"
                style={{ background: city.gradient }}
              >
                📞 Call {biz.name}
              </a>
            )}
            {biz.website && (
              <a
                href={biz.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block w-full text-center text-sm font-semibold py-3 rounded-xl border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 transition"
              >
                Visit Website →
              </a>
            )}
            {biz.contact_email && !biz.phone && (
              <a
                href={`mailto:${biz.contact_email}`}
                className="mt-2 block w-full text-center text-sm font-semibold py-3 rounded-xl border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 transition"
              >
                ✉️ Send Email
              </a>
            )}
          </div>

          {/* Map & Directions */}
          {biz.address && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <iframe
                width="100%"
                height="190"
                loading="lazy"
                allowFullScreen
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(biz.address + ', ' + biz.city + ', CA')}&output=embed`}
              />
              <div className="p-3">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(biz.address + ', ' + biz.city + ', CA')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center text-sm font-bold py-2.5 rounded-xl transition hover:opacity-90"
                  style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
                >
                  📍 Get Directions
                </a>
              </div>
            </div>
          )}

          {/* Hours */}
          {hoursList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 mb-3">🕐 Hours</h2>
              <ul className="space-y-1">
                {hoursList.map((line, i) => (
                  <li key={i} className="text-xs text-gray-600 leading-relaxed">{line}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Claim listing CTA ─────────────────────────────────────── */}
          {!biz.claimed && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-snug">
                    Is this your business?
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Claim this listing to add contact info, photos, hours, and respond to reviews.
                  </p>
                </div>
              </div>
              <Link
                href={`/claim-listing/${biz.id}`}
                className="block w-full text-center text-sm font-bold py-2.5 rounded-xl text-white transition hover:opacity-90"
                style={{ backgroundColor: city.accent }}
              >
                Claim This Business →
              </Link>
              <p className="text-[10px] text-gray-400 text-center mt-2">Free · Takes 2 minutes</p>
            </div>
          )}

          {/* Best Of link */}
          {CAT_TO_BEST_SLUG[biz.category] && (
            <Link
              href={`/best/${CAT_TO_BEST_SLUG[biz.category]}/${CITY_TO_SLUG[biz.city] ?? biz.city.toLowerCase().replace(/\s+/g, '-')}`}
              className="block w-full text-center text-xs font-semibold py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700 transition"
            >
              ⭐ Best {biz.category} in {biz.city}
            </Link>
          )}

          {/* Report listing */}
          <Link
            href={`/report-listing/${biz.id}`}
            className="block w-full text-center text-xs text-gray-400 hover:text-red-500 transition py-1"
          >
            🚩 Report this listing
          </Link>

          {/* Back to city link */}
          <Link
            href={`/${CITY_TO_SLUG[biz.city] ?? biz.city.toLowerCase().replace(/\s+/g, '-')}`}
            className="block text-center text-sm text-gray-400 hover:text-blue-600 transition py-2"
          >
            ← Back to {biz.city}
          </Link>
        </aside>
      </div>

      {/* ── Related Businesses ── */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            More {biz.category} in {biz.city}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/business/${r.id}`}
                className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 shadow-sm"
                  style={{ background: city.gradient }}
                >
                  <span>{getCategoryEmoji(r.category)}</span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition text-xs line-clamp-2 leading-snug">
                  {r.name}
                </h3>
                {r.rating && (
                  <span className="text-xs text-amber-500 font-medium mt-1 block">
                    ★ {r.rating.toFixed(1)}
                  </span>
                )}
                {!r.rating && (
                  <span className="text-[10px] text-gray-400 mt-1 block">No reviews yet</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── No related: suggest browsing category ── */}
      {related.length === 0 && (
        <section className="mt-12 text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 text-sm mb-3">
            No other {biz.category} listings in {biz.city} yet.
          </p>
          <Link
            href={`/directory?category=${encodeURIComponent(biz.category)}`}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Browse all {biz.category} across the 209 →
          </Link>
        </section>
      )}
    </div>
  )
}
