'use client'

// NOTE: This must be a client component (not a route handler) because Supabase's
// PKCE flow stores the code verifier in localStorage. The code exchange must happen
// on the client side so Supabase can retrieve the verifier and complete the handshake.

export const runtime = 'edge'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { Suspense } from 'react'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      setErrorMsg(errorDescription || error)
      setStatus('error')
      return
    }

    if (code) {
      const supabase = getSupabaseClient()
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            setErrorMsg(error.message)
            setStatus('error')
          } else {
            router.replace('/')
          }
        })
    } else {
      // No code — might be a direct visit, just go home
      router.replace('/')
    }
  }, [searchParams, router])

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign-in failed</h2>
          <p className="text-sm text-gray-500 mb-6">{errorMsg || 'Something went wrong. Please try again.'}</p>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            Back to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 mx-auto mb-4" style={{ color: '#1e3a5f' }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-medium" style={{ color: '#1e3a5f' }}>Signing you in…</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8" style={{ color: '#1e3a5f' }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
