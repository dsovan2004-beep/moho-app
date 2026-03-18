export const runtime = 'edge'

import { getSupabaseClient } from '@/lib/supabase'
import { CITIES, CITIES_209, CITIES_SOUTH_BAY } from '@/lib/cities'
import Link from 'next/link'

const CATEGORIES = [
  { name: 'Restaurants',       slug: 'restaurants',    emoji: '🍽️' },
  { name: 'Home Services',     slug: 'home-services',  emoji: '🔧' },
  { name: 'Health & Wellness', slug: 'health-wellness',emoji: '🏥' },
  { name: 'Automotive',        slug: 'automotive',     emoji: '🚗' },
  { name: 'Beauty & Spa',      slug: 'beauty-spa',     emoji: '💇' },
  { name: 'Pet Services',      slug: 'pet-services',   emoji: '🐾' },
  { name: 'Education',         slug: 'education',      emoji: '🏫' },
  { name: 'Real Estate',       slug: 'real-estate',    emoji: '🏠' },
  { name: 'Retail',            slug: 'retail',         emoji: '🛍️' },
]

// ── SEO ───────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Discover Local Businesses by City & Category | MoHoLocal',
  description:
    'Find local businesses across Mountain House, Tracy, Lathrop, Manteca, Brentwood, San Jose, Santa Clara, and Sunnyvale. Browse restaurants, home services, health, automotive, beauty, and more.',
  openGraph: {
    title: 'Explore the 209 & South Bay | MoHoLocal',
    description:
      'Your regional guide to local businesses across the 209 and South Bay. Pick your city and category to find exactly what you need.',
    url: 'https://www.moholocal.com/discover',
    siteName: 'MoHoLocal',
  },
}

// ── Data ──────────────────────────────────────────────────────────────────────

async function getCountMatrix(): Promise<Record<string, Record<string, number>>> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('city, category')
    .eq('status', 'approved')
    .eq('verified', true)

  if (error || !data) return {}

  const matrix: Record<string, Record<string, number>> = {}
  for (const row of data) {
    if (!matrix[row.city]) matrix[row.city] = {}
    matrix[row.city][row.category] = (matrix[row.city][row.category] ?? 0) + 1
  }
  return matrix
}

async function getTotals(): Promise<Record<string, number>> {
  const supabase = getSupabaseClient()
  const { data } = await supabase
    .from('businesses')
    .select('city')
    .eq('status', 'approved')
    .eq('verified', true)

  if (!data) return {}
  const totals: Record<string, number> = {}
  for (const row of data) {
    totals[row.city] = (totals[row.city] ?? 0) + 1
  }
  return totals
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DiscoverPage() {
  const [matrix, totals] = await Promise.all([getCountMatrix(), getTotals()])

  // Schema.org SiteLinksSearchBox / ItemList for SEO
  const cityListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'MoHoLocal — Cities',
    itemListElement: CITIES.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${c.name}, CA`,
      url: `https://www.moholocal.com/${c.slug}`,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityListSchema) }}
      />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Breadcrumb ── */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">Discover</span>
        </nav>

        {/* ── Hero ── */}
        <div className="rounded-2xl px-6 sm:px-10 py-10 mb-10 text-white"
          style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 60%,#1e3a5f 100%)' }}>
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
            209 Area · San Joaquin + East Bay
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Explore Local Businesses
          </h1>
          <p className="text-white/75 text-sm max-w-xl leading-relaxed mb-5">
            Find restaurants, services, and shops across the 209 and South Bay — Mountain House, Tracy, Lathrop, Manteca, Brentwood, San Jose, Santa Clara &amp; Sunnyvale.
          </p>

          {/* Search bar — routes to /directory?q= which already handles the param */}
          <form
            action="/directory"
            method="GET"
            className="flex gap-2 max-w-xl mb-4"
          >
            <input
              type="text"
              name="q"
              placeholder="Search restaurants, tacos, dentist, plumber…"
              autoComplete="off"
              className="flex-1 min-w-0 px-4 py-3 rounded-xl text-gray-900 text-sm outline-none border-0 focus:ring-2 focus:ring-amber-300 placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="shrink-0 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-[#1e3a5f] font-bold px-5 py-3 rounded-xl text-sm whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
            >
              Search
            </button>
          </form>

          <p className="text-white/55 text-sm leading-relaxed">
            Start by searching, or choose a city and category below to browse local businesses.
          </p>
        </div>

        {/* ── City cards ── */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Choose Your City</h2>

          {/* 209 / San Joaquin */}
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">209 · San Joaquin &amp; East Bay</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {CITIES_209.map((city) => {
              const total = totals[city.name] ?? 0
              return (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="group rounded-2xl p-5 text-white relative overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all block"
                  style={{ background: city.gradient }}
                >
                  <div className="text-3xl mb-2">{city.emoji}</div>
                  <div className="font-extrabold text-base mb-0.5">{city.name}</div>
                  <div className="text-[11px] opacity-60 mb-3">{city.county}</div>
                  <div className="text-xs opacity-80">{city.tagline}</div>
                  {total > 0 && (
                    <div className="absolute bottom-3 right-4 text-xs font-bold opacity-70">
                      {total} listings
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* South Bay / FIFA 2026 */}
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">South Bay · ⚽ FIFA World Cup 2026</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CITIES_SOUTH_BAY.map((city) => {
              const total = totals[city.name] ?? 0
              return (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="group rounded-2xl p-5 text-white relative overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all block"
                  style={{ background: city.gradient }}
                >
                  <div className="text-3xl mb-2">{city.emoji}</div>
                  <div className="font-extrabold text-base mb-0.5">{city.name}</div>
                  <div className="text-[11px] opacity-60 mb-3">{city.county}</div>
                  <div className="text-xs opacity-80">{city.tagline}</div>
                  {total > 0 && (
                    <div className="absolute bottom-3 right-4 text-xs font-bold opacity-70">
                      {total} listings
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── City × Category matrix ── */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Browse by City &amp; Category
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Tap any tile to see local businesses in that category for that city.
          </p>

          {/* Desktop: full matrix table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-separate border-spacing-1.5">
              <thead>
                <tr>
                  <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 pl-1 w-36">
                    Category
                  </th>
                  {CITIES.map((city) => (
                    <th key={city.slug} className="text-center pb-2">
                      <Link
                        href={`/${city.slug}`}
                        className="inline-flex flex-col items-center gap-0.5 hover:opacity-75 transition"
                      >
                        <span className="text-lg">{city.emoji}</span>
                        <span className="text-[11px] font-bold text-gray-600">{city.name}</span>
                        {city.region === 'south-bay' && (
                          <span className="text-[9px] text-gray-400 font-normal leading-none mt-0.5">🍽️ dining</span>
                        )}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat) => (
                  <tr key={cat.slug}>
                    <td className="pl-1">
                      <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </span>
                    </td>
                    {CITIES.map((city) => {
                      const count = matrix[city.name]?.[cat.name] ?? 0
                      return (
                        <td key={city.slug} className="text-center">
                          {count > 0 ? (
                            <Link
                              href={`/${city.slug}/${cat.slug}`}
                              className={`inline-flex flex-col items-center justify-center w-full min-h-[52px] rounded-xl border text-xs font-semibold transition-all ${city.chip} hover:shadow-sm hover:-translate-y-0.5`}
                            >
                              <span className="text-base leading-none mb-0.5">{cat.emoji}</span>
                              <span className="font-bold">{count}</span>
                            </Link>
                          ) : city.region === 'south-bay' ? (
                            // South Bay: non-restaurant categories intentionally empty — no link, no hover
                            <div className="inline-flex items-center justify-center w-full min-h-[52px] rounded-xl border border-gray-50 bg-white cursor-default">
                              <span className="text-[10px] text-gray-200">—</span>
                            </div>
                          ) : (
                            <Link
                              href={`/${city.slug}/${cat.slug}`}
                              className="inline-flex flex-col items-center justify-center w-full min-h-[52px] rounded-xl border bg-gray-50 border-gray-100 text-gray-300 hover:bg-gray-100 text-xs font-semibold transition-all"
                            >
                              <span className="text-[10px]">—</span>
                            </Link>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-gray-400 mt-3 text-right">
              Numbers show verified listings · Click any tile to browse
            </p>
          </div>

          {/* Mobile: category list → city chips per row */}
          <div className="md:hidden space-y-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.slug} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="font-bold text-sm text-gray-900">{cat.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map((city) => {
                    const count = matrix[city.name]?.[cat.name] ?? 0
                    // South Bay cities with 0 count: skip chip entirely (intentional limited coverage)
                    if (count === 0 && city.region === 'south-bay') return null
                    return (
                      <Link
                        key={city.slug}
                        href={`/${city.slug}/${cat.slug}`}
                        className={`
                          flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition
                          ${count > 0
                            ? `${city.chip} hover:shadow-sm`
                            : 'bg-gray-50 border-gray-200 text-gray-400'}
                        `}
                      >
                        <span>{city.emoji}</span>
                        <span>{city.name}</span>
                        {count > 0 && <span className="opacity-60">({count})</span>}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quick picks — highest count tiles across the board ── */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Popular Right Now</h2>
          <p className="text-sm text-gray-500 mb-4">The most-listed categories across all cities.</p>
          <div className="flex flex-wrap gap-3">
            {CITIES.flatMap((city) =>
              CATEGORIES.map((cat) => ({
                city,
                cat,
                count: matrix[city.name]?.[cat.name] ?? 0,
              }))
            )
              .filter((item) => item.count >= 5)
              .sort((a, b) => b.count - a.count)
              .slice(0, 12)
              .map(({ city, cat, count }) => (
                <Link
                  key={`${city.slug}-${cat.slug}`}
                  href={`/${city.slug}/${cat.slug}`}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition hover:shadow-sm hover:-translate-y-0.5 ${city.chip}`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name} in {city.name}</span>
                  <span className="text-[11px] opacity-60">({count})</span>
                </Link>
              ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div
          className="rounded-2xl p-8 text-center text-white"
          style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)' }}
        >
          <p className="font-extrabold text-xl mb-2">Own a local business?</p>
          <p className="text-white/75 text-sm mb-5">
            Get listed on MoHoLocal — free for businesses across the 209 and South Bay.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/submit-business"
              className="inline-block bg-white font-bold text-sm px-8 py-3 rounded-xl hover:bg-amber-50 transition"
              style={{ color: '#1e3a5f' }}
            >
              + Add Your Business — It&apos;s Free
            </Link>
            <Link
              href="/directory"
              className="inline-block bg-white/15 border border-white/30 text-white font-semibold text-sm px-8 py-3 rounded-xl hover:bg-white/25 transition"
            >
              Browse Full Directory
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}
