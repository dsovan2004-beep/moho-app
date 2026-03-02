export const runtime = 'edge'

import { supabase, type Business } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

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

function StarRating({ rating, reviewCount }: { rating?: number; reviewCount?: number }) {
  if (!rating) return null
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-0.5 text-amber-400 text-xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>{i < full ? '★' : i === full && half ? '½' : '☆'}</span>
        ))}
      </span>
      <span className="text-lg font-bold text-gray-900">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-lg shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all">
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-800 break-all">{value}</p>
        )}
      </div>
    </div>
  )
}

export default async function BusinessDetailPage({ params }: PageProps) {
  const { id } = await params
  const biz = await getBusiness(id)

  if (!biz) notFound()

  const related = await getRelated(biz.city, biz.category, biz.id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/directory" className="hover:text-blue-600 transition">Directory</Link>
        <span>›</span>
        <Link
          href={`/directory?category=${encodeURIComponent(biz.category)}`}
          className="hover:text-blue-600 transition"
        >
          {biz.category}
        </Link>
        <span>›</span>
        <span className="text-gray-700 font-medium">{biz.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Hero image */}
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 h-56 flex items-center justify-center mb-6">
            {biz.image_url ? (
              <img src={biz.image_url} alt={biz.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">🏢</span>
            )}
          </div>

          {/* Title block */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">{biz.name}</h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-sm font-medium px-3 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {biz.category}
                  </span>
                  <span className="text-sm text-gray-500">📍 {biz.city}</span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <StarRating rating={biz.rating} reviewCount={biz.review_count} />
            </div>
          </div>

          {/* Description */}
          {biz.description && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">About</h2>
              <p className="text-gray-600 leading-relaxed">{biz.description}</p>
            </div>
          )}

          {/* Write a review placeholder */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Reviews</h2>
            <p className="text-sm text-gray-500 italic">
              Reviews coming soon. Sign in to share your experience.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0 space-y-4">
          {/* Contact Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-2">Contact & Info</h2>
            <div>
              {biz.address && (
                <InfoRow icon="📍" label="Address" value={biz.address}
                  href={`https://maps.google.com/?q=${encodeURIComponent(biz.address)}`} />
              )}
              {biz.phone && (
                <InfoRow icon="📞" label="Phone" value={biz.phone} href={`tel:${biz.phone}`} />
              )}
              {biz.website && (
                <InfoRow icon="🌐" label="Website" value={biz.website} href={biz.website} />
              )}
              <InfoRow icon="🏙️" label="City" value={biz.city} />
            </div>

            {/* CTA */}
            {biz.phone && (
              <a
                href={`tel:${biz.phone}`}
                className="mt-4 block w-full text-center text-sm font-semibold py-2.5 rounded-full text-white transition"
                style={{ backgroundColor: '#2563eb' }}
              >
                📞 Call Now
              </a>
            )}
            {biz.website && (
              <a
                href={biz.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block w-full text-center text-sm font-semibold py-2.5 rounded-full border border-blue-600 text-blue-700 hover:bg-blue-50 transition"
              >
                Visit Website →
              </a>
            )}
          </div>

          {/* Back to directory */}
          <Link
            href="/directory"
            className="block text-center text-sm text-gray-500 hover:text-blue-600 transition py-2"
          >
            ← Back to Directory
          </Link>
        </aside>
      </div>

      {/* Related Businesses */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            More {biz.category} in {biz.city}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/business/${r.id}`}
                className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                  <span className="text-xl">🏢</span>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition text-sm line-clamp-2">
                  {r.name}
                </h3>
                {r.rating && (
                  <span className="text-xs text-amber-500 font-medium">★ {r.rating.toFixed(1)}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

