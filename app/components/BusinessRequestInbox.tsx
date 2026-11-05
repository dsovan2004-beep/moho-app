'use client'

import { useCallback, useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'

interface BusinessRequest {
  id: string; kind: string; business_id: string | null; created_at: string
  payload: Record<string, string>
}

function ReviewCard({ request, onReviewed }: { request: BusinessRequest; onReviewed: () => void }) {
  const [note, setNote] = useState('')
  const [evidence, setEvidence] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function review(action: 'approve' | 'reject') {
    setBusy(true); setError('')
    try {
      if (action === 'approve' && !confirmed) throw new Error('Check the business details and ownership evidence before approving.')
      const { data, error } = await getSupabaseClient().rpc('review_business_request', {
        p_id: request.id, p_action: action, p_note: note, p_evidence_url: evidence || null,
      })
      if (error || data !== request.id) throw new Error(error?.message || 'Decision was not saved.')
      onReviewed()
    } catch (err) { setError(err instanceof Error ? err.message : 'Review failed. Please retry.') }
    finally { setBusy(false) }
  }
  return <article className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
    <h3 className="font-semibold">{request.kind === 'claim' ? 'Ownership claim' : 'Business submission'}: {request.payload.name || request.payload.owner_name}</h3>
    <p className="text-xs text-gray-500 break-all">Reference: {request.id}</p>
    {request.business_id && <a className="underline text-sm" href={`/business/${request.business_id}`} target="_blank" rel="noopener noreferrer">Open listing</a>}
    <dl className="text-sm space-y-1">{Object.entries(request.payload).map(([key, value]) => <div key={key} className="break-words"><dt className="inline font-medium">{key.replaceAll('_', ' ')}: </dt><dd className="inline whitespace-pre-wrap">{value}</dd></div>)}</dl>
    <label className="block text-sm">Review notes (required)
      <textarea value={note} onChange={e => setNote(e.target.value)} minLength={10} maxLength={2000} className="block w-full border rounded-lg p-2" />
    </label>
    <label className="block text-sm">Public business evidence URL (required to approve)
      <input type="url" value={evidence} onChange={e => setEvidence(e.target.value)} maxLength={2048} className="block w-full border rounded-lg p-2" />
    </label>
    <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
      {request.kind === 'claim' ? 'I independently verified this requester controls the business. A matching account email alone is insufficient.' : 'I checked the public business identity, contact details and city against the evidence above.'}
    </label>
    {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
    <div className="flex gap-3">
      <button disabled={busy || note.trim().length < 10 || !confirmed || !evidence} onClick={() => review('approve')} className="bg-blue-900 text-white px-4 py-2 rounded-lg disabled:opacity-40">Approve</button>
      <button disabled={busy || note.trim().length < 10} onClick={() => review('reject')} className="border px-4 py-2 rounded-lg disabled:opacity-40">Reject</button>
    </div>
  </article>
}

export default function BusinessRequestInbox() {
  const [requests, setRequests] = useState<BusinessRequest[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await getSupabaseClient().from('business_requests')
        .select('id,kind,business_id,payload,created_at').eq('status', 'pending').order('created_at').limit(100)
      if (error) throw error
      setRequests(data ?? []); setError('')
    } catch { setError('The request queue could not be loaded. Retry after checking the database migration.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  return <section className="mb-8 space-y-4" aria-labelledby="business-requests-title">
    <div className="flex justify-between items-center"><h2 id="business-requests-title" className="text-lg font-bold">Business submissions &amp; ownership claims</h2>
      <button className="underline text-sm" onClick={load}>Refresh</button></div>
    <p className="text-sm text-gray-500">Requests remain private and pending until reviewed. Approval records evidence and assigns ownership atomically.</p>
    {loading && <p role="status">Loading requests…</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {!loading && !error && requests.length === 0 && <p className="text-sm">No pending business requests.</p>}
    {requests.map(request => <ReviewCard key={request.id} request={request} onReviewed={load} />)}
  </section>
}
