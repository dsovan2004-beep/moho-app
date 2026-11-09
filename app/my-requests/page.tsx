'use client'
export const runtime = 'nodejs'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { RequestAccount, useRequestAccount } from '@/app/components/RequestAccount'

interface Receipt { id: string; kind: string; status: string; created_at: string; business_id: string | null }
export default function MyRequests() {
  const { user, checking } = useRequestAccount()
  const [requests, setRequests] = useState<Receipt[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!user) return
    let active = true
    setLoading(true)
    getSupabaseClient().from('business_requests').select('id,kind,status,created_at,business_id')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
      .then(({ data, error }) => {
        if (!active) return
        setError(error ? 'Your requests could not be loaded. Please refresh to retry.' : '')
        setRequests(data ?? []); setLoading(false)
      })
    return () => { active = false }
  }, [user?.id])
  return <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
    <h1 className="text-2xl font-bold">My business requests</h1>
    {checking ? <p role="status">Checking your account…</p> : !user ? <RequestAccount returnTo="/my-requests" /> : <>
      {loading && <p role="status">Loading requests…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && requests.length === 0 && <p>No requests yet.</p>}
      {requests.map(r => <article key={r.id} className="border rounded-xl p-4">
        <p className="font-semibold capitalize">{r.kind} — {r.status}</p>
        <p className="text-xs break-all mt-2">Reference: {r.id}</p>
        <p className="text-sm mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
        {r.business_id && r.status === 'approved' && <Link className="underline text-sm" href={`/business/${r.business_id}`}>View listing</Link>}
      </article>)}
    </>}
    <Link className="underline inline-block" href="/directory">Browse directory</Link>
  </div>
}
