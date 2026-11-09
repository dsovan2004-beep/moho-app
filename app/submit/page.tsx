'use client'
export const runtime = 'nodejs'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { UUID } from '@/lib/directory-requests'
import { savedSubmissionReference, receiptListingHref } from '@/lib/submission-receipt'
import SubmissionReceipt from '@/app/components/SubmissionReceipt'
import { RequestAccount, useRequestAccount } from '@/app/components/RequestAccount'
import { getSupabaseClient } from '@/lib/supabase'

const WORKER_URL = 'https://moho-ingestion.dsovan2004.workers.dev'

const CITIES = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca']

const SUBMISSION_TYPES = [
  { value: 'event',           label: '📅 Local Event',       desc: 'Block party, market, community gathering, school event' },
  { value: 'lost_pet',        label: '🐾 Lost or Found Pet',  desc: 'Help reunite a missing or found animal' },
  { value: 'garage_sale',     label: '🏷️ Garage Sale',        desc: 'Yard sale, estate sale, moving sale' },
  { value: 'community_tip',   label: '💬 Community Tip',      desc: 'Road closure, new business, local news tip' },
  { value: 'business_update', label: '🏪 Business Update',    desc: 'Hours change, new location, closed permanently' },
]

type FormState = 'idle' | 'submitting' | 'success' | 'error' | 'uncertain'

export default function SubmitPage() {
  const params = useSearchParams()
  const requestedType=params.get('submission_type') ?? ''
  const businessId=params.get('business_id') ?? ''
  const listingUrl=UUID.test(businessId) ? `https://www.moholocal.com/business/${businessId}` : ''
  const [petStatus,setPetStatus]=useState('lost')
  const { user, checking } = useRequestAccount()
  const [formState, setFormState] = useState<FormState>('idle')
  const [savedReference,setSavedReference] = useState<string | null>(null)
  const [errorMsg,  setErrorMsg]  = useState('')

  const [city,           setCity]           = useState(CITIES.includes(params.get('city') ?? '') ? params.get('city')! : '')
  const [submissionType, setSubmissionType] = useState(SUBMISSION_TYPES.some(t=>t.value===requestedType) ? requestedType : '')
  const [title,          setTitle]          = useState((params.get('title') ?? '').slice(0,200))
  const [description,    setDescription]    = useState('')
  const [eventDate,      setEventDate]      = useState('')
  const [contactUrl,     setContactUrl]     = useState(UUID.test(businessId) ? `https://www.moholocal.com/business/${businessId}` : '')

  const isListingCorrection = submissionType === 'business_update' && !!listingUrl
  const selectedType = SUBMISSION_TYPES.find((t) => t.value === submissionType)
  const showEventDate = submissionType === 'event' || submissionType === 'garage_sale'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || formState === 'submitting' || formState === 'uncertain') return
    setFormState('submitting')
    setErrorMsg('')
    let requestStarted = false

    try {
      const body: Record<string, string> = {
        title:           title.trim(),
        description:     description.trim(),
        city,
        submission_type: submissionType,
      }
      if (submissionType === 'lost_pet') body.pet_status=petStatus
      if (eventDate)  body.event_date  = new Date(eventDate).toISOString()
      if (isListingCorrection) body.contact_url = listingUrl
      else if (contactUrl) body.contact_url = contactUrl.trim()

      const { data: { session } } = await getSupabaseClient().auth.getSession()
      if (!session?.access_token) throw new Error('Sign in before submitting.')
      requestStarted = true
      const res = await fetch(`${WORKER_URL}/submit-signal`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body:    JSON.stringify(body),
      })

      if (res.ok) {
        const result: unknown = await res.json().catch(() => null)
        const reference = savedSubmissionReference(result)
        if (reference) { setSavedReference(reference); setFormState('success') }
        else setFormState('uncertain')
      } else {
        const data = await res.json().catch(() => ({})) as { message?: string; error?: string; errors?: string[] }
        const msg  = data.errors?.join(', ') ?? data.message ?? data.error ?? 'Something went wrong — try again'
        setErrorMsg(msg)
        setFormState('error')
      }
    } catch {
      if (requestStarted) setFormState('uncertain')
      else { setErrorMsg('Could not start your submission. Check your sign-in and try again.'); setFormState('error') }
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (formState === 'success' && savedReference) {
    return <div className="px-4 py-5"><SubmissionReceipt reference={savedReference} listingId={isListingCorrection ? businessId : undefined} city={city} onAnother={() => {
      setFormState('idle'); setSavedReference(null); setDescription(''); setEventDate('')
      if (isListingCorrection) setTitle((params.get('title') ?? 'Listing correction').slice(0,200))
      else { setCity(''); setSubmissionType(''); setTitle(''); setContactUrl('') }
    }} /></div>
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
          <Link href={isListingCorrection ? `/business/${businessId}${city ? `?${new URLSearchParams({city})}` : ''}` : '/'} className="text-sm text-gray-400 hover:text-gray-700 transition">
            ← Back
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">{isListingCorrection ? 'Suggest a listing correction' : 'Share something with the 209 👋'}</h1>
          <p className="text-gray-500">
            {isListingCorrection ? 'Help keep local information current. Tell us what changed and how you know; an editor reviews corrections before updating a listing.' : 'Got a local event, lost pet, garage sale, or community tip? Let your neighbors know. We review everything before it goes live.'}
          </p>
        </div>

        {isListingCorrection && <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700"><p className="font-bold">{title.startsWith('Listing correction: ') ? title.slice(20) : 'Listing being corrected'}</p><Link className="mt-2 inline-flex min-h-11 items-center font-semibold underline" href={`/business/${businessId}${city ? `?${new URLSearchParams({city})}` : ''}`}>View the listing →</Link><p className="mt-1">Report outdated hours, contact details, service areas or a closure. Include a public source or the date you noticed the change. Keep private personal information out of the report.</p></div>}
        {!user && !checking && <RequestAccount returnTo={`/submit${params.size ? `?${params.toString()}` : ''}`} />}
          <form onSubmit={handleSubmit} className="space-y-5">
            <fieldset disabled={!user || checking || formState === 'submitting'} className="space-y-5">

          {/* City */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">{isListingCorrection ? 'City affected *' : 'Your city *'}</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  aria-pressed={city === c}
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

          {/* A listing correction already has a fixed submission type. */}
          {!isListingCorrection && <div>
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
          </div>}

          {submissionType === 'lost_pet' && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><label htmlFor="pet-status" className="block font-bold text-sm">Report status</label><select id="pet-status" value={petStatus} onChange={e=>setPetStatus(e.target.value)} className="mt-2 border border-slate-300 rounded-lg p-2 bg-white"><option value="lost">Lost pet</option><option value="found">Found pet / sighting</option><option value="reunited">Reunited update</option></select><p className="text-sm text-slate-600 mt-3">Include the sighting date and a neighborhood or nearby public landmark. Share a contact link only if you have permission; keep private home addresses and sensitive ownership details out of the report. Reports are reviewed before publication.</p></div>}
          {/* Title */}
          <div>
            <label htmlFor="submission-title" className="block text-sm font-bold text-gray-700 mb-1.5">
              {submissionType === 'lost_pet' ? 'Pet description (breed, color, name)' : isListingCorrection ? 'Correction summary *' : 'Title *'}
            </label>
            <input
              type="text"
              id="submission-title"
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
            <label htmlFor="submission-details" className="block text-sm font-bold text-gray-700 mb-1.5">{isListingCorrection ? 'What changed? *' : 'Details *'}</label>
            <textarea
              id="submission-details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                submissionType === 'lost_pet'
                  ? 'Where and when last seen, contact number, any distinguishing marks...'
                  : isListingCorrection ? 'What is incorrect, what should it say, and when did you check? Add a public source link if available.' : 'Share the details — location, time, what to bring, how to contact you...'
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
            <label htmlFor="submission-link" className="block text-sm font-bold text-gray-700 mb-1.5">
              {isListingCorrection ? 'Listing link (included automatically)' : 'Link'}
              {!isListingCorrection && <span className="text-gray-400 font-normal ml-1">(optional — Facebook event, Nextdoor post, etc.)</span>}
            </label>
            <input
              type="url"
              id="submission-link"
              readOnly={isListingCorrection}
              value={isListingCorrection ? listingUrl : contactUrl}
              onChange={(e) => setContactUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-900 placeholder-gray-400"
            />
          </div>

          {formState === 'uncertain' && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><p className="font-bold">We couldn't confirm your request reference</p><p className="mt-2">Your request may have been saved. Your details remain in this form. Avoid sending it again right away to prevent duplicates.</p>{isListingCorrection && <Link className="mt-2 inline-flex min-h-11 items-center font-bold underline" href={receiptListingHref(businessId,city)!}>Return to listing</Link>}</div>}
          {/* Error */}
          {formState === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!city || !submissionType || !title.trim() || !description.trim() || (formState === 'submitting' || formState === 'uncertain')}
            className="w-full py-4 rounded-2xl text-base font-black text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            {formState === 'submitting' ? 'Sending…' : 'Send it to the team →'}
          </button>

          <p className="text-xs text-center text-gray-400">
            All submissions are reviewed by the MoHo Local team before going live.
            No spam, no selling your info. Ever.
          </p>

        </fieldset>
          </form>
      </div>
    </div>
  )
}
