'use client'
export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

const ADMIN_EMAILS = ['dsovan2004@gmail.com', 'danyoeur1983@gmail.com']
const WORKER_URL   = 'https://moho-ingestion.dsovan2004.workers.dev'

// ── Types ─────────────────────────────────────────────────────────────────────

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

interface CommunitySubmission {
  id: string
  title: string
  description: string
  city: string
  submission_type: string
  event_date?: string
  image_url?: string
  contact_url?: string
  source: string
  needs_review: boolean
  submitted_at: string
  created_at: string
}

type BusinessTab   = 'pending' | 'approved' | 'rejected'
type ActiveSection = BusinessTab | 'submissions'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const TYPE_LABELS: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  event:           { label: 'Event',           emoji: '📅', color: '#1d4ed8', bg: '#dbeafe' },
  lost_pet:        { label: 'Lost Pet',         emoji: '🐾', color: '#92400e', bg: '#fef3c7' },
  business_update: { label: 'Business Update',  emoji: '🏪', color: '#065f46', bg: '#d1fae5' },
  community_tip:   { label: 'Community Tip',    emoji: '💬', color: '#5b21b6', bg: '#ede9fe' },
  garage_sale:     { label: 'Garage Sale',      emoji: '🏷️', color: '#9a3412', bg: '#fee2e2' },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const [checking,    setChecking]    = useState(true)
  const [authorized,  setAuthorized]  = useState(false)
  const [accessToken, setAccessToken] = useState('')

  // Business state
  const [businesses,  setBusinesses]  = useState<PendingBusiness[]>([])
  const [bizLoading,  setBizLoading]  = useState(true)
  const [bizActionId, setBizActionId] = useState<string | null>(null)
  const [bizStats,    setBizStats]    = useState({ pending: 0, approved: 0, rejected: 0 })

  // Submissions state
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([])
  const [subLoading,  setSubLoading]  = useState(false)
  const [subActionId, setSubActionId] = useState<string | null>(null)
  const [subCount,    setSubCount]    = useState(0)

  const [activeSection, setActiveSection] = useState<ActiveSection>('pending')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // ── Auth ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? ''
      const token = data.session?.access_token ?? ''
      if (email && ADMIN_EMAILS.includes(email)) {
        setAuthorized(true)
        setAccessToken(token)
      } else {
        router.replace('/')
      }
      setChecking(false)
    })
  }, [router])

  // ── Load on auth + section change ─────────────────────────────────────────
  useEffect(() => {
    if (!authorized) return
    loadBizStats()
    loadSubCount()
    if (activeSection === 'submissions') {
      loadSubmissions()
    } else {
      loadBizTab(activeSection as BusinessTab)
    }
  }, [authorized, activeSection])

  // ── Business helpers ───────────────────────────────────────────────────────
  async function loadBizTab(status: string) {
    const supabase = getSupabaseClient()
    setBizLoading(true)
    const { data } = await supabase
      .from('businesses')
      .select('id,name,category,city,address,phone,website,contact_email,description,hours,created_at,status')
      .eq('status', status)
      .order('created_at', { ascending: false })
    setBusinesses((data as PendingBusiness[]) || [])
    setBizLoading(false)
  }

  async function loadBizStats() {
    const supabase = getSupabaseClient()
    const statuses = ['pending', 'approved', 'rejected']
    const counts: Record<string, number> = {}
    for (const s of statuses) {
      const { count } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true })
        .eq('status', s)
      counts[s] = count || 0
    }
    setBizStats({ pending: counts.pending, approved: counts.approved, rejected: counts.rejected })
  }

  async function updateBizStatus(id: string, status: 'approved' | 'rejected') {
    const supabase = getSupabaseClient()
    setBizActionId(id)
    const { error } = await supabase.from('businesses').update({ status }).eq('id', id)
    if (!error) {
      setBusinesses((prev) => prev.filter((b) => b.id !== id))
      setBizStats((s) => ({
        ...s,
        [activeSection as BusinessTab]: s[activeSection as BusinessTab] - 1,
        [status]: s[status] + 1,
      }))
      showToast(status === 'approved' ? '✅ Approved!' : '🗑️ Rejected', true)
    } else {
      showToast('Error — try again', false)
    }
    setBizActionId(null)
  }

  // ── Submission helpers ─────────────────────────────────────────────────────
  async function loadSubCount() {
    const supabase = getSupabaseClient()
    const { count } = await supabase
      .from('community_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('needs_review', true)
    setSubCount(count || 0)
  }

  async function loadSubmissions() {
    const supabase = getSupabaseClient()
    setSubLoading(true)
    const { data } = await supabase
      .from('community_submissions')
      .select('*')
      .eq('needs_review', true)
      .order('created_at', { ascending: false })
    setSubmissions((data as CommunitySubmission[]) || [])
    setSubLoading(false)
  }

  async function handleSubAction(id: string, action: 'approve' | 'reject') {
    setSubActionId(id)
    try {
      const res = await fetch(`${WORKER_URL}/promote-submission`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'X-Admin-Token': accessToken,
        },
        body: JSON.stringify({ submission_id: id, action }),
      })
      const data = await res.json() as { status?: string; promoted_table?: string; note?: string }
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id))
        setSubCount((c) => Math.max(0, c - 1))
        if (action === 'approve') {
          const dest = data.promoted_table ? ` → ${data.promoted_table}` : ''
          showToast(`✅ Promoted${dest}`, true)
        } else {
          showToast('🗑️ Submission dismissed', true)
        }
      } else {
        showToast('Error — try again', false)
      }
    } catch {
      showToast('Network error — try again', false)
    }
    setSubActionId(null)
  }

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }

  // ── Guard states ───────────────────────────────────────────────────────────
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!authorized) return null

  const TAB_COLORS: Record<string, string> = {
    pending:     '#f59e0b',
    approved:    '#16a34a',
    rejected:    '#dc2626',
    submissions: '#7c3aed',
  }

  const isSubmissionsTab = activeSection === 'submissions'
  const isBizTab         = !isSubmissionsTab

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white"
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
          <Link href="/directory" className="text-sm text-gray-500 hover:text-gray-800 transition">
            ← Back to site
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Section switcher pills */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveSection('pending')}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition"
            style={{
              backgroundColor: isBizTab ? '#1e3a5f' : '#f1f5f9',
              color:           isBizTab ? '#fff'     : '#64748b',
            }}
          >
            Businesses
          </button>
          <button
            onClick={() => setActiveSection('submissions')}
            className="text-xs font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1.5"
            style={{
              backgroundColor: isSubmissionsTab ? '#7c3aed' : '#f1f5f9',
              color:           isSubmissionsTab ? '#fff'     : '#64748b',
            }}
          >
            Community Submissions
            {subCount > 0 && (
              <span
                className="text-xs font-black px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: isSubmissionsTab ? 'rgba(255,255,255,0.3)' : '#7c3aed', color: '#fff', minWidth: 18, textAlign: 'center' }}
              >
                {subCount}
              </span>
            )}
          </button>
        </div>

        {/* ═══ BUSINESSES ═══════════════════════════════════════════════════════ */}
        {isBizTab && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {(['pending', 'approved', 'rejected'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSection(s)}
                  className="bg-white rounded-2xl border p-5 text-left transition-all hover:shadow-md"
                  style={{ borderColor: activeSection === s ? TAB_COLORS[s] : '#e5e7eb', borderWidth: activeSection === s ? 2 : 1 }}
                >
                  <div className="text-3xl font-black" style={{ color: TAB_COLORS[s] }}>
                    {bizStats[s]}
                  </div>
                  <div className="text-sm font-medium text-gray-500 capitalize mt-1">{s}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 capitalize">{activeSection} Listings</h2>
              <button onClick={() => { loadBizTab(activeSection as BusinessTab); loadBizStats() }} className="text-xs text-gray-400 hover:text-gray-600 transition">
                ↻ Refresh
              </button>
            </div>

            {bizLoading ? (
              <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : businesses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-4xl mb-3">{activeSection === 'pending' ? '🎉' : activeSection === 'approved' ? '✅' : '🗑️'}</div>
                <p className="text-gray-500 font-medium">
                  {activeSection === 'pending' ? 'No pending submissions — all caught up!' : `No ${activeSection} listings`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {businesses.map((biz) => (
                  <div key={biz.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-gray-900 text-base">{biz.name}</h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f59e0b20', color: '#b45309' }}>{biz.category}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1e3a5f15', color: '#1e3a5f' }}>{biz.city}</span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{biz.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                          {biz.address       && <span>📍 {biz.address}</span>}
                          {biz.phone         && <span>📞 {biz.phone}</span>}
                          {biz.website       && <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">🔗 {biz.website.replace(/^https?:\/\//, '')}</a>}
                          {biz.contact_email && <span>✉️ {biz.contact_email}</span>}
                          {biz.hours         && <span>🕐 {biz.hours}</span>}
                          <span>🕒 Submitted {timeAgo(biz.created_at)}</span>
                        </div>
                      </div>
                      {activeSection === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => updateBizStatus(biz.id, 'approved')} disabled={bizActionId === biz.id} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50" style={{ backgroundColor: '#16a34a' }}>
                            {bizActionId === biz.id ? '…' : '✓ Approve'}
                          </button>
                          <button onClick={() => updateBizStatus(biz.id, 'rejected')} disabled={bizActionId === biz.id} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50" style={{ backgroundColor: '#dc2626' }}>
                            {bizActionId === biz.id ? '…' : '✕ Reject'}
                          </button>
                        </div>
                      )}
                      {activeSection === 'approved' && (
                        <button onClick={() => updateBizStatus(biz.id, 'rejected')} disabled={bizActionId === biz.id} className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50 shrink-0">
                          Reject
                        </button>
                      )}
                      {activeSection === 'rejected' && (
                        <button onClick={() => updateBizStatus(biz.id, 'approved')} disabled={bizActionId === biz.id} className="px-4 py-2 rounded-xl text-sm font-semibold border border-green-200 text-green-600 hover:bg-green-50 transition disabled:opacity-50 shrink-0">
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══ COMMUNITY SUBMISSIONS ════════════════════════════════════════════ */}
        {isSubmissionsTab && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Community Submissions</h2>
                <p className="text-sm text-gray-400 mt-0.5">Approve to auto-promote to the right section, or dismiss to discard</p>
              </div>
              <button onClick={() => { loadSubmissions(); loadSubCount() }} className="text-xs text-gray-400 hover:text-gray-600 transition">
                ↻ Refresh
              </button>
            </div>

            {subLoading ? (
              <div className="space-y-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-gray-500 font-medium">Inbox is clear — no pending submissions!</p>
                <p className="text-xs text-gray-400 mt-2">Tips submitted at /submit will appear here for review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => {
                  const t = TYPE_LABELS[sub.submission_type] ?? { label: sub.submission_type, emoji: '📋', color: '#374151', bg: '#f3f4f6' }
                  return (
                    <div key={sub.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: t.bg, color: t.color }}>
                              {t.emoji} {t.label}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#1e3a5f15', color: '#1e3a5f' }}>
                              📍 {sub.city}
                            </span>
                            <span className="text-xs text-gray-400">{timeAgo(sub.created_at)}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1">{sub.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-3 mb-3">{sub.description}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                            {sub.event_date  && <span>📅 {new Date(sub.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                            {sub.contact_url && <a href={sub.contact_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">🔗 Contact link</a>}
                            {sub.image_url   && <a href={sub.image_url}   target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">🖼 Image</a>}
                          </div>
                          {sub.submission_type === 'business_update' && (
                            <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ Business updates need manual founder review</p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleSubAction(sub.id, 'approve')}
                            disabled={subActionId === sub.id}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
                            style={{ backgroundColor: '#16a34a' }}
                          >
                            {subActionId === sub.id ? '…' : '✓ Approve'}
                          </button>
                          <button
                            onClick={() => handleSubAction(sub.id, 'reject')}
                            disabled={subActionId === sub.id}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
                            style={{ backgroundColor: '#dc2626' }}
                          >
                            {subActionId === sub.id ? '…' : '✕ Dismiss'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
