'use client'

export const runtime = 'nodejs'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { RequestAccount, useRequestAccount, sendBusinessRequest } from '@/app/components/RequestAccount'
import { RELAUNCH_CITY_NAMES } from '@/lib/cities'
import { BUSINESS_CATEGORIES } from '@/lib/directory-requests'

const CATEGORIES = BUSINESS_CATEGORIES
const CITIES = RELAUNCH_CITY_NAMES

const FIELD_STYLE = {
  base: 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition bg-white',
}

function focusRing(e: React.FocusEvent<HTMLElement>) {
  e.target.style.boxShadow = '0 0 0 2px #1e3a5f40'
  e.target.style.borderColor = '#1e3a5f'
}
function blurRing(e: React.FocusEvent<HTMLElement>) {
  e.target.style.boxShadow = ''
  e.target.style.borderColor = ''
}

export default function SubmitBusinessPage() {
  const { user, checking } = useRequestAccount()
  const requestKey = useRef('')
  const [receipt, setReceipt] = useState('')
  const [form, setForm] = useState({
    name: '',
    category: '',
    city: '',
    address: '',
    phone: '',
    website: '',
    contact_email: '',
    description: '',
    hours: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      requestKey.current ||= crypto.randomUUID()
      const { contact_email: _privateEmail, ...payload } = form
      const id = await sendBusinessRequest({ kind: 'submission', payload, requestKey: requestKey.current })
      setReceipt(id)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not save your request. Please retry.')
    } finally { setSubmitting(false) }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-3xl"
            style={{ backgroundColor: '#f59e0b20' }}
          >
            🎉
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing submitted!</h1>
          <p className="text-gray-500 mb-2">
            Thanks for adding <strong>{form.name}</strong> to MoHoLocal.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Your request is saved and pending review. A listing becomes public only after its details have been checked.
          </p>
          <p className="text-xs text-gray-500 break-all mb-6">Request reference: {receipt}</p>
          <Link href="/my-requests" className="underline text-sm inline-block mb-4">Track my requests</Link>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/directory"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              Browse Directory
            </Link>
            <button
              onClick={() => {
                setForm({ name: '', category: '', city: '', address: '', phone: '', website: '', contact_email: '', description: '', hours: '' })
                setSubmitted(false)
                requestKey.current = ''
                setReceipt('')
              }}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/directory" className="text-sm text-gray-400 hover:text-gray-600 transition">
            ← Back to Directory
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-1">Add Your Business</h1>
          <p className="text-sm text-gray-500">
            Suggest a business in Mountain House, Tracy, Lathrop or Manteca. Basic listings are free.
            Listings are reviewed before going live.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {!user && !checking && <RequestAccount returnTo="/submit-business" />}
          {checking && <p role="status">Checking your account…</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset disabled={!user || submitting} className="space-y-6 disabled:opacity-60">

            {/* ── Business Info ── */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Business Info</h2>
              <div className="space-y-4">

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                    Business Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="name" type="text" required
                    value={form.name} onChange={(e) => set('name', e.target.value)}
                    placeholder="e.g. Mountain House Plumbing"
                    className={FIELD_STYLE.base}
                    onFocus={focusRing} onBlur={blurRing}
                  />
                </div>

                {/* Category + City row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="category" required
                      value={form.category} onChange={(e) => set('category', e.target.value)}
                      className={FIELD_STYLE.base}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', appearance: 'none' }}
                      onFocus={focusRing} onBlur={blurRing}
                    >
                      <option value="">Select category…</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                      City <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="city" required
                      value={form.city} onChange={(e) => set('city', e.target.value)}
                      className={FIELD_STYLE.base}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', appearance: 'none' }}
                      onFocus={focusRing} onBlur={blurRing}
                    >
                      <option value="">Select city…</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                    Public business address (optional)
                  </label>
                  <input
                    id="address" type="text"
                    value={form.address} onChange={(e) => set('address', e.target.value)}
                    placeholder="123 Main St, Mountain House, CA 95391"
                    className={FIELD_STYLE.base}
                    onFocus={focusRing} onBlur={blurRing}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="description" required rows={4}
                    value={form.description} onChange={(e) => set('description', e.target.value)}
                    placeholder="Tell the community what your business does, what makes it special, and who you serve…"
                    className={`${FIELD_STYLE.base} resize-none`}
                    onFocus={focusRing} onBlur={blurRing}
                  />
                </div>

                {/* Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="hours">
                    Business Hours
                  </label>
                  <input
                    id="hours" type="text"
                    value={form.hours} onChange={(e) => set('hours', e.target.value)}
                    placeholder="e.g. Mon–Fri 8am–6pm, Sat 9am–3pm"
                    className={FIELD_STYLE.base}
                    onFocus={focusRing} onBlur={blurRing}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* ── Contact Info ── */}
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Info</h2>
              <div className="space-y-4">

                {/* Phone + Website row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                      Phone
                    </label>
                    <input
                      id="phone" type="tel"
                      value={form.phone} onChange={(e) => set('phone', e.target.value)}
                      placeholder="(209) 555-0100"
                      className={FIELD_STYLE.base}
                      onFocus={focusRing} onBlur={blurRing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="website">
                      Website
                    </label>
                    <input
                      id="website" type="url"
                      value={form.website} onChange={(e) => set('website', e.target.value)}
                      placeholder="https://yourbusiness.com"
                      className={FIELD_STYLE.base}
                      onFocus={focusRing} onBlur={blurRing}
                    />
                  </div>
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contact_email">
                    Contact Email
                  </label>
                  <input
                    id="contact_email" type="email"
                    value={user?.email ?? ''} readOnly
                    placeholder="hello@yourbusiness.com"
                    className={FIELD_STYLE.base}
                    onFocus={focusRing} onBlur={blurRing}
                  />
                  <p className="text-xs text-gray-400 mt-1">Not shown publicly — used only to contact you about your listing.</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Submit */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400"><span className="text-red-400">*</span> Required fields</p>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
                onMouseEnter={(e) => !submitting && ((e.currentTarget).style.backgroundColor = '#d97706')}
                onMouseLeave={(e) => !submitting && ((e.currentTarget).style.backgroundColor = '#f59e0b')}
              >
                {submitting && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Submit Listing
              </button>
            </div>

            </fieldset>
          </form>
        </div>
      </div>
    </div>
  )
}
