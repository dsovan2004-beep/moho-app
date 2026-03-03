export const runtime = 'edge'

import { supabase, type Business } from '@/lib/supabase'
import Link from 'next/link'

const CATEGORIES = [
  { key: 'All',               emoji: '🗂️' },
  { key: 'Restaurants',       emoji: '🍽️' },
  { key: 'Health & Wellness', emoji: '🏥' },
  { key: 'Beauty & Spa',      emoji: '💇' },
  { key: 'Retail',            emoji: '🛍️' },
  { key: 'Education',         emoji: '🏫' },
  { key: 'Automotive',        emoji: '🚗' },
  { key: 'Real Estate',       emoji: '🏠' },
]

function getCategoryEmoji(cat: string): string {
  const c = cat.toLowerCase()
  if (c.includes('restaurant') || c.includes('food') || c.includes('dining')) return '🍽️'
  if (c.includes('health') || c.includes('medical') || c.includes('doctor') || c.includes('dental') || c.includes('wellness')) return '🏥'
  if (c.includes('beauty') || c.includes('salon') || c.includes('spa') || c.includes('hair')) return '💇'
  if (c.includes('retail') || c.includes('shop') || c.includes('store')) return '🛍️'
  if (c.includes('edu') || c.includes('school') || c.includes('tutor') || c.includes('child')) return '🏫'
  if (c.includes('auto') || c.includes('car') || c.includes('vehicle')) return '🚗'
  if (c.includes('real estate') || c.includes('housing')) return '🏠'
  if (c.includes('home') || c.includes('plumb') || c.includes('electric') || c.includes('repair')) return '🔧'
  if (c.includes('pet')) return '🐾'
  if (c.includes('financial') || c.includes('bank') || c.includes('insurance')) return '💰'
  if (c.includes('legal') || c.includes('law')) return '⚖️'
  if (c.includes('tech') || c.includes('it ') || c.includes('software')) return '💻'
  return '🏢'
}

const CITIES = ['All Cities', 'Mountain House', 'Tracy', 'Lathrop', 'Manteca']

interface PageProps {
  searchParams: Promise<{ city?: string; category?: string; q?: string }>
}

async function getBusinesses(city?: string, category?: string, query?: string) {
  let req = supabase.from('businesses').select('*').order('name')

  if (city && city !== 'All Cities') {
    req = req.eq('city', city)
  }
  if (category && category !== 'All') {
    req = req.eq('category', category)
  }
  if (query) {
    req = req.ilike('name', `%${query}%`)
  }

  const { data, error } = await req
  if (error) console.error(error)
  return (data ?? []) as Business[]
}

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return null
  const full = Math.floor(rating)
  return (
    <span className="flex items-center gap-0.5 text-amber-400 text-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < full ? '★' : '☆'}</span>
      ))}
      <span className="text-gray-500 text-xs ml-1">({rating.toFixed(1)})</span>
    </span>
  )
}

function BusinessCard({ biz }: { biz: Business }) {
  return (
    <Link
      href={`/business/${biz.id}`}
      className="group flex gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      {/* Image / Placeholder */}
      <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center">
        {biz.image_url ? (
          <img src={biz.image_url} alt={biz.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">{getCategoryEmoji(biz.category)}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition truncate">
            {biz.name}
          </h3>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">
            {biz.category}
          </span>
        </div>
        <StarRating rating={biz.rating} />
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{biz.description}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          <span>📍 {biz.city}</span>
          {biz.address && <span className="truncate">{biz.address}</span>}
        </div>
      </div>
    </Link>
  )
}

export default async function DirectoryPage({ searchParams }: PageProps) {
  const params = await searchParams
  const city = params.city ?? 'All Cities'
  const category = params.category ?? 'All'
  const query = params.q ?? ''

  const businesses = await getBusinesses(city, category, query)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Business Directory</h1>
        <p className="text-gray-500 mt-1">
          Discover local businesses across San Joaquin County
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:w-56 shrink-0 space-y-4">
          {/* Search */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 block">
              Search
            </label>
            <form>
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search businesses…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input type="hidden" name="city" value={city} />
              <input type="hidden" name="category" value={category} />
            </form>
          </div>

          {/* City Filter */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">City</p>
            <div className="flex flex-col gap-1">
              {CITIES.map((c) => (
                <Link
                  key={c}
                  href={`/directory?city=${encodeURIComponent(c)}&category=${encodeURIComponent(category)}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                  className={`text-sm px-3 py-1.5 rounded-lg transition font-medium ${
                    city === c
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Category</p>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(({ key, emoji }) => (
                <Link
                  key={key}
                  href={`/directory?city=${encodeURIComponent(city)}&category=${encodeURIComponent(key)}${query ? `&q=${encodeURIComponent(query)}` : ''}`}
                  className={`text-sm px-3 py-1.5 rounded-lg transition font-medium ${
                    category === key
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {emoji} {key}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Listings */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{businesses.length}</span> businesses found
            </p>
            <Link
              href="/submit-business"
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all"
              style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
            >
              + Submit a Business
            </Link>
          </div>

          {businesses.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">No businesses found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {businesses.map((biz) => (
                <BusinessCard key={biz.id} biz={biz} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
