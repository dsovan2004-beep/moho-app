'use client'

export const runtime = 'edge'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
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
  { href: '/lost-and-found', label: 'Lost & Found' },
]

function NavContent() {
  const pathname = usePathname()
  const [city, setCity] = useState('Mountain House')
  const theme = CITY_THEMES[city]

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
                  className="text-sm px-3 py-1.5 rounded-md transition-all font-medium"
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

            {/* Auth Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button className="text-sm text-white/80 hover:text-white px-3 py-1.5 rounded-md transition hidden sm:block">
                Login
              </button>
              <button
                className="text-sm font-semibold px-4 py-1.5 rounded-full transition"
                style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
              >
                Join
              </button>
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
            <p>Connecting Mountain House, Tracy, Lathrop & Manteca</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
