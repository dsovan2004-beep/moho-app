'use client'
export const runtime = 'edge'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

const CATEGORIES = [
  'Restaurants',
  'Health & Wellness',
  'Beauty & Spa',
  'Home Services',
  'Automotive',
  'Pet Services',
  'Real Estate',
  'Education',
  'Retail',
]

const CITIES = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca']

export default function SuggestBusinessPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    business_name: '',
    category: '',
    city: '',
    address: '',
    phone: '',
    website: '',
    notes: '',
    submitter_name: '',
    submitter_email: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.business_name.trim()) {
      setError('Business name is required.')
      return
    }
    if (!form.city) {
      setError('Please select a city.')
      return
    }

    setSubmitting(true)
    try {
      const supabase = getSupabaseClient()
      const { error: dbError } = await supabase.from('business_suggestions').insert([
        {
          business_name: form.business_name.trim(),
          category: form.category || null,
          city: form.city,
          address: form.address.trim() || null,
          phone: form.phone.trim() || null,
          website: form.website.trim() || null,
          notes: form.notes.trim() || null,
          submitter_name: form.submitter_name.trim() || null,
          submitter_email: form.submitter_email.trim() || null,
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
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Thanks for the tip!</h1>
        <p className="text-gray-500 mb-6">
          We'll review your suggestion and reach out to the business owner. Your neighbors will
          thank you for helping grow our local directory.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/directory"
            className="px-6 py-3 rounded-xl font-bold text-sm text-white transition"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            Browse Directory
          </Link>
          <button
            onClick={() => {
              setSuccess(false)
              setForm({
                business_name: '',
                category: '',
                city: '',
                address: '',
                phone: '',
                website: '',
                notes: '',
                submitter_name: '',
                submitter_email: '',
              })
            }}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Suggest Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/directory" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Directory
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Suggest a Business</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Know a great local business that&apos;s not listed yet? Help your neighbors discover it!
          We&apos;ll verify and add it to the directory.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Business Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Business Info</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              name="business_name"
              type="text"
              value={form.business_name}
              onChange={handleChange}
              placeholder="e.g. Mountain House Yoga Studio"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="">Select a city…</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="">Select a category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <input
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="Street address (optional)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="(209) 555-1234"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Website</label>
              <input
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Anything else we should know?
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Hours, special services, why you recommend them…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
        </div>

        {/* Your Info (optional) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
            Your Info <span className="font-normal text-gray-400 normal-case">(optional)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
              <input
                name="submitter_name"
                type="text"
                value={form.submitter_name}
                onChange={handleChange}
                placeholder="Jane from Mountain House"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Your Email</label>
              <input
                name="submitter_email"
                type="email"
                value={form.submitter_email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            We may reach out to confirm details. We&apos;ll never share your info with third parties.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl font-bold text-sm text-[#1e3a5f] transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#f59e0b' }}
        >
          {submitting ? 'Submitting…' : '✨ Submit Suggestion'}
        </button>
      </form>
    </div>
  )
}
