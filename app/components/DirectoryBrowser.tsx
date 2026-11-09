'use client'

import ResidentOutcome from '@/app/components/ResidentOutcome'
import { PUBLIC_BUSINESS_COLUMNS } from '@/lib/supabase'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getSupabaseClient, type Business } from '@/lib/supabase'
import { CITIES as CITY_LIST, CITY_BY_NAME, RELAUNCH_CITY_NAMES } from '@/lib/cities'
import Link from 'next/link'
import ListingEvidence from '@/app/components/ListingEvidence'
import { CHECK_COLUMNS } from '@/lib/listing-evidence'
import { serviceForCategory, serviceSearchTag } from '@/lib/services'
import { directoryHref } from '@/lib/directory-filters'
import { businessHref } from '@/lib/business-discovery'
import BusinessContactActions from '@/app/components/BusinessContactActions'
import DirectoryServices from '@/app/components/DirectoryServices'
import ShortlistShare from '@/app/components/ShortlistShare'
import DirectoryEmptyState from '@/app/components/DirectoryEmptyState'

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

// Relaunch choices; legacy explicit city URLs remain readable.
const CITIES = ['All Cities', ...RELAUNCH_CITY_NAMES]

// Sort options (only visible when no search query — relevance is automatic when searching)
const SORT_OPTIONS = [
  { value: 'rating', label: '⭐ Top Rated' },
  { value: 'name',   label: '🔤 A–Z'       },
  { value: 'newest', label: '🆕 Newest'    },
]

// ── Client-side relevance sort ────────────────────────────────────────────────
// Tier 0: name starts with query       (strongest signal)
// Tier 1: name contains query          (name match)
// Tier 2: category contains query      (category match)
// Tier 3: everything else (description/city/address match)
// Within each tier: secondary sort by rating DESC
function sortByRelevance(bizs: Business[], q: string): Business[] {
  const lower = q.toLowerCase()
  return [...bizs].sort((a, b) => {
    const tier = (biz: Business): number => {
      const name = biz.name.toLowerCase()
      if (name.startsWith(lower))                    return 0
      if (name.includes(lower))                      return 1
      if (biz.category.toLowerCase().includes(lower)) return 2
      return 3
    }
    const tDiff = tier(a) - tier(b)
    if (tDiff !== 0) return tDiff
    return (b.rating ?? 0) - (a.rating ?? 0)
  })
}

// ── Star rating ───────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating?: number | null }) {
  if (rating == null || rating <= 0) return null
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

// ── Business card ─────────────────────────────────────────────────────────────
function BusinessCard({ biz, activeCategory, city, service, returnTo }: { biz: Business; activeCategory: string; city: string; service?: string; returnTo: string }) {
  // Category chip: amber highlight when the active filter matches this business's category
  const catChip = activeCategory !== 'All' && biz.category === activeCategory
    ? 'bg-amber-50 text-amber-800 border border-amber-200'
    : 'bg-gray-100 text-gray-700'

  return (
    <div className="group flex gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
      {/* Thumbnail — links to detail page */}
      <Link href={businessHref(biz.id, city, service, returnTo)} className="hidden sm:flex shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-blue-50 items-center justify-center">
        {biz.image_url ? (
          <img src={biz.image_url} alt={biz.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-3xl">{getCategoryEmoji(biz.category)}</span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        {/* Resident name first; owner actions follow contact details */}
        <div className="flex items-start justify-between gap-2">
          <Link href={businessHref(biz.id, city, service, returnTo)} className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition leading-snug break-words">
              {biz.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Category chip — hidden on xs to prevent squeezing the name; visible sm+ */}
            <span className={`hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full ${catChip}`}>
              {biz.category}
            </span>
          </div>
        </div>

        {(biz.review_count ?? 0) > 0 && <StarRating rating={biz.rating} />}

        {biz.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{biz.description}</p>
        )}

        {/* Contact row — phone + website clickable directly from list */}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${CITY_BY_NAME[biz.city]?.chip ?? 'bg-gray-100 text-gray-600'}`}>
            📍 {biz.city === 'Service area only' ? 'Office location not listed' : `Located in ${biz.city}`}
          </span>
          {biz.address && (
            <span className="text-xs text-gray-400 truncate max-w-[160px]">{biz.address}</span>
          )}
        </div>

        <ListingEvidence check={biz.listing_checks} />

        <BusinessContactActions phone={biz.phone} website={biz.website} />
        <div className="mt-2 flex flex-wrap gap-x-4 border-t border-slate-100 pt-1">
          <Link href={`/report-listing/${biz.id}?${new URLSearchParams({city})}`} aria-label={`Suggest a correction for ${biz.name}`} className="inline-flex min-h-11 items-center text-xs font-semibold text-slate-600 underline underline-offset-4 hover:text-[#19352d] focus-visible:ring-2 focus-visible:ring-[#19352d]">Suggest a correction</Link>
          {!biz.claimed && <Link href={`/claim-listing/${biz.id}`} aria-label={`Claim listing for ${biz.name}`} className="inline-flex min-h-11 items-center text-xs font-semibold text-slate-600 underline underline-offset-4 hover:text-[#19352d] focus-visible:ring-2 focus-visible:ring-[#19352d]">Own this business? Claim listing</Link>}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DirectoryBrowser({initialCity,initialCategory,initialService}: {initialCity?:string;initialCategory?:string;initialService?:string}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const requestedCity = initialCity ?? searchParams.get('city') ?? 'All Cities'
  const city = requestedCity === 'All Cities' || CITY_LIST.some(c => c.name === requestedCity) ? requestedCity : 'All Cities'
  const category = initialCategory ?? searchParams.get('category') ?? 'All'
  const service = serviceForCategory(initialService ?? searchParams.get('service'), category)
  const query    = searchParams.get('q')        ?? ''
  const sortBy   = searchParams.get('sort')     ?? 'name'

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loadError, setLoadError] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(false)
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchInput, setSearchInput] = useState(query)
  const fetchSequence = useRef(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Refetch whenever any filter/sort/query changes (URL-driven)
  useEffect(() => {
    setOffset(0)
    setBusinesses([])
    fetchPage(0, true)
    setSearchInput(query)
    return () => { fetchSequence.current++; if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, category, query, sortBy, service?.key])

  // Instant debounced search — push to URL 300ms after user stops typing
  function handleSearchInput(value: string) {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      params.set('city', city)
      params.set('category', category)
      if (service) params.set('service',service.key)
      if (value.trim()) {
        params.set('q', value.trim())
      } else {
        params.set('sort', sortBy)
      }
      router.push(`/directory?${params.toString()}`)
    }, 300)
  }

  async function fetchPage(from: number, reset = false) {
    const requestId = ++fetchSequence.current
    const supabase = getSupabaseClient()
    if (reset) { setLoading(true); setLoadError(false); setLoadMoreError(false) }
    else { setLoadingMore(true) }
    function failPage() {
      if (reset) setLoadError(true)
      else setLoadMoreError(true)
      setLoading(false)
      setLoadingMore(false)
    }

    const to = from + PAGE_SIZE - 1

    let req = supabase
      .from('businesses')
      .select(`${PUBLIC_BUSINESS_COLUMNS},listing_checks(${CHECK_COLUMNS})`, { count: 'exact' })
      .eq('status', 'approved')
      .eq('verified', true)
      .range(from, to)

    if (city !== 'All Cities') {
      const { data: checks, error: checkError } = await supabase.from('listing_checks').select('business_id').contains('service_areas', [city])
      if (requestId !== fetchSequence.current) return
      if (checkError) { failPage(); return }
      const ids = (checks ?? []).map(row => row.business_id).filter(id => /^[0-9a-f-]{36}$/i.test(id))
      req = ids.length ? req.or(`city.eq."${city}",id.in.(${ids.join(',')})`) : req.eq('city', city)
    }
    if (category !== 'All')    req = req.eq('category', category)
    if (service) {
      let checked = supabase.from('listing_checks').select('business_id').contains('service_tags', [service.tag])
      if (city !== 'All Cities') checked = checked.contains('service_areas', [city])
      const {data: matching, error: matchError} = await checked
      if (requestId !== fetchSequence.current) return
      if (matchError) { failPage(); return }
      const ids = (matching ?? []).map(row => row.business_id)
      req = req.in('id',ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
    }

    const safeQuery = query.replace(/[^\p{L}\p{N}\s'-]/gu, ' ').trim().slice(0,100)
    if (safeQuery) {
      // Known job terms also match dated service evidence, retaining every existing filter.
      const tag = serviceSearchTag(safeQuery)
      let evidenceIds:string[]=[]
      if (tag) {
        let evidence = supabase.from('listing_checks').select('business_id').contains('service_tags',[tag])
        if (city !== 'All Cities') evidence=evidence.contains('service_areas',[city])
        const {data:matches,error:searchError}=await evidence
        if (requestId !== fetchSequence.current) return
        if (searchError) { failPage(); return }
        evidenceIds=(matches??[]).map(row=>row.business_id).filter(id=>/^[0-9a-f-]{36}$/i.test(id))
      }
      const textFields=`name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,category.ilike.%${safeQuery}%,city.ilike.%${safeQuery}%,address.ilike.%${safeQuery}%`
      req=req.or(textFields+(evidenceIds.length?`,id.in.(${evidenceIds.join(',')})`:''))
      // Fetch alphabetically; relevance re-sort happens client-side below
      req = req.order('name', { ascending: true })
    } else {
      // No search: respect the user's sort selection
      if (sortBy === 'name') {
        req = req.order('name', { ascending: true })
      } else if (sortBy === 'newest') {
        req = req.order('created_at', { ascending: false })
      } else {
        // Default — Top Rated: rating DESC (nulls last), then name ASC
        req = req.order('rating', { ascending: false, nullsFirst: false })
                 .order('name',   { ascending: true })
      }
    }

    const { data, count, error } = await req
    if (requestId !== fetchSequence.current) return
    if (error) { failPage(); return }
    setLoadError(false)
    setLoadMoreError(false)
    let newBizs = (data ?? []) as Business[]

    // Client-side relevance re-sort when search query is active
    if (query && newBizs.length > 0) {
      newBizs = sortByRelevance(newBizs, query)
    }

    setBusinesses(prev => reset ? newBizs : [...prev, ...newBizs])
    setTotal(count ?? 0)
    setOffset(from + newBizs.length)
    setLoading(false)
    setLoadingMore(false)
  }

  function handleLoadMore() { fetchPage(offset) }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const params = new URLSearchParams()
    params.set('city', city)
    params.set('category', category)
      if (service) params.set('service',service.key)
    if (searchInput.trim()) {
      params.set('q', searchInput.trim())
    } else {
      params.set('sort', sortBy)
    }
    router.push(`/directory?${params.toString()}`)
  }

  function filterUrl(newCity: string, newCat: string) {
    return directoryHref({city,category,service:service?.key,query,sort:sortBy}, {city:newCity,category:newCat})
  }

  function sortUrl(newSort: string) {
    return directoryHref({city,category,service:service?.key,query,sort:sortBy}, {sort:newSort})
  }

  const filters = { city, category, service: service?.key, query, sort: sortBy }
  const hasMore = businesses.length < total

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Find your local help</h1>
        <p className="text-gray-500 mt-1">Find local help in Mountain House, Tracy, Lathrop and Manteca. Confirm the exact service area with each business.</p>
      </div>

      {loadError && <p role="alert" className="mb-5 bg-amber-50 border border-amber-300 p-4 rounded-xl">We couldn't load these listings. <button onClick={() => fetchPage(0, true)} className="inline-flex min-h-11 items-center font-bold underline">Try again</button></p>}
      {/* ── Mobile: search + filter chips ── */}
      <div className="lg:hidden mb-4 space-y-3">
        {/* Mobile search bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            aria-label="Search businesses"
            placeholder="Search by name, category, or city…"
            className="w-full border border-gray-200 rounded-xl pl-4 pr-14 min-h-11 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-0 top-1/2 min-h-11 min-w-11 inline-flex items-center justify-center -translate-y-1/2 text-gray-400 hover:text-blue-700 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15z" />
            </svg>
          </button>
        </form>

        {/* City chips — relative wrapper + right fade signals horizontal scroll */}
        <div className="relative">
          <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex gap-2 pb-1 min-w-max pr-6">
              {CITIES.map((c) => (
                <Link
                  key={c}
                  href={filterUrl(c, category)}
                  aria-current={(city === c) ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition ${
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
          <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
            style={{ background: 'linear-gradient(to right, transparent, white)' }} />
        </div>

        {/* Category chips — relative wrapper + right fade signals horizontal scroll */}
        <div className="relative">
          <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex gap-2 pb-1 min-w-max pr-6">
              {CATEGORIES.map(({ key, emoji }) => (
                <Link
                  key={key}
                  href={filterUrl(city, key)}
                  aria-current={category === key ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition ${
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
          <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
            style={{ background: 'linear-gradient(to right, transparent, white)' }} />
        </div>
      </div>

      <div className="lg:hidden mb-4 flex flex-wrap items-center gap-2">
        {query ? <p className="text-sm text-slate-600">Sorted by search relevance</p> : <>
          <label htmlFor="mobile-directory-sort" className="text-sm font-semibold text-slate-700">Sort results</label>
          <select id="mobile-directory-sort" value={SORT_OPTIONS.some(option=>option.value===sortBy) ? sortBy : 'rating'} onChange={event=>router.push(sortUrl(event.target.value))} className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 focus-visible:ring-2 focus-visible:ring-[#19352d]">
            {SORT_OPTIONS.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </>}
      </div>

      <DirectoryServices city={city} selected={service?.key} />
      {service && <div className="bg-[#f0f4ec] border border-[#dce5d5] p-4 rounded-xl mb-5"><p className="font-semibold">{service.label} · website-checked shortlist</p><p className="text-sm text-slate-600 mt-1">Dated website checks for this service and city. Confirm your job and availability directly; this is not a quality endorsement.</p><Link className="inline-flex min-h-11 items-center mt-2 text-sm underline" href={`/directory?${new URLSearchParams({city,category:service.category})}`}>Browse all {service.category.toLowerCase()} listings →</Link></div>}

      <ShortlistShare city={city} service={service?.key} />

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar Filters (desktop) ── */}
        <aside className="hidden lg:block lg:w-56 shrink-0 space-y-4">

          {/* Search */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1 block">
              Search
            </label>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                aria-label="Search businesses"
                placeholder="Search by name, category, or city…"
                className="w-full border border-gray-200 rounded-lg pl-3 pr-14 min-h-11 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-0 top-1/2 min-h-11 min-w-11 inline-flex items-center justify-center -translate-y-1/2 text-gray-400 hover:text-blue-700 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Sort — hidden when query is active (relevance sort is automatic) */}
          {!query && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Sort By</p>
              <div className="flex flex-col gap-1">
                {SORT_OPTIONS.map(({ value, label }) => (
                  <Link
                    key={value}
                    href={sortUrl(value)}
                    className={`inline-flex min-h-11 items-center text-sm px-3 py-1.5 rounded-lg transition font-medium ${
                      sortBy === value
                        ? 'bg-blue-700 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* City Filter */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">City</p>
            <div className="flex flex-col gap-1">
              {CITIES.map((c) => (
                <Link
                  key={c}
                  href={filterUrl(c, category)}
                  className={`inline-flex min-h-11 items-center text-sm px-3 py-1.5 rounded-lg transition font-medium ${
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
                  className={`inline-flex min-h-11 items-center text-sm px-3 py-1.5 rounded-lg transition font-medium ${
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

        {/* ── Listings ── */}
        <div className="flex-1 min-w-0">

          {/* Active filter chips */}
          {(city !== 'All Cities' || category !== 'All' || service || query) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {city !== 'All Cities' && (
                <Link
                  aria-label={`Remove city filter: ${city}`}
                  href={filterUrl('All Cities', category)}
                  className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                >
                  📍 {city} <span className="ml-0.5 opacity-60">✕</span>
                </Link>
              )}
              {category !== 'All' && (
                <Link
                  aria-label={`Remove category filter: ${category}`}
                  href={filterUrl(city, 'All')}
                  className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                >
                  {CATEGORIES.find(c => c.key === category)?.emoji ?? '📂'} {category} <span className="ml-0.5 opacity-60">✕</span>
                </Link>
              )}
              {service && <Link href={directoryHref(filters, {service:null})} aria-label={`Remove service filter: ${service.label}`} className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-200">{service.label}<span aria-hidden="true"> ✕</span></Link>}
              {query && (
                <Link
                  aria-label={`Remove search term: ${query}`}
                  href={directoryHref(filters, {query:null})}
                  className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                >
                  🔍 &ldquo;{query}&rdquo; <span className="ml-0.5 opacity-60">✕</span>
                </Link>
              )}
              <Link
                href="/directory"
                className="inline-flex min-h-11 items-center text-xs text-slate-600 hover:text-red-700 transition px-2 py-1"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Header row — stacks on mobile, side-by-side on sm+ */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <p role="status" aria-live="polite" className="text-sm text-gray-500">
              {loadError ? <span>Results unavailable</span> : loading ? (
                <span className="text-gray-400">Loading…</span>
              ) : query ? (
                <>
                  <span className="font-semibold text-gray-900">{total}</span>
                  {' '}result{total !== 1 ? 's' : ''} for{' '}
                  <span className="font-semibold text-gray-900">&ldquo;{query}&rdquo;</span>
                </>
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
            <div className="flex gap-2 shrink-0">
              <Link
                href="/suggest-business"
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-all"
              >
                💡 Suggest
              </Link>
              <Link
                href="/submit-business"
                className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap"
                style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
              >
                + <span className="hidden sm:inline">Submit a Business</span><span className="sm:hidden">Add Listing</span>
              </Link>
            </div>
          </div>

          {/* Relevance sort indicator */}
          {query && !loading && businesses.length > 0 && (
            <p className="text-xs text-gray-400 mb-3">
              Matching listings — confirm your exact job and service address directly
            </p>
          )}

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
          ) : loadError ? null : businesses.length === 0 ? (
            <DirectoryEmptyState filters={filters} />
          ) : (
            <>
              <div className="space-y-3">
                {businesses.map((biz) => (
                  <BusinessCard key={biz.id} biz={biz} activeCategory={category} city={city} service={service?.key} returnTo={directoryHref(filters)} />
                ))}
              </div>

              {loadMoreError && <div role="alert" aria-busy={loadingMore} className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-slate-800">
                <p className="font-semibold">Couldn’t load more listings. Your current results are still here.</p>
                <button type="button" onClick={handleLoadMore} disabled={loadingMore} className="mt-2 inline-flex min-h-11 items-center rounded-xl border border-slate-400 bg-white px-4 py-2 font-bold focus-visible:ring-2 focus-visible:ring-[#19352d]">{loadingMore ? 'Trying…' : 'Try loading more'}</button>
              </div>}

              {/* Load More */}
              {hasMore && !loadMoreError && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    aria-busy={loadingMore}
                    className="text-sm font-bold px-8 py-3 rounded-xl transition hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
                  >
                    {loadingMore ? 'Loading…' : `Load More (${total - businesses.length} remaining)`}
                  </button>
                </div>
              )}

              {/* All loaded */}
              {!hasMore && total > PAGE_SIZE && (
                <p className="mt-6 text-center text-sm text-gray-400">
                  ✅ All {total} businesses loaded
                </p>
              )}
            </>
          )}
        </div>
      </div>
      <a href="#resident-outcome" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[#19352d] underline">Already used the directory? Share an optional outcome</a>
      <ResidentOutcome city={city} />
    </div>
  )
}
