'use client'
export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient, type Business } from '@/lib/supabase'
import Link from 'next/link'

const REPORT_REASONS = [
  'Business is permanently closed',
  'Wrong address or contact info',
  'Duplicate listing',
  'Spam or fake business',
  'Inappropriate content',
  'Other',
]

export default function ReportListingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [business, setBusiness] = useState<Business | null>(null)
  const [loadingBiz, setLoadingBiz] = useState(true)

  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function fetchBusiness() {
      const supabase = getSupabaseClient()
      const { data } = await supabase
        .from('businesses')
        .select('id, name, city, category, address')
        .eq('id', id)
        .eq('status', 'approved')
        .eq('verified', true)
        .single()
      setBusiness(data as Business | null)
      setLoadingBiz(false)
    }
    fetchBusiness()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!reason) {
      setError('Please select a reason for your report.')
      return
    }

    setSubmitting(true)
    try {
      const supabase = getSupabaseClient()
      const { error: dbError } = await supabase.from('listing_reports').insert([
        {
          business_id: id,
          business_name: business?.name ?? null,
          reason,
          details: details.trim() || null,
          reporter_email: reporterEmail.trim() || null,
          status: 'pending',
        },
      ])

      if (dbError) throw dbError
      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Report Submitted</h1>
        <p className="text-gray-500 mb-6">
          Thanks for helping keep MoHo Local accurate. We&apos;ll review your report and take action
          within a few business days.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          {business && (
            <Link
              href={`/business/${id}`}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white transition"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              Back to Listing
            </Link>
          )}
          <Link
            href="/directory"
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Browse Directory
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={id ? `/business/${id}` : '/directory'}
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Listing
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Report a Listing</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Help us keep the directory accurate. Reports are reviewed by our team within a few business days.
        </p>
      </div>

      {/* Business summary card */}
      {loadingBiz ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      ) : business ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0">
            🏢
          </div>
          <div className="min-w-0">
            <div className="font-bold text-gray-900 truncate">{business.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {business.city} · {business.category}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-6">
          Business not found. Please check the URL and try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What&apos;s the issue? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="w-4 h-4 text-blue-700 border-gray-300 focus:ring-blue-400"
                  />
                  <span className={`text-sm transition ${reason === r ? 'text-gray-900 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                    {r}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Additional details{' '}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Any extra context that would help us review this…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Reporter email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Your email{' '}
              <span className="font-normal text-gray-400">(optional — for follow-up)</span>
            </label>
            <input
              type="email"
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !business}
          className="w-full py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#1e3a5f' }}
        >
          {submitting ? 'Submitting…' : '🚩 Submit Report'}
        </button>
      </form>
    </div>
  )
}
