'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const CITIES = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca']

function formatMemberSince(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function getUserDisplayName(user: User) {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Member'
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit form state
  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/login')
        return
      }
      setUser(user)
      setFullName(getUserDisplayName(user))
      setCity(user.user_metadata?.city || 'Mountain House')
      setLoading(false)
    })
  }, [router])

  async function handleSave(e: React.FormEvent) {
    const supabase = getSupabaseClient()
    e.preventDefault()
    setSaving(true)
    setSaveStatus('idle')
    setErrorMsg('')

    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: fullName, city },
    })

    if (error) {
      setErrorMsg(error.message)
      setSaveStatus('error')
    } else {
      setUser(data.user)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8" style={{ color: '#1e3a5f' }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!user) return null

  const avatarUrl = user.user_metadata?.avatar_url
  const displayName = getUserDisplayName(user)
  const initials = displayName[0].toUpperCase()
  const memberCity = user.user_metadata?.city || 'Mountain House'

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header banner */}
          <div className="h-24" style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)' }} />

          {/* Avatar + info */}
          <div className="px-6 pb-6">
            {/* Avatar — floats over banner independently */}
            <div className="-mt-12 mb-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full ring-4 ring-white shadow-md flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
                >
                  {initials}
                </div>
              )}
            </div>
            {/* Name + email sit cleanly below the banner */}
            <div className="mb-4">
              <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {memberCity}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Member since {formatMemberSince(user.created_at)}
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: '#f59e0b20', color: '#92400e' }}
                >
                  ✓ Community Member
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Edit Profile Form ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Edit Profile</h2>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1e3a5f40'}
                onBlur={(e) => e.target.style.boxShadow = ''}
              />
            </div>

            {/* Email — read only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 select-all">
                {user.email}
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                Your City
              </label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none transition appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #1e3a5f40'}
                onBlur={(e) => e.target.style.boxShadow = ''}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status messages */}
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Profile updated successfully.
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {errorMsg || 'Something went wrong. Please try again.'}
              </div>
            )}

            {/* Save button */}
            <div className="flex items-center justify-between pt-1">
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-gray-600 transition"
              >
                ← Back to home
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1e3a5f', color: 'white' }}
                onMouseEnter={(e) => !saving && ((e.target as HTMLElement).style.backgroundColor = '#1e40af')}
                onMouseLeave={(e) => !saving && ((e.target as HTMLElement).style.backgroundColor = '#1e3a5f')}
              >
                {saving ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                Save Changes
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
