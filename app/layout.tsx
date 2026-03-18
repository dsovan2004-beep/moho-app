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

const CITY_DOT: Record<string, string> = {
  'Mountain House': '#2563eb',
  Tracy:            '#16a34a',
  Lathrop:          '#9333ea',
  Manteca:          '#ea580c',
  Brentwood:        '#0d9488',
}

const CITY_SLUGS: Record<string, string> = {
  'Mountain House': 'mountain-house',
  Tracy:            'tracy',
  Lathrop:          'lathrop',
  Manteca:          'manteca',
  Brentwood:        'brentwood',
}

// Explore dropdown items (Best Of + Discover)
const EXPLORE_LINKS = [
  { slug: 'restaurants', label: 'Restaurants', emoji: '🍽️' },
  { slug: 'coffee',      label: 'Coffee',      emoji: '☕' },
  { slug: 'dentists',    label: 'Dentists',    emoji: '🦷' },
  { slug: 'gyms',        label: 'Gyms',        emoji: '🏋️' },
  { slug: 'hair-salons', label: 'Hair Salons', emoji: '💈' },
]

// Community dropdown items
const COMMUNITY_LINKS = [
  { href: '/community',      label: 'Community Board', emoji: '💬' },
  { href: '/activity',       label: 'Activity Feed',   emoji: '📋' },
  { href: '/lost-and-found', label: 'Lost & Found',    emoji: '🐾' },
  { href: '/new-resident',   label: 'New Residents',   emoji: '🏡' },
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

// Shared chevron svg
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className="w-3 h-3 opacity-70 transition-transform"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function NavContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [city, setCity] = useState<string>(() => {
    const urlCity = searchParams.get('city')
    return urlCity && CITIES.includes(urlCity) ? urlCity : 'Mountain House'
  })
  const theme = CITY_THEMES[city] ?? CITY_THEMES['Mountain House']

  useEffect(() => {
    const urlCity = searchParams.get('city')
    if (urlCity && CITIES.includes(urlCity) && urlCity !== city) {
      setCity(urlCity)
    }
  }, [searchParams])

  // Auth state
  const [user, setUser] = useState<User | null>(null)

  // Dropdown open states
  const [profileOpen,    setProfileOpen]    = useState(false)
  const [cityPickerOpen, setCityPickerOpen] = useState(false)
  const [directoryOpen,  setDirectoryOpen]  = useState(false)
  const [exploreOpen,    setExploreOpen]    = useState(false)
  const [communityOpen,  setCommunityOpen]  = useState(false)

  // Mobile dropdown states
  const [exploreMobileOpen,   setExploreMobileOpen]   = useState(false)
  const [communityMobileOpen, setCommunityMobileOpen] = useState(false)

  // Refs for click-outside
  const profileRef       = useRef<HTMLDivElement>(null)
  const cityPickerRef    = useRef<HTMLDivElement>(null)
  const directoryRef     = useRef<HTMLDivElement>(null)
  const exploreRef       = useRef<HTMLDivElement>(null)
  const communityRef     = useRef<HTMLDivElement>(null)
  const exploreMobileRef   = useRef<HTMLDivElement>(null)
  const communityMobileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const t = e.target as Node
      if (profileRef.current       && !profileRef.current.contains(t))       setProfileOpen(false)
      if (cityPickerRef.current    && !cityPickerRef.current.contains(t))    setCityPickerOpen(false)
      if (directoryRef.current     && !directoryRef.current.contains(t))     setDirectoryOpen(false)
      if (exploreRef.current       && !exploreRef.current.contains(t))       setExploreOpen(false)
      if (communityRef.current     && !communityRef.current.contains(t))     setCommunityOpen(false)
      if (exploreMobileRef.current   && !exploreMobileRef.current.contains(t))   setExploreMobileOpen(false)
      if (communityMobileRef.current && !communityMobileRef.current.contains(t)) setCommunityMobileOpen(false)
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
    const params = new URLSearchParams(searchParams.toString())
    params.set('city', c)
    router.push(`${pathname}?${params.toString()}`)
  }

  async function handleSignOut() {
    setProfileOpen(false)
    await signOut()
    setUser(null)
  }

  // Active-state helpers — one tab active at a time
  const isDirectory = pathname === '/directory'
    || /^\/[a-z-]+$/.test(pathname) && !['ask','discover','events','community','activity','lost-and-found','new-resident','submit-business','login','register','profile','admin','best','directory'].includes(pathname.slice(1))
    || /^\/[a-z-]+\/[a-z-]+/.test(pathname) && !pathname.startsWith('/best') && !pathname.startsWith('/community')
  const isExplore   = pathname === '/discover' || pathname.startsWith('/best')
  const isEvents    = pathname === '/events'
  const isCommunity = pathname === '/community' || pathname === '/activity'
    || pathname === '/lost-and-found' || pathname === '/new-resident'
  const isForBiz    = pathname === '/submit-business'
  const isAsk       = pathname === '/ask'

  const navActive   = { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }
  const navInactive = { color: 'rgba(255,255,255,0.8)' }

  function navStyle(active: boolean) {
    return active ? navActive : navInactive
  }

  return (
    <>
      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: theme.bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}>
                MH
              </span>
              <span className="text-white font-extrabold text-lg tracking-tight hidden sm:block">
                MoHo<span style={{ color: '#f59e0b' }}>Local</span>
              </span>
            </Link>

            {/* ── City Selector ── */}
            <div className="relative shrink-0" ref={cityPickerRef}>
              <button
                onClick={() => setCityPickerOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
                aria-label="Select city"
              >
                <span>📍</span>
                <span className="hidden sm:inline">{city}</span>
                <span className="sm:hidden">{city.replace('Mountain House', 'MH')}</span>
                <Chevron open={cityPickerOpen} />
              </button>

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
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CITY_DOT[c] }} />
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

            {/* ── Desktop Nav Links ── */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">

              {/* Directory 🔥 dropdown */}
              <div className="relative" ref={directoryRef}>
                <button
                  onClick={() => setDirectoryOpen((o) => !o)}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap"
                  style={navStyle(isDirectory || directoryOpen)}
                >
                  Directory 🔥
                  <Chevron open={directoryOpen} />
                </button>

                {directoryOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-dropdown">
                    {/* All Listings */}
                    <Link
                      href="/directory"
                      onClick={() => setDirectoryOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <span>📋</span> All Listings
                    </Link>

                    {/* Browse by Category — primary action, directly under All Listings */}
                    <Link
                      href="/directory"
                      onClick={() => setDirectoryOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <span>🗂️</span> Browse by Category
                    </Link>

                    {/* Browse by City */}
                    <div className="px-4 py-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Browse by City</p>
                      <div className="space-y-0.5">
                        {CITIES.map((c) => (
                          <Link
                            key={c}
                            href={`/${CITY_SLUGS[c]}`}
                            onClick={() => setDirectoryOpen(false)}
                            className="flex items-center gap-2.5 py-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CITY_DOT[c] }} />
                            {c}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ask MoHo ✨ */}
              <Link
                href="/ask"
                className="text-sm px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap"
                style={navStyle(isAsk)}
              >
                Ask MoHo ✨
              </Link>

              {/* Explore dropdown */}
              <div className="relative" ref={exploreRef}>
                <button
                  onClick={() => setExploreOpen((o) => !o)}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap"
                  style={navStyle(isExplore || exploreOpen)}
                >
                  Explore
                  <Chevron open={exploreOpen} />
                </button>

                {exploreOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-dropdown">
                    {/* Discover */}
                    <Link
                      href="/discover"
                      onClick={() => setExploreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 font-semibold hover:bg-gray-50 transition border-b border-gray-100"
                    >
                      <span>🗺️</span> Discover
                    </Link>

                    {/* Best Of */}
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Best in {city}</p>
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

              {/* Events */}
              <Link
                href="/events"
                className="text-sm px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap"
                style={navStyle(isEvents)}
              >
                Events
              </Link>

              {/* Community dropdown */}
              <div className="relative" ref={communityRef}>
                <button
                  onClick={() => setCommunityOpen((o) => !o)}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap"
                  style={navStyle(isCommunity || communityOpen)}
                >
                  Community
                  <Chevron open={communityOpen} />
                </button>

                {communityOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-dropdown">
                    {COMMUNITY_LINKS.map(({ href, label, emoji }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setCommunityOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        style={{ fontWeight: pathname === href ? 700 : 400, color: pathname === href ? '#1d4ed8' : undefined }}
                      >
                        <span>{emoji}</span>
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* For Business */}
              <Link
                href="/submit-business"
                className="text-sm px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap"
                style={navStyle(isForBiz)}
              >
                For Business
              </Link>

            </div>

            {/* ── Auth / Profile Area ── */}
            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
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
                      style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div
                      className="absolute right-0 mt-2 w-44 rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                      style={{ backgroundColor: 'white', top: '100%' }}
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
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

        {/* ── Mobile Nav Row ── */}
        <div className="md:hidden border-t border-white/10 flex items-stretch">

          {/* Scrollable primary links */}
          <div className="relative flex-1 min-w-0">
            <div
              className="flex gap-2 pl-3 pr-4 py-2 overflow-x-auto items-center"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                { href: '/directory',      label: 'Directory 🔥' },
                { href: '/ask',            label: 'Ask MoHo ✨' },
                { href: '/events',         label: 'Events' },
                { href: '/submit-business',label: 'For Business' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs whitespace-nowrap font-medium shrink-0"
                  style={pathname === href ? { color: '#f59e0b' } : { color: 'rgba(255,255,255,0.75)' }}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div
              className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none"
              style={{ background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.3))' }}
            />
          </div>

          {/* Community pinned dropdown */}
          <div className="relative shrink-0 border-l border-white/10" ref={communityMobileRef}>
            <button
              onClick={() => setCommunityMobileOpen((o) => !o)}
              className="flex items-center gap-1 text-xs font-medium whitespace-nowrap h-full px-3"
              style={{ color: communityMobileOpen ? '#f59e0b' : 'rgba(255,255,255,0.75)' }}
            >
              Community
              <svg
                className="w-2.5 h-2.5 opacity-70 transition-transform"
                style={{ transform: communityMobileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {communityMobileOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-dropdown">
                {COMMUNITY_LINKS.map(({ href, label, emoji }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setCommunityMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <span>{emoji}</span>
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Explore pinned dropdown */}
          <div className="relative shrink-0 border-l border-white/10" ref={exploreMobileRef}>
            <button
              onClick={() => setExploreMobileOpen((o) => !o)}
              className="flex items-center gap-1 text-xs font-medium whitespace-nowrap h-full px-3"
              style={{ color: exploreMobileOpen ? '#f59e0b' : 'rgba(255,255,255,0.75)' }}
            >
              Explore
              <svg
                className="w-2.5 h-2.5 opacity-70 transition-transform"
                style={{ transform: exploreMobileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {exploreMobileOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-dropdown">
                <Link
                  href="/discover"
                  onClick={() => setExploreMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 font-semibold hover:bg-gray-50 transition border-b border-gray-100"
                >
                  <span>🗺️</span> Discover
                </Link>
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Best in {city}</p>
                </div>
                {EXPLORE_LINKS.map(({ slug, label, emoji }) => (
                  <Link
                    key={slug}
                    href={`/best/${slug}/${city.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setExploreMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <span>{emoji}</span>
                    <span>Best {label}</span>
                  </Link>
                ))}
                <div className="border-t border-gray-100 px-4 py-2.5">
                  <Link
                    href="/directory"
                    onClick={() => setExploreMobileOpen(false)}
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
                    { label: '✨ Ask MoHo',        href: '/ask' },
                    { label: '🗺️ Discover',        href: '/discover' },
                    { label: 'Community Board',   href: '/community' },
                    { label: 'Events Calendar',   href: '/events' },
                    { label: 'Lost & Found',      href: '/lost-and-found' },
                    { label: 'New Resident Guide', href: '/new-resident' },
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
