'use client'
export const runtime = 'edge'

import { useState } from 'react'
import Link from 'next/link'

const WORKER_URL = 'https://moho-ingestion.dsovan2004.workers.dev'

const CITIES = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca']

const SUBMISSION_TYPES = [
  { value: 'event',           label: '📅 Local Event',       desc: 'Block party, market, community gathering, school event' },
  { value: 'lost_pet',        label: '🐾 Lost or Found Pet',  desc: 'Help reunite a missing or found animal' },
  { value: 'garage_sale',     label: '🏷️ Garage Sale',        desc: 'Yard sale, estate sale, moving sale' },
  { value: 'community_tip',   label: '💬 Community Tip',      desc: 'Road closure, new business, local news tip' },
  { value: 'business_update', label: '🏪 Business Update',    desc: 'Hours change, new location, closed permanently' },
]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function SubmitPage() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg,  setErrorMsg]  = useState('')

  const [city,           setCity]           = useState('')
  const [submissionType, setSubmissionType] = useState('')
  const [title,          setTitle]          = useState('')
  const [description,    setDescription]    = useState('')
  const [eventDate,      setEventDate]      = useState('')
  const [contactUrl,     setContactUrl]     = useState('')

  const selectedType = SUBMISSION_TYPES.find((t) => t.value === submissionType)
  const showEventDate = submissionType === 'event' || submissionType === 'garage_sale'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormState('submitting')
    setErrorMsg('')

    try {
      const body: Record<string, string> = {
        title:           title.trim(),
        description:     description.trim(),
        city,
        submission_type: submissionType,
      }
      if (eventDate)  body.event_date  = new Date(eventDate).toISOString()
      if (contactUrl) body.contact_url = contactUrl.trim()

      const res = await fetch(`${WORKER_URL}/submit-signal`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (res.ok) {
        setFormState('success')
      } else {
        const data = await res.json() as { message?: string; errors?: string[] }
        const msg  = data.errors?.join(', ') ?? data.message ?? 'Something went wrong — try again'
        setErrorMsg(msg)
        setFormState('error')
      }
    } catch {
      setErrorMsg('Network error — check your connection and try again')
      setFormState('error')
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-md p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🙌</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Thanks for the tip!</h2>
          <p className="text-gray-500 text-sm mb-8">
            Your submission is in. Our team reviews everything before it goes live — usually within 24 hours.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setFormState('idle')
                setCity(''); setSubmissionType(''); setTitle(''); setDescription(''); setEventDate(''); setContactUrl('')
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Submit another
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              Back to MoHo Local
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight" style={{ color: '#1e3a5f' }}>
            MoHo<span style={{ color: '#f59e0b' }}>Local</span>
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition">
            ← Back
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Share something with the 209 👋</h1>
          <p className="text-gray-500">
            Got a local event, lost pet, garage sale, or community tip? Let your neighbors know.
            We review everything before it goes live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* City */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Your city *</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className="px-3 py-2.5 rounded-xl text-sm font-semibold border transition text-left"
                  style={{
                    borderColor:     city === c ? '#1e3a5f' : '#e5e7eb',
                    backgroundColor: city === c ? '#1e3a5f' : '#fff',
                    color:           city === c ? '#fff'    : '#374151',
                    borderWidth:     city === c ? 2         : 1,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Submission type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">What are you sharing? *</label>
            <div className="space-y-2">
              {SUBMISSION_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setSubmissionType(t.value)}
                  className="w-full px-4 py-3 rounded-xl border text-left transition flex items-start gap-3"
                  style={{
                    borderColor:     submissionType === t.value ? '#1e3a5f' : '#e5e7eb',
                    backgroundColor: submissionType === t.value ? '#f0f4ff' : '#fff',
                    borderWidth:     submissionType === t.value ? 2         : 1,
                  }}
                >
                  <span className="text-lg leading-none mt-0.5">{t.label.split(' ')[0]}</span>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{t.label.slice(3)}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              {submissionType === 'lost_pet' ? 'Pet description (breed, color, name)' : 'Title *'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                submissionType === 'event'           ? 'e.g. Mountain House Summer Block Party' :
                submissionType === 'lost_pet'        ? 'e.g. Lost golden retriever, Buddy' :
                submissionType === 'garage_sale'     ? 'e.g. Moving sale — everything must go!' :
                submissionType === 'community_tip'   ? 'e.g. Byron Rd closure starting Monday' :
                submissionType === 'business_update' ? 'e.g. Pho 209 has new hours' :
                'Give your submission a short title'
              }
              required
              minLength={5}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-900 placeholder-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Details *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                submissionType === 'lost_pet'
                  ? 'Where and when last seen, contact number, any distinguishing marks...'
                  : 'Share the details — location, time, what to bring, how to contact you...'
              }
              required
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-900 placeholder-gray-400 resize-none"
            />
          </div>

          {/* Event date — shown for events and garage sales */}
          {showEventDate && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                {submissionType === 'garage_sale' ? 'Sale date' : 'Event date'}
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          )}

          {/* Contact URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Link
              <span className="text-gray-400 font-normal ml-1">(optional — Facebook event, Nextdoor post, etc.)</span>
            </label>
            <input
              type="url"
              value={contactUrl}
              onChange={(e) => setContactUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-900 placeholder-gray-400"
            />
          </div>

          {/* Error */}
          {formState === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!city || !submissionType || !title.trim() || !description.trim() || formState === 'submitting'}
            className="w-full py-4 rounded-2xl text-base font-black text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            {formState === 'submitting' ? 'Sending…' : 'Send it to the team →'}
          </button>

          <p className="text-xs text-center text-gray-400">
            All submissions are reviewed by the MoHo Local team before going live.
            No spam, no selling your info. Ever.
          </p>

        </form>
      </div>
    </div>
  )
}
