'use client'
export const runtime = 'edge'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

const ADMIN_EMAILS = ['dsovan2004@gmail.com', 'danyoeur1983@gmail.com']

const CITY_MAP: Record<string, { name: string; gradient: string; emoji: string }> = {
  'mountain-house': { name: 'Mountain House', gradient: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)', emoji: '🏘️' },
  'tracy':          { name: 'Tracy',          gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)', emoji: '🌿' },
  'lathrop':        { name: 'Lathrop',        gradient: 'linear-gradient(135deg,#581c87 0%,#7e22ce 100%)', emoji: '🏗️' },
  'manteca':        { name: 'Manteca',        gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)', emoji: '🌾' },
  'brentwood':      { name: 'Brentwood',      gradient: 'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)', emoji: '🌳' },
}

interface AuditBusiness {
  id: string
  name: string
  address: string
  phone: string | null
  website: string | null
  category: string
  verified: boolean
  google_place_id: string | null
  image_url: string | null
  status: string
}

type FilterMode = 'all' | 'verified' | 'unverified'
type SortMode   = 'name' | 'category' | 'verified'

function googleMapsLink(name: string, city: string): string {
  const q = encodeURIComponent(`${name}, ${city}, CA`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

export default function CityAuditPage() {
  const router = useRouter()
  const params = useParams()
  const citySlug = params.city as string
  const cityInfo = CITY_MAP[citySlug]

  const [checking,    setChecking]    = useState(true)
  const [authorized,  setAuthorized]  = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [businesses,  setBusinesses]  = useState<AuditBusiness[]>([])
  const [filter,      setFilter]      = useState<FilterMode>('all')
  const [sort,        setSort]        = useState<SortMode>('name')
  const [search,      setSearch]      = useState('')
  const [togglingId,  setTogglingId]  = useState<string | null>(null)
  const [toast,       setToast]       = useState<{ msg: string; ok: boolean } | null>(null)
  const [selected,    setSelected]    = useState<Set<string>>(new Set())

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? ''
      if (email && ADMIN_EMAILS.includes(email)) {
        setAuthorized(true)
      } else {
        router.replace('/')
      }
      setChecking(false)
    })
  }, [router])

  // ── Load businesses ───────────────────────────────────────────────────────
  const loadBusinesses = useCallback(async () => {
    if (!cityInfo) return
    const supabase = getSupabaseClient()
    setLoading(true)
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('city', cityInfo.name)
      .in('status', ['approved', 'pending'])
      .order('name', { ascending: true })
    setBusinesses((data as AuditBusiness[]) ?? [])
    setLoading(false)
  }, [cityInfo])

  useEffect(() => {
    if (authorized) loadBusinesses()
  }, [authorized, loadBusinesses])

  // ── Toggle single verified ────────────────────────────────────────────────
  async function toggleVerified(id: string, currentlyVerified: boolean) {
    const supabase = getSupabaseClient()
    setTogglingId(id)
    const newVal = !currentlyVerified
    const { error } = await supabase
      .from('businesses')
      .update({ verified: newVal })
      .eq('id', id)
    if (!error) {
      setBusinesses((prev) =>
        prev.map((b) => (b.id === id ? { ...b, verified: newVal } : b))
      )
      showToast(newVal ? '✅ Marked verified' : '⚠️ Marked unverified', true)
    } else {
      showToast('Error — try again', false)
    }
    setTogglingId(null)
  }

  // ── Bulk verify selected ──────────────────────────────────────────────────
  async function bulkVerify() {
    if (selected.size === 0) return
    const supabase = getSupabaseClient()
    setTogglingId('bulk')

    const ids = Array.from(selected)

    // Supabase .in() has a limit — batch in groups of 50
    let hasError = false
    for (let i = 0; i < ids.length; i += 50) {
      const batch = ids.slice(i, i + 50)
      const { error } = await supabase
        .from('businesses')
        .update({ verified: true })
        .in('id', batch)
      if (error) { hasError = true; break }
    }

    if (!hasError) {
      setBusinesses((prev) =>
        prev.map((b) => (ids.includes(b.id) ? { ...b, verified: true } : b))
      )
      showToast(`✅ ${ids.length} businesses verified!`, true)
      setSelected(new Set())
    } else {
      showToast('Error — some updates may have failed', false)
    }
    setTogglingId(null)
  }

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filtered = businesses
    .filter((b) => {
      if (filter === 'verified')   return b.verified
      if (filter === 'unverified') return !b.verified
      return true
    })
    .filter((b) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        b.name.toLowerCase().includes(q) ||
        (b.address ?? '').toLowerCase().includes(q) ||
        (b.category ?? '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sort === 'category') return (a.category ?? '').localeCompare(b.category ?? '')
      if (sort === 'verified') return (a.verified === b.verified ? 0 : a.verified ? -1 : 1)
      return a.name.localeCompare(b.name)
    })

  // ── Stats ─────────────────────────────────────────────────────────────────
  const total      = businesses.length
  const verified   = businesses.filter((b) => b.verified).length
  const pct        = total > 0 ? Math.round((verified / total) * 100) : 0
  const unverifiedInView = filtered.filter((b) => !b.verified)
  const allUnverifiedSelected = unverifiedInView.length > 0 && unverifiedInView.every((b) => selected.has(b.id))

  // ── Select all / deselect all (only unverified in current view) ───────────
  function toggleSelectAll() {
    if (allUnverifiedSelected) {
      setSelected(new Set())
    } else {
      const next = new Set(selected)
      for (const b of unverifiedInView) next.add(b.id)
      setSelected(next)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Checking access…</div>
      </div>
    )
  }

  if (!authorized || !cityInfo) return null

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: selected.size > 0 ? '80px' : '0' }}>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white"
          style={{ background: toast.ok ? '#16a34a' : '#dc2626' }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cityInfo.emoji}</span>
                <h1 className="text-2xl font-bold text-gray-900">{cityInfo.name} Audit</h1>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Verify each business exists on Google Maps with matching address
              </p>
            </div>
            <Link
              href="/admin/audit"
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← All Cities
            </Link>
          </div>

          {/* Progress bar */}
          <div className="mt-5 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{cityInfo.name} Audit Progress</span>
              <span className="text-sm font-bold text-gray-900">{verified} / {total} Verified ({pct}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3.5">
              <div
                className="h-3.5 rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: cityInfo.gradient,
                }}
              />
            </div>
            {verified >= 50 ? (
              <p className="mt-2 text-xs text-green-600 font-medium">🎉 This city meets the 50+ verified threshold for Active status</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">{Math.max(0, 50 - verified)} more verified businesses needed for Active status</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search businesses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Filter pills */}
          <div className="flex gap-1">
            {(['all', 'unverified', 'verified'] as FilterMode[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  filter === f
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f === 'all' ? `All (${total})` : f === 'verified' ? `Verified (${verified})` : `Unverified (${total - verified})`}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white focus:outline-none"
          >
            <option value="name">Sort: Name</option>
            <option value="category">Sort: Category</option>
            <option value="verified">Sort: Verified first</option>
          </select>

          {/* Select All */}
          {unverifiedInView.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
            >
              {allUnverifiedSelected ? `Deselect All (${unverifiedInView.length})` : `Select All Unverified (${unverifiedInView.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Business list */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600" />
            <p className="mt-3 text-sm text-gray-500">Loading businesses…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {search ? 'No matching businesses' : 'No businesses found for this city'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((biz) => (
              <div
                key={biz.id}
                className={`bg-white rounded-xl border transition-all ${
                  selected.has(biz.id)
                    ? 'border-blue-300 bg-blue-50/30'
                    : biz.verified
                      ? 'border-green-200'
                      : 'border-gray-200'
                } hover:shadow-sm`}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Checkbox — always visible for unverified */}
                  {!biz.verified ? (
                    <input
                      type="checkbox"
                      checked={selected.has(biz.id)}
                      onChange={(e) => {
                        const next = new Set(selected)
                        if (e.target.checked) next.add(biz.id)
                        else next.delete(biz.id)
                        setSelected(next)
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                    />
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Business info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{biz.name}</h3>
                      <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{biz.category}</span>
                      {biz.google_place_id && (
                        <span className="text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">📍 Place ID</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {biz.address && <span>{biz.address}</span>}
                      {biz.phone && <span>📞 {biz.phone}</span>}
                      {biz.website && (
                        <a
                          href={biz.website.startsWith('http') ? biz.website : `https://${biz.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          🌐 Website
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Google Maps link */}
                    <a
                      href={googleMapsLink(biz.name, cityInfo.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                      title="Open in Google Maps to verify"
                    >
                      🗺️ Maps
                    </a>

                    {/* MoHoLocal business page */}
                    <Link
                      href={`/business/${biz.id}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition"
                    >
                      View
                    </Link>

                    {/* Verify toggle */}
                    <button
                      onClick={() => toggleVerified(biz.id, biz.verified)}
                      disabled={togglingId === biz.id}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
                        biz.verified
                          ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      {togglingId === biz.id
                        ? '…'
                        : biz.verified
                          ? '✓ Verified'
                          : 'Mark Verified'
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats footer */}
        {!loading && (
          <div className="mt-6 text-center text-xs text-gray-400">
            Showing {filtered.length} of {total} businesses · {verified} verified · {total - verified} remaining
          </div>
        )}
      </div>

      {/* ── Sticky bulk action bar ──────────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <strong>{selected.size}</strong> business{selected.size > 1 ? 'es' : ''} selected
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelected(new Set())}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Clear Selection
              </button>
              <button
                onClick={bulkVerify}
                disabled={togglingId === 'bulk'}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
              >
                {togglingId === 'bulk' ? 'Verifying…' : `✓ Verify ${selected.size} Business${selected.size > 1 ? 'es' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
