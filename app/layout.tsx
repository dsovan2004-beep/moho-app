'use client'

export const runtime = 'edge'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef, Suspense } from 'react'
import { getSupabaseClient, signOut } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import './globals.css'

const CITIES = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca']

const CITY_THEMES: Record<string, { bg: string; accent: string; light: string; banner: string }> = {
  'Mountain House': {
    bg: '#1e3a5f',
    accent: '#2563eb',
    light: '#eff6ff',
    banner: 'bg-blue-800',
  },
  Tracy: {
    bg: '#14532d',
    accent: '#16a34a',
    light: '#f0fdf4',
    banner: 'bg-green-800',
  },
  Lathrop: {
    bg: '#581c87',
    accent: '#9333ea',
    light: '#fdf4ff',
    banner: 'bg-purple-800',
  },
  Manteca: {
    bg: '#7c2d12',
    accent: '#ea580c',
    light: '#fff7ed',
    banner: 'bg-orange-800',
  },
}

const NAV_LINKS = [
  { href: '/directory', label: 'Directory' },
  { href: '/community', label: 'Community' },
  { href: '/events', label: 'Events' },
  { href: '/lost-and-found', label: 'Lost & Found Pets' },
  { href: '/new-resident', label: 'New Resident' },
]

function getUserDisplayName(user: User): string {
  return (
    user.user_metadata?.full_name?.split(' ')[0] ||
    user.user_metadata?.name?.split(' ')[0] ||
    user.email?.split('@')[0] ||
    'You'
  )
}

function getUserInitial(user: User): string {
  const name = getUserDisplayName(user)
  return name[0].toUpperCase()
}

function getUserAvatar(user: User): string | null {
  return user.user_metadata?.avatar_url || null
}

function NavContent() {
  const pathname = usePathname()
  const [city, setCity] = useState('Mountain House')
  const theme = CITY_THEMES[city]

  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Get initial session
    const supabase = getSupabaseClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    setDropdownOpen(false)
    await signOut()
    setUser(null)
  }

  return (
    <>
      {/* Sticky Nav */}
      <nav
        className="sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span
                className="text-xs font-bold px-2 py-1 rounded"
                style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
              >
                MH
              </span>
              <span className="text-white font-extrabold text-lg tracking-tight hidden sm:block">
                MoHo<span style={{ color: '#f59e0b' }}>Local</span>
              </span>
            </Link>

            {/* City Switcher */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {CITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
                  style={
                    city === c
                      ? { backgroundColor: '#f59e0b', color: '#1e3a5f' }
                      : { color: 'rgba(255,255,255,0.75)', backgroundColor: 'rgba(255,255,255,0.1)' }
                  }
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={`${link.href}?city=${encodeURIComponent(city)}`}
                  className="text-sm px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap"
                  style={
                    pathname === link.href
                      ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
                      : { color: 'rgba(255,255,255,0.8)' }
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Area */}
            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                /* ── Logged-in: Avatar + Dropdown ── */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 px-2 py-1 rounded-full transition-all"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                  >
                    {/* Avatar */}
                    {getUserAvatar(user) ? (
                      <img
                        src={getUserAvatar(user)!}
                        alt={getUserDisplayName(user)}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
                      >
                        {getUserInitial(user)}
                      </div>
                    )}
                    {/* First name — hidden on very small screens */}
                    <span className="text-white text-sm font-medium hidden sm:block">
                      {getUserDisplayName(user)}
                    </span>
                    {/* Chevron */}
                    <svg
                      className="w-3.5 h-3.5 text-white/70 transition-transform"
                      style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-44 rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                      style={{ backgroundColor: 'white', top: '100%' }}
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Logged-out: Login + Join ── */
                <>
                  <Link
                    href="/login"
                    className="text-sm text-white/80 hover:text-white px-3 py-1.5 rounded-md transition hidden sm:block"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-semibold px-4 py-1.5 rounded-full transition whitespace-nowrap"
                    style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
                  >
                    Join Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav links */}
        <div className="md:hidden border-t border-white/10 px-4 py-2 flex gap-3 overflow-x-auto">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={`${link.href}?city=${encodeURIComponent(city)}`}
              className="text-xs whitespace-nowrap font-medium"
              style={
                pathname === link.href
                  ? { color: '#f59e0b' }
                  : { color: 'rgba(255,255,255,0.75)' }
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* City Banner */}
      <div
        className="py-2 px-4 text-center text-sm font-medium text-white/90"
        style={{ backgroundColor: theme.accent }}
      >
        📍 Showing results for <strong>{city}</strong> · San Joaquin County
      </div>
    </>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>MoHoLocal — San Joaquin County Community</title>
        <meta name="description" content="Local directory, events, and community for Mountain House, Tracy, Lathrop, and Manteca." />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        <Suspense fallback={null}>
          <NavContent />
        </Suspense>
        <main>{children}</main>
        <footer className="bg-gray-900 text-gray-400 text-sm py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="font-semibold text-white mb-1">MoHoLocal</p>
            <p>Connecting Mountain House, Tracy, Lathrop &amp; Manteca</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
