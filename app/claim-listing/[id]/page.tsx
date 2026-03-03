'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Business } from '@/lib/supabase'

const ROLES = ['Owner', 'Manager', 'Employee']

const CATEGORY_EMOJI: Record<string, string> = {
  'Restaurants': '🍽️',
  'Health & Wellness': '🏥',
  'Beauty & Spa': '💇',
  'Retail': '🛍️',
  'Education': '🏫',
  'Automotive': '🚗',
  'Auto Services': '🚗',
  'Real Estate': '🏠',
  'Home Services': '🔧',
  'Pet Services': '🐾',
  'Childcare': '👶',
  'Tutoring': '📚',
}

function focusRing(e: React.FocusEvent<HTMLElement>) {
  e.target.style.boxShadow = '0 0 0 2px #1e3a5f40'
  e.target.style.borderColor = '#1e3a5f'
}
function blurRing(e: React.FocusEvent<HTMLElement>) {
  e.target.style.boxShadow = ''
  e.target.style.borderColor = ''
}

const FIELD_BASE = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition bg-white'

export default function ClaimListingPage() {
  const params = useParams()
  const id = params?.id as string

  const [business, setBusiness] = useState<Business | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [ownerName, setOwnerName] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [role, setRole] = useState('Owner')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [claimed, setClaimed] = useState(false)

  // Fetch business
  useEffect(() => {
    if (!id) return
    supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setLoadError('Business not found.')
        } else {
          setBusiness(data as Business)
        }
        setLoading(false)
      })
  }, [id])

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault()
    if (!business) return
    setSubmitting(true)
    setSubmitError(null)

    const { error } = await supabase
      .from('businesses')
      .update({ claimed: true })
      .eq('id', business.id)

    if (error) {
      setSubmitError(error.message)
      setSubmitting(false)
    } else {
      setClaimed(true)
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8" style={{ color: '#1e3a5f' }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (loadError || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Listing not found</h2>
          <p className="text-sm text-gray-500 mb-6">{loadError || "We couldn't find that business listing."}</p>
          <Link
            href="/directory"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            Browse Directory
          </Link>
        </div>
      </div>
    )
  }

  // ── Already claimed / success ────────────────────────────────────────────────
  if (claimed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl"
            style={{ backgroundColor: '#1e3a5f15' }}
          >
            ✅
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim request received!</h1>
          <p className="text-gray-500 mb-2">
            Thanks, <strong>{ownerName}</strong>. We've received your request to claim{' '}
            <strong>{business.name}</strong>.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Our team will verify your ownership and follow up at <strong>{ownerEmail}</strong> within
            1–2 business days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/business/${business.id}`}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              View Listing
            </Link>
            <Link
              href="/directory"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const emoji = CATEGORY_EMOJI[business.category] ?? '🏢'

  // ── Main ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back */}
        <Link href={`/business/${business.id}`} className="text-sm text-gray-400 hover:text-gray-600 transition">
          ← Back to listing
        </Link>

        {/* ── Business Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-2 w-full" style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)' }} />
          <div className="p-6 flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: '#f59e0b20' }}
            >
              {emoji}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{business.name}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="text-sm text-gray-500">{business.category}</span>
                <span className="text-gray-300">·</span>
                <span className="text-sm text-gray-500">{business.city}</span>
                {business.address && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-400 truncate">{business.address}</span>
                  </>
                )}
              </div>
              {business.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{business.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Claim Form ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Claim this listing</h1>
            <p className="text-sm text-gray-500">
              Are you the owner or manager of <strong>{business.name}</strong>? Submit your details below and
              we'll verify your connection to this business.
            </p>
          </div>

          {submitError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {submitError}
            </div>
          )}

          <form onSubmit={handleClaim} className="space-y-5">

            {/* Name + Role row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ownerName">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="ownerName" type="text" required
                  value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Jane Smith"
                  className={FIELD_BASE}
                  onFocus={focusRing} onBlur={blurRing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">
                  Your Role <span className="text-red-400">*</span>
                </label>
                <select
                  id="role" required
                  value={role} onChange={(e) => setRole(e.target.value)}
                  className={FIELD_BASE}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', appearance: 'none' }}
                  onFocus={focusRing} onBlur={blurRing}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ownerEmail">
                Business Email <span className="text-red-400">*</span>
              </label>
              <input
                id="ownerEmail" type="email" required
                value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="owner@yourbusiness.com"
                className={FIELD_BASE}
                onFocus={focusRing} onBlur={blurRing}
              />
              <p className="text-xs text-gray-400 mt-1">We'll use this to verify your claim and send confirmation.</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ownerPhone">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                id="ownerPhone" type="tel" required
                value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="(209) 555-0100"
                className={FIELD_BASE}
                onFocus={focusRing} onBlur={blurRing}
              />
            </div>

            {/* Info box */}
            <div
              className="flex gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: '#1e3a5f08', border: '1px solid #1e3a5f20' }}
            >
              <span className="text-lg leading-none mt-0.5">ℹ️</span>
              <p className="text-gray-600">
                Claiming a listing lets you update your business info, add photos, and respond to community
                questions. Our team reviews all claims within 1–2 business days.
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-gray-400"><span className="text-red-400">*</span> Required fields</p>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1e3a5f', color: 'white' }}
                onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#1e40af')}
                onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#1e3a5f')}
              >
                {submitting && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Submit Claim
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}
