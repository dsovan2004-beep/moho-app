'use client'

export const runtime = 'edge'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithGoogle, signUpWithEmail } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleGoogleSignUp() {
    setGoogleLoading(true)
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
    // On success, browser is redirected by Supabase
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError(null)
    const { data, error } = await signUpWithEmail(email, password, fullName)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.session) {
      // Immediately signed in (e.g. email confirmation disabled)
      router.push('/')
    } else {
      // Email confirmation required
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
        <div className="max-w-md w-full mx-auto text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#f59e0b20' }}
          >
            <span className="text-3xl">✉️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Card */}
      <div className="max-w-md w-full mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span
              className="text-sm font-bold px-2 py-1 rounded"
              style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
            >
              MH
            </span>
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#1e3a5f' }}>
              MoHo<span style={{ color: '#f59e0b' }}>Local</span>
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Join MoHoLocal — it&apos;s free</h1>
          <p className="mt-1 text-sm text-gray-500">Your community hub for Mountain House, Tracy, Lathrop &amp; Manteca</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
          {/* Google Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.5 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.8-1.9 13.3-5.1l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1e3a5f40'}
                onBlur={(e) => e.target.style.boxShadow = ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1e3a5f40'}
                onBlur={(e) => e.target.style.boxShadow = ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1e3a5f40'}
                onBlur={(e) => e.target.style.boxShadow = ''}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
              onMouseEnter={(e) => !loading && ((e.target as HTMLElement).style.backgroundColor = '#d97706')}
              onMouseLeave={(e) => !loading && ((e.target as HTMLElement).style.backgroundColor = '#f59e0b')}
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              Create Free Account
            </button>

            <p className="text-xs text-gray-400 text-center pt-1">
              By joining, you agree to our{' '}
              <a href="#" className="underline">Terms</a> and{' '}
              <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold" style={{ color: '#1e3a5f' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
