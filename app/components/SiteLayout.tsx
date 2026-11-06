'use client'
import {removeThisPushDevice} from '@/lib/notification-settings'


import Link from 'next/link'
import {MessageBadge,MessageAlertSummary} from './MessageAlerts'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, Suspense } from 'react'
import { getSupabaseClient, signOut } from '@/lib/supabase'
import { CITIES as CITY_CONFIG, RELAUNCH_CITY_NAMES } from '@/lib/cities'
import { OPERATOR_CONTACT } from '@/lib/site-policy'
import type { User } from '@supabase/supabase-js'

const CITIES = CITY_CONFIG.map(city => city.name)

const SOUTH_BAY_CITIES = new Set(['San Jose', 'Santa Clara', 'Sunnyvale'])

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
  // South Bay — FIFA / discovery traffic expansion
  'San Jose': {
    bg: '#1e3a5f',
    accent: '#0369a1',
    light: '#f0f9ff',
    county: 'Santa Clara County',
  },
  'Santa Clara': {
    bg: '#7e1d1d',
    accent: '#b91c1c',
    light: '#fef2f2',
    county: 'Santa Clara County',
  },
  Sunnyvale: {
    bg: '#78350f',
    accent: '#d97706',
    light: '#fffbeb',
    county: 'Santa Clara County',
  },
}

const CITY_DOT: Record<string, string> = {
  'Mountain House': '#2563eb',
  Tracy:            '#16a34a',
  Lathrop:          '#9333ea',
  Manteca:          '#ea580c',
  Brentwood:        '#0d9488',
  // South Bay
  'San Jose':       '#0369a1',
  'Santa Clara':    '#b91c1c',
  Sunnyvale:        '#d97706',
}

const CITY_SLUGS: Record<string, string> = {
  'Mountain House': 'mountain-house',
  Tracy:            'tracy',
  Lathrop:          'lathrop',
  Manteca:          'manteca',
  Brentwood:        'brentwood',
  // South Bay
  'San Jose':       'san-jose',
  'Santa Clara':    'santa-clara',
  Sunnyvale:        'sunnyvale',
}

// Reverse map: slug → display city name (for getCityFromPath)
const SLUG_TO_CITY: Record<string, string> = {
  'mountain-house': 'Mountain House',
  'tracy':          'Tracy',
  'lathrop':        'Lathrop',
  'manteca':        'Manteca',
  'brentwood':      'Brentwood',
  'san-jose':       'San Jose',
  'santa-clara':    'Santa Clara',
  'sunnyvale':      'Sunnyvale',
}

function getCityFromPath(path: string): string | null {
  // Extract first segment: '/san-jose/restaurants' → 'san-jose'
  const segment = path.split('/')[1] ?? ''
  return SLUG_TO_CITY[segment] ?? null
}

// Explore dropdown items (Best Of + Discover)
const EXPLORE_LINKS = [
  { slug: 'restaurants', label: 'Restaurants', emoji: '🍽️' },
  { slug: 'health-wellness', label: 'Health & wellness', emoji: '🦷' },
  { slug: 'home-services', label: 'Home services', emoji: '🔧' },
  { slug: 'beauty-spa', label: 'Beauty & spa', emoji: '💈' },
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
    // 1. Derive from pathname first (highest priority)
    const pathCity = getCityFromPath(pathname)
    if (pathCity) return pathCity
    // 2. Fall back to ?city= query param
    const urlCity = searchParams.get('city')
    if (urlCity && CITIES.includes(urlCity)) return urlCity
    // 3. Default
    return 'Mountain House'
  })
  const theme = CITY_THEMES[city] ?? CITY_THEMES['Mountain House']
  const requestedCity = getCityFromPath(pathname) ?? searchParams.get('city')
  const explicitCity = requestedCity && CITIES.includes(requestedCity) ? requestedCity : null

  // Sync city state whenever the route changes
  useEffect(() => {
    const pathCity = getCityFromPath(pathname)
    if (pathCity) {
      // Path wins — /san-jose always → San Jose
      if (pathCity !== city) setCity(pathCity)
      return
    }
    // Non-city path — fall back to ?city= param
    const urlCity = searchParams.get('city')
    if (urlCity && CITIES.includes(urlCity) && urlCity !== city) {
      setCity(urlCity)
    }
  }, [pathname, searchParams])

  // Auth state
  const [user, setUser] = useState<User | null>(null)

  // Dropdown open states
  const [profileOpen,    setProfileOpen]    = useState(false)
  const [cityPickerOpen, setCityPickerOpen] = useState(false)
  const [directoryOpen,  setDirectoryOpen]  = useState(false)
  const [exploreOpen,    setExploreOpen]    = useState(false)
  const [communityOpen,  setCommunityOpen]  = useState(false)

  // Mobile dropdown states

  // Refs for click-outside
  const profileRef       = useRef<HTMLDivElement>(null)
  const cityPickerRef    = useRef<HTMLDivElement>(null)
  const directoryRef     = useRef<HTMLDivElement>(null)
  const exploreRef       = useRef<HTMLDivElement>(null)
  const communityRef     = useRef<HTMLDivElement>(null)

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
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      const refs = [profileRef, cityPickerRef, directoryRef, exploreRef, communityRef]
      const focusedGroup = refs.find(ref => ref.current?.contains(document.activeElement))
      setProfileOpen(false); setCityPickerOpen(false); setDirectoryOpen(false); setExploreOpen(false); setCommunityOpen(false)
      focusedGroup?.current?.querySelector('button')?.focus()
    }
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  function handleCitySelect(c: string) {
    setCity(c)
    setCityPickerOpen(false)
    // Navigate to the city's root page so pathname-based sync stays consistent.
    // If user is on a city/category page (e.g. /mountain-house/restaurants)
    // and switches to Tracy, take them to /tracy — not /mountain-house/restaurants?city=Tracy.
    const currentCityFromPath = getCityFromPath(pathname)
    if (currentCityFromPath) {
      // On a city page — jump to new city root
      router.push(`/${CITY_SLUGS[c]}`)
    } else {
      // On a global page (directory, events, etc.) — keep path, update ?city=
      const params = new URLSearchParams(searchParams.toString())
      params.set('city', c)
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  async function handleSignOut() {
    setProfileOpen(false)
    try { await removeThisPushDevice() } catch { /* Sign out still completes; alerts contain no private content. */ }
    await signOut()
    setUser(null)
  }

  // Active-state helpers — one tab active at a time
  const isDirectory = pathname === '/directory'
    || /^\/[a-z-]+$/.test(pathname) && !['ask','discover','events','community','activity','lost-and-found','new-resident','submit-business','login','register','profile','admin','best','directory','messages','my-pet-reports','privacy','terms','my-requests'].includes(pathname.slice(1))
    || /^\/[a-z-]+\/[a-z-]+/.test(pathname) && !pathname.startsWith('/best') && !pathname.startsWith('/community')
  const isExplore   = pathname === '/discover' || pathname.startsWith('/best')
  const isEvents    = pathname === '/events'
  const isCommunity = pathname === '/community' || pathname === '/activity'
    || pathname.startsWith('/lost-and-found') || pathname === '/messages' || pathname === '/new-resident'
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}>
                MH
              </span>
              <span className="text-white font-extrabold text-sm sm:text-lg tracking-tight">
                MoHo<span style={{ color: '#f59e0b' }}>Local</span>
              </span>
            </Link>

            {/* ── City Selector ── */}
            <div className="relative shrink-0" ref={cityPickerRef}>
              <button
                onClick={() => setCityPickerOpen((o) => !o)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
                aria-label="Select city"
                aria-expanded={cityPickerOpen}
              >
                <span className="hidden sm:inline">📍</span>
                <span className="hidden sm:inline">{city}</span>
                <span className="sm:hidden max-w-[64px] truncate">{city.replace('Mountain House', 'MH')}</span>
                <Chevron open={cityPickerOpen} />
              </button>

              {cityPickerOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* 209 / San Joaquin Section */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">209 · San Joaquin</p>
                  </div>
                  {CITIES.filter(c => !SOUTH_BAY_CITIES.has(c)).map((c) => (
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

                  {/* South Bay Section */}
                  <div className="px-4 py-2 border-t border-b border-gray-100 bg-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Other nearby cities</p>
                  </div>
                  {CITIES.filter(c => SOUTH_BAY_CITIES.has(c)).map((c) => (
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
            <div className="hidden xl:flex items-center gap-1 flex-1 justify-center">

              {/* Directory dropdown */}
              <div className="relative" ref={directoryRef}>
                <button
                  aria-expanded={directoryOpen}
                  onClick={() => setDirectoryOpen((o) => !o)}
                  className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap"
                  style={navStyle(isDirectory || directoryOpen)}
                >
                  Directory
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
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">209 · San Joaquin</p>
                      <div className="space-y-0.5 mb-2">
                        {CITIES.filter(c => !SOUTH_BAY_CITIES.has(c)).map((c) => (
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
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 pt-2 border-t border-gray-100">Other nearby cities</p>
                      <div className="space-y-0.5">
                        {CITIES.filter(c => SOUTH_BAY_CITIES.has(c)).map((c) => (
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
                  aria-expanded={exploreOpen}
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
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Explore {city}</p>
                    </div>
                    {EXPLORE_LINKS.map(({ slug, label, emoji }) => (
                      <Link
                        key={slug}
                        href={`/${CITY_SLUGS[city]}/${slug}`}
                        onClick={() => setExploreOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <span>{emoji}</span>
                        <span>{label}</span>
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
                  aria-expanded={communityOpen}
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
                    aria-expanded={profileOpen}
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
                      <Link href="/messages" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Private messages<MessageBadge/></Link>
                      <Link href="/my-pet-reports" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">My pet reports</Link>
                      <Link href="/my-requests" onClick={() => setProfileOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">My business requests</Link>
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

        <div className="xl:hidden grid grid-cols-4 border-t border-white/15" aria-label="Mobile navigation">
          {[
            { href: `/directory?city=${encodeURIComponent(city)}`, label: 'Find help' },
            { href: `/lost-and-found?city=${encodeURIComponent(city)}`, label: 'Pets' },
            { href: `/community?city=${encodeURIComponent(city)}`, label: 'Community' },
            { href: user ? '/messages' : '/login', label: user ? 'Messages' : 'Sign in' },
          ].map(item => <Link key={item.label} href={item.href} className="min-h-12 flex items-center justify-center text-xs font-semibold text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300">{item.label}{item.href==='/messages'&&<MessageBadge/>}</Link>)}
        </div>
      </nav>

      <MessageAlertSummary/>
      {/* City Banner */}
      <div
        className="py-2 px-4 text-center text-sm font-medium text-slate-700 border-b border-slate-200"
        style={{ backgroundColor: '#f6f3eb' }}
      >
        {explicitCity ? <>Browsing <strong>{explicitCity}</strong> · {theme.county}</> : 'Local help across Mountain House, Tracy, Lathrop & Manteca'}
      </div>
    </>
  )
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:p-3 focus:text-slate-900">Skip to content</a>
        <Suspense fallback={null}>
          <NavContent />
        </Suspense>
        <main id="main-content" tabIndex={-1}>{children}</main>
        <footer className="bg-gray-900 text-gray-400 text-sm mt-16">
          {/* ── Main 4-column grid ── */}
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

              {/* Col 1 — Brand */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="hidden sm:inline text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}>MH</span>
                  <span className="text-white font-extrabold text-lg tracking-tight">
                    MoHo<span style={{ color: '#f59e0b' }}>Local</span>
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  Find local businesses, connect with neighbors, and discover what&apos;s happening nearby.
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Our communities</p>
                <nav aria-label="Footer communities" className="grid grid-cols-2 gap-2 max-w-xs">
                  {CITY_CONFIG.filter(city => RELAUNCH_CITY_NAMES.some(name => name === city.name)).map(city => (
                    <Link
                      key={city.slug}
                      href={`/${city.slug}`}
                      className="min-h-11 flex items-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                    >
                      {city.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Col 2 — Directory */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">Directory</h3>
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
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">Community</h3>
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
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">Business Owners</h3>
                <ul className="space-y-2.5">
                  {[
                    { label: 'List Your Business', href: '/submit-business' },
                    { label: 'Find Your Listing to Claim', href: '/directory' },
                    { label: 'Contact Us',         href: `mailto:${OPERATOR_CONTACT}?subject=MoHoLocal` },
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
              <p className="text-xs text-gray-400 text-center sm:text-left">
                © {new Date().getFullYear()} MoHoLocal · Serving Mountain House, Tracy, Lathrop &amp; Manteca
              </p>
              <div className="flex items-center gap-4">
                {[
                  { label: 'Privacy', href: '/privacy' },
                  { label: 'Terms',   href: '/terms' },
                  { label: 'Contact', href: `mailto:${OPERATOR_CONTACT}?subject=MoHoLocal` },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} className="text-xs text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
    </>
  )
}
