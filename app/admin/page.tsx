'use client'
export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const ADMIN_EMAIL = 'dsovan2004@gmail.com'

interface PendingBusiness {
  id: string
  name: string
  category: string
  city: string
  address: string
  phone?: string
  website?: string
  contact_email?: string
  description: string
  hours?: string
  created_at: string
  status: string
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [businesses, setBusinesses] = useState<PendingBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email === ADMIN_EMAIL) {
        setAuthorized(true)
      } else {
        router.replace('/')
      }
      setChecking(false)
    })
  }, [router])

  // ── Load businesses by tab ──────────────────────────────────────────────────
  useEffect(() => {
    if (!authorized) return
    loadTab(tab)
    loadStats()
  }, [authorized, tab])

  async function loadTab(status: string) {
    setLoading(true)
    const { data } = await supabase
      .from('businesses')
      .select('id,name,category,city,address,phone,website,contact_email,description,hours,created_at,status')
      .eq('status', status)
      .order('created_at', { ascending: false })
    setBusinesses((data as PendingBusiness[]) || [])
    setLoading(false)
  }

  async function loadStats() {
    const statuses = ['pending', 'approved', 'rejected']
    const counts: Record<string, number> = {}
    for (const s of statuses) {
      const { count } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('status', s)
      counts[s] = count || 0
    }
    setStats({ pending: counts.pending, approved: counts.approved, rejected: counts.rejected })
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setActionId(id)
    const { error } = await supabase
      .from('businesses')
      .update({ status })
      .eq('id', id)
    if (!error) {
      setBusinesses((prev) => prev.filter((b) => b.id !== id))
      setStats((s) => ({
        ...s,
        [tab]: s[tab] - 1,
        [status]: s[status] + 1,
      }))
      showToast(status === 'approved' ? '✅ Approved!' : '🗑️ Rejected', !error)
    } else {
      showToast('Error — try again', false)
    }
    setActionId(null)
  }

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2500)
  }

  // ── Loading / auth states ───────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!authorized) return null

  const TAB_COLORS: Record<string, string> = {
    pending:  '#f59e0b',
    approved: '#16a34a',
    rejected: '#dc2626',
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: toast.ok ? '#16a34a' : '#dc2626' }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-black tracking-tight" style={{ color: '#1e3a5f' }}>
              MoHo<span style={{ color: '#f59e0b' }}>Local</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-500">Admin Panel</span>
          </div>
          <Link
            href="/directory"
            className="text-sm text-gray-500 hover:text-gray-800 transition"
          >
            ← Back to site
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(['pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className="bg-white rounded-2xl border p-5 text-left transition-all hover:shadow-md"
              style={{ borderColor: tab === s ? TAB_COLORS[s] : '#e5e7eb', borderWidth: tab === s ? 2 : 1 }}
            >
              <div className="text-3xl font-black" style={{ color: TAB_COLORS[s] }}>
                {stats[s]}
              </div>
              <div className="text-sm font-medium text-gray-500 capitalize mt-1">{s}</div>
            </button>
          ))}
        </div>

        {/* Tab label */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 capitalize">{tab} Listings</h2>
          <button
            onClick={() => { loadTab(tab); loadStats() }}
            className="text-xs text-gray-400 hover:text-gray-600 transition flex items-center gap-1"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Business list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3">{tab === 'pending' ? '🎉' : tab === 'approved' ? '✅' : '🗑️'}</div>
            <p className="text-gray-500 font-medium">
              {tab === 'pending' ? 'No pending submissions — all caught up!' : `No ${tab} listings`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900 text-base">{biz.name}</h3>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#f59e0b20', color: '#b45309' }}
                      >
                        {biz.category}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#1e3a5f15', color: '#1e3a5f' }}
                      >
                        {biz.city}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{biz.description}</p>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      {biz.address && <span>📍 {biz.address}</span>}
                      {biz.phone && <span>📞 {biz.phone}</span>}
                      {biz.website && (
                        <a
                          href={biz.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          🔗 {biz.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                      {biz.contact_email && <span>✉️ {biz.contact_email}</span>}
                      {biz.hours && <span>🕐 {biz.hours}</span>}
                      <span>🕒 Submitted {timeAgo(biz.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {tab === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => updateStatus(biz.id, 'approved')}
                        disabled={actionId === biz.id}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
                        style={{ backgroundColor: '#16a34a' }}
                      >
                        {actionId === biz.id ? '…' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => updateStatus(biz.id, 'rejected')}
                        disabled={actionId === biz.id}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
                        style={{ backgroundColor: '#dc2626' }}
                      >
                        {actionId === biz.id ? '…' : '✕ Reject'}
                      </button>
                    </div>
                  )}

                  {tab === 'approved' && (
                    <button
                      onClick={() => updateStatus(biz.id, 'rejected')}
                      disabled={actionId === biz.id}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50 shrink-0"
                    >
                      Reject
                    </button>
                  )}

                  {tab === 'rejected' && (
                    <button
                      onClick={() => updateStatus(biz.id, 'approved')}
                      disabled={actionId === biz.id}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border border-green-200 text-green-600 hover:bg-green-50 transition disabled:opacity-50 shrink-0"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
