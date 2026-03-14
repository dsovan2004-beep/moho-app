'use client'
export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

const ADMIN_EMAILS = ['dsovan2004@gmail.com', 'danyoeur1983@gmail.com']

const CITIES = [
  { name: 'Mountain House', slug: 'mountain-house', gradient: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)', emoji: '🏘️' },
  { name: 'Tracy',          slug: 'tracy',          gradient: 'linear-gradient(135deg,#14532d 0%,#15803d 100%)', emoji: '🌿' },
  { name: 'Lathrop',        slug: 'lathrop',        gradient: 'linear-gradient(135deg,#581c87 0%,#7e22ce 100%)', emoji: '🏗️' },
  { name: 'Manteca',        slug: 'manteca',        gradient: 'linear-gradient(135deg,#7c2d12 0%,#c2410c 100%)', emoji: '🌾' },
  { name: 'Brentwood',      slug: 'brentwood',      gradient: 'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)', emoji: '🌳' },
]

interface CityStats {
  city: string
  total: number
  verified: number
  unverified: number
  pendingQueue: number
  pct: number
  status: 'verified' | 'auditing' | 'pending'
}

export default function AuditDashboard() {
  const router = useRouter()
  const [checking,   setChecking]   = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [stats,      setStats]      = useState<CityStats[]>([])

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

  // ── Load stats ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authorized) return
    loadStats()
  }, [authorized])

  async function loadStats() {
    const supabase = getSupabaseClient()
    setLoading(true)

    const results: CityStats[] = []

    for (const city of CITIES) {
      // Total approved businesses
      const { count: total } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('city', city.name)
        .eq('status', 'approved')

      // Verified businesses (approved + verified=true)
      const { count: verified } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('city', city.name)
        .eq('status', 'approved')
        .eq('verified', true)

      // Pending queue (awaiting audit)
      const { count: pendingQueue } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('city', city.name)
        .eq('status', 'pending')

      const t = total ?? 0
      const v = verified ?? 0
      const p = pendingQueue ?? 0
      const pct = t > 0 ? Math.round((v / t) * 100) : 0

      let status: CityStats['status'] = 'pending'
      if (v >= 50 || (t > 0 && pct === 100)) status = 'verified'
      else if (v > 0) status = 'auditing'

      results.push({
        city: city.name,
        total: t,
        verified: v,
        unverified: t - v,
        pendingQueue: p,
        pct,
        status,
      })
    }

    setStats(results)
    setLoading(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Checking access…</div>
      </div>
    )
  }

  if (!authorized) return null

  const totalAll    = stats.reduce((s, c) => s + c.total, 0)
  const verifiedAll = stats.reduce((s, c) => s + c.verified, 0)
  const pctAll      = totalAll > 0 ? Math.round((verifiedAll / totalAll) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <h1 className="text-2xl font-bold text-gray-900">City Audit Dashboard</h1>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Density before expansion — verify businesses city by city
              </p>
            </div>
            <Link
              href="/admin"
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← Back to Admin
            </Link>
          </div>

          {/* Overall progress */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Platform-wide Verification</span>
              <span className="text-sm font-bold text-gray-900">{verifiedAll} / {totalAll} businesses ({pctAll}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${pctAll}%`,
                  background: pctAll === 100 ? '#16a34a' : pctAll > 50 ? '#2563eb' : '#f59e0b',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* City cards */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600" />
            <p className="mt-3 text-sm text-gray-500">Loading city stats…</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {CITIES.map((city, i) => {
              const s = stats.find((st) => st.city === city.name)
              if (!s) return null

              const statusBadge = {
                verified: { label: 'Verified',  bg: '#dcfce7', color: '#166534', border: '#86efac' },
                auditing: { label: 'Auditing',  bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
                pending:  { label: 'Pending',   bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' },
              }[s.status]

              return (
                <Link
                  key={city.name}
                  href={`/admin/audit/${city.slug}`}
                  className="block bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* City color bar */}
                    <div
                      className="w-2 flex-shrink-0"
                      style={{ background: city.gradient }}
                    />

                    <div className="flex-1 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{city.emoji}</span>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">{city.name}</h2>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{
                                  background: statusBadge.bg,
                                  color: statusBadge.color,
                                  border: `1px solid ${statusBadge.border}`,
                                }}
                              >
                                {statusBadge.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-gray-900">{s.total}</div>
                            <div className="text-xs text-gray-500">Live</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-600">{s.verified}</div>
                            <div className="text-xs text-gray-500">Verified</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-orange-500">{s.pendingQueue}</div>
                            <div className="text-xs text-gray-500">Pending</div>
                          </div>
                          <div className="text-center min-w-[48px]">
                            <div className="font-bold text-gray-900">{s.pct}%</div>
                            <div className="text-xs text-gray-500">Complete</div>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${s.pct}%`,
                            background: s.pct === 100 ? '#16a34a' : s.pct > 50 ? '#2563eb' : s.pct > 0 ? '#f59e0b' : '#e5e7eb',
                          }}
                        />
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center pr-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">City Status Rules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600"><strong>Verified</strong> — 50+ verified businesses or 100% complete</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-gray-600"><strong>Auditing</strong> — at least 1 verified business</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-gray-600"><strong>Pending</strong> — 0 verified businesses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
