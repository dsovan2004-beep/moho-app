'use client'

export const runtime = 'edge'

import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, Suspense } from 'react'
import { getSupabaseClient, signOut } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import './globals.css'

const CITIES = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca', 'Brentwood']

const CITY_THEMES: Record<string, { bg: string; accent: string; light: string; county: string }> = {
  'Mountain House': {
    bg: '#1e3a5f',
    accent: '#2563eb',
    light: '#eff6ff',
    county: 'San Joaquin County',
  },
  Tracy: {
    bg: '#14532d',
    accent: '#16a34a',
    light: '#f0fdf4',
    county: 'San Joaquin County',
  },
  Lathrop: {
    bg: '#581c87',
    accent: '#9333ea',
    light: '#fdf4ff',
    county: 'San Joaquin County',
  },
  Manteca: {
    bg: '#7c2d12',
    accent: '#ea580c',
    light: '#fff7ed',
    county: 'San Joaquin County',
  },
  Brentwood: {
    bg: '#134e4a',
    accent: '#0d9488',
    light: '#f0fdfa',
    county: 'Contra Costa County',
  },
}

// Small color dot shown in the city picker dropdown
const CITY_DOT: Record<string, string> = {
  'Mountain House': '#2563eb',
  Tracy:            '#16a34a',
  Lathrop:          '#9333ea',
  Manteca:          '#ea580c',
  Brentwood:        '#0d9488',
}

const NAV_LINKS = [
  { href: '/directory',    label: 'Directory' },
  { href: '/community',    label: 'Community' },
  { href: '/events',       label: 'Events' },
  { href: '/new-resident', label: '🏡 New Residents' },
  { href: '/lost-and-found', label: 'Lost & Found' },
  { href: '/activity',     label: 'Activity' },
]

const EXPLORE_LINKS = [
  { slug: 'restaurants', label: 'Restaurants', emoji: '🍽️' },
  { slug: 'coffee',      label: 'Coffee',      emoji: '☕' },
  { slug: 'dentists',    label: 'Dentists',    emoji: '🦷' },
  { slug: 'gyms',        label: 'Gyms',        emoji: '🏋️' },
  { slug: 'hair-salons', label: 'Hair Salons', emoji: '💈' },
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
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialise city from URL param if valid, otherwise default to Mountain House
  const [city, setCity] = useState<string>(() => {
    const urlCity = searchParams.get('city')
    return urlCity && CITIES.includes(urlCity) ? urlCity : 'Mountain House'
  })
  const theme = CITY_THEMES[city] ?? CITY_THEMES['Mountain House']

  // Sync city state if the URL ?city= param changes (e.g. user clicks a nav link)
  useEffect(() => {
    const urlCity = searchParams.get('city')
    if (urlCity && CITIES.includes(urlCity) && urlCity !== city) {
      setCity(urlCity)
    }
  }, [searchParams])

  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // City picker state
  const [cityPickerOpen, setCityPickerOpen] = useState(false)
  const cityPickerRef = useRef<HTMLDivElement>(null)

  // Explore dropdown state
  const [exploreOpen, setExploreOpen] = useState(false)
  const exploreRef = useRef<HTMLDivElement>(null)

  // Mobile Best Of dropdown state
  const [bestOfMobileOpen, setBestOfMobileOpen] = useState(false)
  const bestOfMobileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close dropdowns when clicking/tapping outside (mousedown + touchstart for Android)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false)
      }
      if (cityPickerRef.current && !cityPickerRef.current.contains(target)) {
        setCityPickerOpen(false)
      }
      if (exploreRef.current && !exploreRef.current.contains(target)) {
        setExploreOpen(false)
      }
      if (bestOfMobileRef.current && !bestOfMobileRef.current.contains(target)) {
        setBestOfMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  function handleCitySelect(c: string) {
    setCity(c)
    setCityPickerOpen(false)
    // Merge new city into current URL params so filters on the current page update
    const params = new URLSearchParams(searchParams.toString())
    params.set('city', c)
    router.push(`${pathname}?${params.toString()}`)
  }

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
          <div className="flex items-center justify-between h-16 gap-3">

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

            {/* ── City Selector Dropdown ── */}
            <div className="relative shrink-0" ref={cityPickerRef}>
              <button
                onClick={() => setCityPickerOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
                aria-label="Select city"
              >
                <span>📍</span>
                {/* Full name on sm+, first word only on xs */}
                <span className="hidden sm:inline">{city}</span>
                <span className="sm:hidden">{city.split(' ')[0]}</span>
                <svg
                  className="w-3 h-3 opacity-70 transition-transform"
                  style={{ transform: cityPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* City picker panel */}
              {cityPickerOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Select your city</p>
                  </div>
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleCitySelect(c)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50"
                      style={{ color: city === c ? CITY_DOT[c] : '#374151', fontWeight: city === c ? 700 : 400 }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CITY_DOT[c] }}
                      />
                      {c}
                      {city === c && (
                        <svg className="ml-auto w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nav Links — desktop */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
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

              {/* Explore dropdown */}
              <div className="relative" ref={exploreRef}>
                <button
                  onClick={() => setExploreOpen((o) => !o)}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap"
                  style={
                    exploreOpen
                      ? { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
                      : { color: 'rgba(255,255,255,0.8)' }
                  }
                >
                  ⭐ Best Of
                  <svg
                    className="w-3 h-3 opacity-70 transition-transform"
                    style={{ transform: exploreOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {exploreOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Best in {city}
                      </p>
                    </div>
                    {EXPLORE_LINKS.map(({ slug, label, emoji }) => (
                      <Link
                        key={slug}
                        href={`/best/${slug}/${city.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setExploreOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <span>{emoji}</span>
                        <span>Best {label}</span>
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 px-4 py-2.5">
                      <Link
                        href="/directory"
                        onClick={() => setExploreOpen(false)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Browse all categories →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Auth Area */}
            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 px-2 py-1 rounded-full transition-all"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                  >
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
                    <span className="text-white text-sm font-medium hidden sm:block">
                      {getUserDisplayName(user)}
                    </span>
                    <svg
                      className="w-3.5 h-3.5 text-white/70 transition-transform"
                      style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

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
        <div className="md:hidden border-t border-white/10 flex items-stretch">

          {/* Scrollable section — nav links only, no dropdowns inside overflow container */}
          <div className="flex gap-3 px-4 py-2 overflow-x-auto items-center flex-1 min-w-0">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs whitespace-nowrap font-medium shrink-0"
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

          {/* Best Of — outside overflow container so dropdown renders freely */}
          <div className="relative shrink-0 border-l border-white/10" ref={bestOfMobileRef}>
            <button
              onClick={() => setBestOfMobileOpen((o) => !o)}
              className="flex items-center gap-1 text-xs font-medium whitespace-nowrap h-full px-3"
              style={{ color: bestOfMobileOpen ? '#f59e0b' : 'rgba(255,255,255,0.75)' }}
            >
              ⭐ Best Of
              <svg
                className="w-2.5 h-2.5 opacity-70 transition-transform"
                style={{ transform: bestOfMobileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {bestOfMobileOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Best in {city}
                  </p>
                </div>
                {EXPLORE_LINKS.map(({ slug, label, emoji }) => (
                  <Link
                    key={slug}
                    href={`/best/${slug}/${city.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setBestOfMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <span>{emoji}</span>
                    <span>Best {label}</span>
                  </Link>
                ))}
                <div className="border-t border-gray-100 px-4 py-2.5">
                  <Link
                    href="/directory"
                    onClick={() => setBestOfMobileOpen(false)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Browse all categories →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* City Banner */}
      <div
        className="py-2 px-4 text-center text-sm font-medium text-white/90"
        style={{ backgroundColor: theme.accent }}
      >
        📍 Showing results for <strong>{city}</strong> · {theme.county}
      </div>
    </>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>MoHoLocal — Local Community Directory</title>
        <meta name="description" content="Local directory, events, and community for Mountain House, Tracy, Lathrop, Manteca, and Brentwood." />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        <Suspense fallback={null}>
          <NavContent />
        </Suspense>
        <main>{children}</main>
        <footer className="bg-gray-900 text-gray-400 text-sm mt-16">
          {/* ── Main 4-column grid ── */}
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

              {/* Col 1 — Brand */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}>MH</span>
                  <span className="text-white font-extrabold text-lg tracking-tight">
                    MoHo<span style={{ color: '#f59e0b' }}>Local</span>
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  Find local businesses, connect with neighbors, and discover what&apos;s happening nearby.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Mountain House', slug: 'mountain-house', color: '#2563eb' },
                    { label: 'Tracy',          slug: 'tracy',          color: '#16a34a' },
                    { label: 'Lathrop',        slug: 'lathrop',        color: '#9333ea' },
                    { label: 'Manteca',        slug: 'manteca',        color: '#ea580c' },
                    { label: 'Brentwood',      slug: 'brentwood',      color: '#0d9488' },
                  ].map(({ label, color }) => (
                    <span
                      key={label}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Col 2 — Directory */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Directory</h3>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Home Services',    href: '/directory?category=Home+Services' },
                    { label: 'Restaurants',       href: '/directory?category=Restaurants' },
                    { label: 'Health & Wellness', href: '/directory?category=Health+%26+Wellness' },
                    { label: 'Pet Services',      href: '/directory?category=Pet+Services' },
                    { label: 'All Categories',    href: '/directory' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-gray-400 hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3 — Community */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Community</h3>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Community Board',   href: '/community' },
                    { label: 'Events Calendar',   href: '/events' },
                    { label: 'Lost & Found',      href: '/lost-and-found' },
                    { label: 'New Resident Guide', href: '/new-resident' },
                    { label: 'Activity Feed',     href: '/activity' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-gray-400 hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 4 — Business Owners */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Business Owners</h3>
                <ul className="space-y-2.5">
                  {[
                    { label: 'List Your Business', href: '/submit-business' },
                    { label: 'Claim a Listing',    href: '/submit-business' },
                    { label: 'Featured Listings',  href: '/submit-business' },
                    { label: 'Contact Us',         href: '/submit-business' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-gray-400 hover:text-white transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* CTA pill */}
                <div className="mt-6">
                  <Link
                    href="/submit-business"
                    className="inline-block text-xs font-bold px-4 py-2 rounded-full transition-all"
                    style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
                  >
                    + List Your Business Free
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom utility row ── */}
          <div className="border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-600 text-center sm:text-left">
                © {new Date().getFullYear()} MoHoLocal · Serving Mountain House, Tracy, Lathrop, Manteca &amp; Brentwood
              </p>
              <div className="flex items-center gap-4">
                {[
                  { label: 'Privacy', href: '/privacy' },
                  { label: 'Terms',   href: '/terms' },
                  { label: 'Contact', href: '/submit-business' },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} className="text-xs text-gray-600 hover:text-gray-300 transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
