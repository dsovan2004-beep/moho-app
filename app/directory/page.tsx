'use client'
export const runtime = 'edge'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

const PAGE_SIZE = 20

const CATEGORIES = [
  { key: 'All',               emoji: '🗂️' },
  { key: 'Restaurants',       emoji: '🍽️' },
  { key: 'Health & Wellness', emoji: '🏥' },
  { key: 'Home Services',     emoji: '🔧' },
  { key: 'Pet Services',      emoji: '🐾' },
  { key: 'Beauty & Spa',      emoji: '💇' },
  { key: 'Automotive',        emoji: '🚗' },
  { key: 'Education',         emoji: '🏫' },
  { key: 'Real Estate',       emoji: '🏠' },
  { key: 'Retail',            emoji: '🛍️' },
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
      <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-blue-50 flex items-center justify-center">
        {biz.image_url ? (
          <img src={biz.image_url} alt={biz.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">{getCategoryEmoji(biz.category)}</span>
        )}
      </div>
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

export default function DirectoryPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const city = searchParams.get('city') ?? 'All Cities'
  const category = searchParams.get('category') ?? 'All'
  const query = searchParams.get('q') ?? ''

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [searchInput, setSearchInput] = useState(query)
  const isFirstRender = useRef(true)

  // Fetch first page whenever filters change
  useEffect(() => {
    setOffset(0)
    setBusinesses([])
    fetchPage(0, true)
    setSearchInput(query)
  }, [city, category, query])

  async function fetchPage(from: number, reset = false) {
    const supabase = getSupabaseClient()
    if (reset) setLoading(true)
    else setLoadingMore(true)

    const to = from + PAGE_SIZE - 1

    let req = supabase
      .from('businesses')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .order('name')
      .range(from, to)

    if (city !== 'All Cities') req = req.eq('city', city)
    if (category !== 'All') req = req.eq('category', category)
    if (query) req = req.or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)

    const { data, count } = await req
    const newBizs = (data ?? []) as Business[]

    setBusinesses(prev => reset ? newBizs : [...prev, ...newBizs])
    setTotal(count ?? 0)
    setOffset(from + newBizs.length)
    setLoading(false)
    setLoadingMore(false)
  }

  function handleLoadMore() {
    fetchPage(offset)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('city', city)
    params.set('category', category)
    if (searchInput.trim()) params.set('q', searchInput.trim())
    router.push(`/directory?${params.toString()}`)
  }

  function filterUrl(newCity: string, newCat: string) {
    const params = new URLSearchParams()
    params.set('city', newCity)
    params.set('category', newCat)
    if (query) params.set('q', query)
    return `/directory?${params.toString()}`
  }

  const hasMore = businesses.length < total

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Business Directory</h1>
        <p className="text-gray-500 mt-1">Discover local businesses across San Joaquin County</p>
      </div>

      {/* ── Mobile filter chips (hidden on lg+) ── */}
      <div className="lg:hidden mb-4 space-y-3">
        {/* City chips */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-1 min-w-max">
            {CITIES.map((c) => (
              <Link
                key={c}
                href={filterUrl(c, category)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition ${
                  city === c
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
        {/* Category chips */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 pb-1 min-w-max">
            {CATEGORIES.map(({ key, emoji }) => (
              <Link
                key={key}
                href={filterUrl(city, key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition ${
                  category === key
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {emoji} {key}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar Filters */}
        <aside className="hidden lg:block lg:w-56 shrink-0 space-y-4">

          {/* Search */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 block">
              Search
            </label>
            <form onSubmit={handleSearch} className="flex gap-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search businesses…"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-white transition"
                style={{ backgroundColor: '#1e3a5f' }}
              >
                Go
              </button>
            </form>
          </div>

          {/* City Filter */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">City</p>
            <div className="flex flex-col gap-1">
              {CITIES.map((c) => (
                <Link
                  key={c}
                  href={filterUrl(c, category)}
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
                  href={filterUrl(city, key)}
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

          {/* Active filter chips — mobile + desktop */}
          {(city !== 'All Cities' || category !== 'All' || query) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {city !== 'All Cities' && (
                <Link
                  href={filterUrl('All Cities', category)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                >
                  📍 {city} <span className="ml-0.5 opacity-60">✕</span>
                </Link>
              )}
              {category !== 'All' && (
                <Link
                  href={filterUrl(city, 'All')}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                >
                  {CATEGORIES.find(c => c.key === category)?.emoji ?? '📂'} {category} <span className="ml-0.5 opacity-60">✕</span>
                </Link>
              )}
              {query && (
                <Link
                  href={filterUrl(city, category)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                >
                  🔍 &ldquo;{query}&rdquo; <span className="ml-0.5 opacity-60">✕</span>
                </Link>
              )}
              <Link
                href="/directory"
                className="text-xs text-gray-400 hover:text-red-500 transition px-1 py-1"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? (
                <span className="text-gray-400">Loading…</span>
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-gray-900">{businesses.length}</span>
                  {' '}of{' '}
                  <span className="font-semibold text-gray-900">{total}</span>
                  {' '}businesses
                </>
              )}
            </p>
            <Link
              href="/submit-business"
              className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all"
              style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
            >
              + Submit a Business
            </Link>
          </div>

          {/* Business list */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 animate-pulse">
                  <div className="shrink-0 w-20 h-20 rounded-lg bg-gray-100" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium text-gray-700">No businesses found</p>
              <p className="text-sm mt-1 mb-4">Try adjusting your filters or search term</p>
              {(city !== 'All Cities' || category !== 'All' || query) && (
                <Link
                  href="/directory"
                  className="inline-block text-sm font-semibold text-blue-600 hover:underline"
                >
                  ✕ Clear all filters
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {businesses.map((biz) => (
                  <BusinessCard key={biz.id} biz={biz} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="text-sm font-bold px-8 py-3 rounded-xl transition hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
                  >
                    {loadingMore ? 'Loading…' : `Load More (${total - businesses.length} remaining)`}
                  </button>
                </div>
              )}

              {/* All loaded message */}
              {!hasMore && total > PAGE_SIZE && (
                <p className="mt-6 text-center text-sm text-gray-400">
                  ✅ All {total} businesses loaded
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
