'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useRequestAccount() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  useEffect(() => {
    const supabase = getSupabaseClient()
    let active = true
    supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setChecking(false) } })
      .catch(() => { if (active) setChecking(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  return { user: user?.email_confirmed_at && !user.is_anonymous ? user : null, checking }
}

export function RequestAccount({ returnTo }: { returnTo: string }) {
  return <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 mb-6 text-sm text-gray-700">
    <p>Sign in with a confirmed email before adding a business or requesting ownership. Your request stays pending until reviewed.</p>
    <Link className="inline-block mt-3 font-semibold underline" href={`/login?next=${encodeURIComponent(returnTo)}`}>Sign in to continue →</Link>
    <p className="mt-2 text-xs">You can browse listings and contact businesses without an account.</p>
  </div>
}

export async function sendBusinessRequest(body: Record<string, unknown>) {
  const supabase = getSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Please sign in before sending your request.')
  const res = await fetch('/api/business-requests', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
  })
  const result = await res.json() as { id?: string; status?: string; error?: string }
  if (!res.ok || !result.id || result.status !== 'pending') throw new Error(result.error || 'Your request could not be saved. Please retry.')
  return result.id
}
