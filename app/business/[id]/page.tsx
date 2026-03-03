export const runtime = 'edge'

import { supabase, type Business } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

// ── City config (matches index.html exactly) ──────────────────────────────────
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

// ── Category emojis ───────────────────────────────────────────────────────────
function getCategoryEmoji(category: string): string {
  const c = category.toLowerCase()
  if (c.includes('restaurant') || c.includes('food') || c.includes('dining')) return '🍽️'
  if (c.includes('home') || c.includes('plumb') || c.includes('electric') || c.includes('repair')) return '🔧'
  if (c.includes('health') || c.includes('medical') || c.includes('doctor') || c.includes('dental')) return '🏥'
  if (c.includes('pet')) return '🐾'
  if (c.includes('beauty') || c.includes('salon') || c.includes('spa') || c.includes('hair')) return '💇'
  if (c.includes('auto') || c.includes('car') || c.includes('vehicle')) return '🚗'
  if (c.includes('edu') || c.includes('school') || c.includes('tutor') || c.includes('child')) return '🏫'
  if (c.includes('real estate') || c.includes('housing')) return '🏠'
  if (c.includes('retail') || c.includes('shop') || c.includes('store')) return '🛍️'
  if (c.includes('fit') || c.includes('gym') || c.includes('sport')) return '🏋️'
  if (c.includes('financial') || c.includes('bank') || c.includes('insurance')) return '💰'
  if (c.includes('legal') || c.includes('law')) return '⚖️'
  if (c.includes('tech') || c.includes('it ') || c.includes('software')) return '💻'
  return '🏢'
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function getBusiness(id: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as Business
}

async function getRelated(city: string, category: string, excludeId: string) {
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('city', city)
    .eq('category', category)
    .neq('id', excludeId)
    .limit(4)
  return (data ?? []) as Business[]
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
      {reviewCount !== undefined && (
        <span className="text-white/70 text-sm">({reviewCount} reviews)</span>
      )}
    </div>
  )
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-base shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all">
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-800 break-words">{value}</p>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function BusinessDetailPage({ params }: PageProps) {
  const { id } = await params
  const biz = await getBusiness(id)
  if (!biz) notFound()

  const related = await getRelated(biz.city, biz.category, biz.id)
  const city = CITY_CFG[biz.city] ?? CITY_CFG['Mountain House']
  const catEmoji = getCategoryEmoji(biz.category)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-5 flex items-center gap-2 flex-wrap">
        <Link href="/directory" className="hover:text-blue-600 transition">Directory</Link>
        <span>›</span>
        <Link href={`/directory?category=${encodeURIComponent(biz.category)}`}
          className="hover:text-blue-600 transition">
          {biz.category}
        </Link>
        <span>›</span>
        <span className="text-gray-700 font-medium truncate">{biz.name}</span>
      </nav>

      {/* ── Hero Banner (city-specific gradient, matches index.html) ── */}
      <div
        className="rounded-2xl p-7 mb-8 flex items-center gap-6 flex-wrap"
        style={{ background: city.gradient }}
      >
        {/* Logo box */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shrink-0 shadow-lg">
          {catEmoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{biz.name}</h1>
          {biz.description && (
            <p className="text-white/80 text-sm line-clamp-2 mb-3">{biz.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {catEmoji} {biz.category}
            </span>
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
              📍 {biz.city}
            </span>
            {biz.rating && (
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                ⭐ {biz.rating.toFixed(1)} · {biz.review_count ?? 0} reviews
              </span>
            )}
          </div>
          <StarRating rating={biz.rating} reviewCount={biz.review_count} />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 shrink-0">
          {biz.phone && (
            <a href={`tel:${biz.phone}`}
              className="bg-amber-400 text-[#1e3a5f] font-bold text-sm px-5 py-2.5 rounded-xl text-center hover:bg-amber-300 transition">
              📞 Call Now
            </a>
          )}
          {biz.website && (
            <a href={biz.website} target="_blank" rel="noopener noreferrer"
              className="bg-white/15 border border-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl text-center hover:bg-white/25 transition">
              🌐 Website
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">

          {/* About */}
          {biz.description && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">About {biz.name}</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{biz.description}</p>
              {/* Category tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${city.chip}`}>
                  {catEmoji} {biz.category}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${city.chip}`}>
                  {city.emoji} {biz.city}
                </span>
              </div>
            </div>
          )}

          {/* Reviews placeholder */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center justify-between">
              Reviews
              {biz.rating && (
                <span className="text-amber-500 text-sm font-semibold">
                  ★ {biz.rating.toFixed(1)} · {biz.review_count ?? 0} reviews
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-400 italic mt-3">
              Community reviews coming soon — sign in to share your experience with {biz.name}.
            </p>
            <button
              className="mt-4 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700 transition">
              ✍️ Write a Review
            </button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="lg:w-72 shrink-0 space-y-4">

          {/* Contact Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3">📋 Contact &amp; Info</h2>
            {biz.address && (
              <InfoRow icon="📍" label="Address" value={biz.address}
                href={`https://maps.google.com/?q=${encodeURIComponent(biz.address + ', ' + biz.city + ', CA')}`} />
            )}
            {biz.phone && (
              <InfoRow icon="📞" label="Phone" value={biz.phone} href={`tel:${biz.phone}`} />
            )}
            {biz.website && (
              <InfoRow icon="🌐" label="Website"
                value={biz.website.replace(/^https?:\/\//, '')}
                href={biz.website} />
            )}
            <InfoRow icon="🏙️" label="City" value={`${city.emoji} ${biz.city}, CA`} />
            <InfoRow icon="📂" label="Category" value={`${catEmoji} ${biz.category}`} />

            {/* CTA */}
            {biz.phone && (
              <a href={`tel:${biz.phone}`}
                className="mt-5 block w-full text-center text-sm font-bold py-3 rounded-xl text-white transition"
                style={{ background: city.gradient }}>
                📞 Call {biz.name}
              </a>
            )}
            {biz.website && (
              <a href={biz.website} target="_blank" rel="noopener noreferrer"
                className="mt-2 block w-full text-center text-sm font-semibold py-3 rounded-xl border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-700 transition">
                Visit Website →
              </a>
            )}
          </div>

          {/* Claim listing */}
          {!(biz as any).claimed && (
            <Link
              href={`/claim-listing/${biz.id}`}
              className="block w-full text-center text-sm font-medium py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition">
              🏷️ Is this your business? Claim it
            </Link>
          )}

          {/* Back link */}
          <Link href="/directory"
            className="block text-center text-sm text-gray-400 hover:text-blue-600 transition py-2">
            ← Back to Directory
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
              <Link key={r.id} href={`/business/${r.id}`}
                className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2"
                  style={{ background: city.gradient }}>
                  <span>{getCategoryEmoji(r.category)}</span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition text-xs line-clamp-2 leading-snug">
                  {r.name}
                </h3>
                {r.rating && (
                  <span className="text-xs text-amber-500 font-medium mt-1 block">★ {r.rating.toFixed(1)}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
