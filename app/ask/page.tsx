export const runtime = 'edge'

import {
  parseQuery,
  fetchAskResults,
  eventHeading,
  bizHeading,
  communityHeading,
  type AskResult,
  type AskBusiness,
  type AskEvent,
  type AskPost,
} from '@/lib/ask'
import Link from 'next/link'

// ── SEO ───────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { q } = await searchParams
  return {
    title: q
      ? `"${q}" — Ask MoHo | MoHoLocal`
      : 'Ask MoHo — Your Local AI Guide | MoHoLocal',
    description:
      'Ask anything about Mountain House, Tracy, Lathrop, Manteca, and Brentwood. Find businesses, upcoming events, and what your neighbors are talking about.',
  }
}

// ── Example queries ───────────────────────────────────────────────────────────

const EXAMPLES = [
  "What's happening in Tracy this weekend?",
  'Best halal restaurants in Mountain House',
  'Things to do in Manteca with kids',
  'What are Brentwood residents asking about?',
  'Farmers market near Tracy',
  'Find a dentist in Lathrop',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    })
  } catch { return iso }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const CAT_COLORS: Record<string, string> = {
  General: 'bg-gray-100 text-gray-700',
  Recommendations: 'bg-blue-100 text-blue-700',
  'For Sale': 'bg-green-100 text-green-700',
  'Free Items': 'bg-teal-100 text-teal-700',
  Jobs: 'bg-purple-100 text-purple-700',
  Services: 'bg-indigo-100 text-indigo-700',
  Safety: 'bg-red-100 text-red-700',
  Neighbors: 'bg-amber-100 text-amber-700',
  Question: 'bg-orange-100 text-orange-700',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ text }: { text: string }) {
  return (
    <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
      {text}
    </h2>
  )
}

function EmptySection({ label }: { label: string }) {
  return (
    <p className="text-sm text-gray-400 italic py-2">
      No {label} found for this query. Try broadening your search.
    </p>
  )
}

function BusinessCard({ biz }: { biz: AskBusiness }) {
  return (
    <Link
      href={`/business/${biz.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-900 leading-snug">{biz.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{biz.category} · {biz.city}</p>
          {biz.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{biz.description}</p>
          )}
          {biz.address && (
            <p className="text-xs text-gray-400 mt-1 truncate">📍 {biz.address}</p>
          )}
          {biz.phone && (
            <p className="text-xs text-gray-400 mt-0.5">📞 {biz.phone}</p>
          )}
        </div>
        {biz.rating && (
          <div className="shrink-0 text-right">
            <div className="text-amber-500 font-bold text-sm">★ {biz.rating.toFixed(1)}</div>
            {biz.review_count ? (
              <div className="text-xs text-gray-400">({biz.review_count})</div>
            ) : null}
          </div>
        )}
      </div>
    </Link>
  )
}

function EventCard({ ev }: { ev: AskEvent }) {
  return (
    <Link
      href={ev.source_url ?? `/events`}
      target={ev.source_url ? '_blank' : undefined}
      rel={ev.source_url ? 'noopener noreferrer' : undefined}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start gap-3">
        {ev.image_url && (
          <img
            src={ev.image_url}
            alt={ev.title}
            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-gray-100"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-2">{ev.title}</h3>
          <p className="text-xs text-amber-600 font-semibold mt-1">{formatDate(ev.start_date)}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {ev.city}{ev.location ? ` · ${ev.location}` : ''}
          </p>
          {ev.category && (
            <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {ev.category}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function PostCard({ post }: { post: AskPost }) {
  const catColor = CAT_COLORS[post.category] ?? 'bg-gray-100 text-gray-700'
  return (
    <Link
      href={`/community/${post.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-xs">
          {post.author_name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-semibold text-gray-700">{post.author_name}</span>
            <span className="text-xs text-gray-400">{post.city} · {timeAgo(post.created_at)}</span>
          </div>
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5 ${catColor}`}>
            {post.category}
          </span>
          <h3 className="font-bold text-sm text-gray-900 leading-snug">{post.title}</h3>
          {post.content && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.content}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Results renderer ──────────────────────────────────────────────────────────

function Results({ result }: { result: AskResult }) {
  const { businesses, events, posts, parsed } = result
  const total = businesses.length + events.length + posts.length

  const showEvents    = parsed.intent === 'events'    || parsed.intent === 'mixed'
  const showBiz       = parsed.intent === 'businesses' || parsed.intent === 'mixed'
  const showCommunity = parsed.intent === 'community'  || parsed.intent === 'mixed'

  if (total === 0) {
    return (
      <div className="text-center py-14">
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-bold text-gray-700 mb-1">No results found</p>
        <p className="text-sm text-gray-400 mb-6">
          Try a different query — be more specific about a city or category.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLES.slice(0, 3).map((ex) => (
            <a
              key={ex}
              href={`/ask?q=${encodeURIComponent(ex)}`}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
            >
              {ex}
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 mt-6">
      {/* Events */}
      {showEvents && (
        <section>
          <SectionHeading text={eventHeading(parsed)} />
          {events.length > 0
            ? <div className="space-y-3">{events.map((ev) => <EventCard key={ev.id} ev={ev} />)}</div>
            : <EmptySection label="events" />}
          {events.length > 0 && (
            <Link
              href={`/events${parsed.city ? `?city=${encodeURIComponent(parsed.city)}` : ''}`}
              className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:underline"
            >
              See all events →
            </Link>
          )}
        </section>
      )}

      {/* Businesses */}
      {showBiz && (
        <section>
          <SectionHeading text={bizHeading(parsed)} />
          {businesses.length > 0
            ? <div className="space-y-3">{businesses.map((biz) => <BusinessCard key={biz.id} biz={biz} />)}</div>
            : <EmptySection label="businesses" />}
          {businesses.length > 0 && (
            <Link
              href={`/directory${parsed.city ? `?city=${encodeURIComponent(parsed.city)}` : ''}${parsed.category ? `&category=${encodeURIComponent(parsed.category)}` : ''}`}
              className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:underline"
            >
              See full directory →
            </Link>
          )}
        </section>
      )}

      {/* Community */}
      {showCommunity && (
        <section>
          <SectionHeading text={communityHeading(parsed)} />
          {posts.length > 0
            ? <div className="space-y-3">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
            : <EmptySection label="community posts" />}
          {posts.length > 0 && (
            <Link
              href={`/community${parsed.city ? `?city=${encodeURIComponent(parsed.city)}` : ''}`}
              className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:underline"
            >
              See all community posts →
            </Link>
          )}
        </section>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AskPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  let result: AskResult | null = null
  if (query.length >= 3) {
    const parsed = parseQuery(query)
    result = await fetchAskResults(parsed)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🤖</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Ask MoHo</h1>
        <p className="text-gray-500 text-sm">
          Ask anything about the 209 — businesses, events, and what your neighbors are talking about.
        </p>
      </div>

      {/* Search form */}
      <form method="GET" action="/ask" className="mb-6">
        <div className="flex gap-2 items-center">
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="What's happening in Tracy this weekend?"
            autoFocus={!query}
            autoComplete="off"
            className="flex-1 text-sm border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            type="submit"
            className="shrink-0 text-sm font-bold px-5 py-3 rounded-xl text-white transition hover:opacity-90"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            Ask
          </button>
        </div>
      </form>

      {/* Example queries — shown when no query entered */}
      {!query && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Try asking…
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <a
                key={ex}
                href={`/ask?q=${encodeURIComponent(ex)}`}
                className="text-sm font-medium px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:shadow-sm transition"
              >
                {ex}
              </a>
            ))}
          </div>

          {/* Signal layer explanation */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: '🏢', label: 'Businesses', desc: '202+ verified local businesses across the 209' },
              { icon: '📅', label: 'Events',     desc: 'Upcoming community events from 8 live sources' },
              { icon: '💬', label: 'Community',  desc: 'Real posts from your neighbors' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="font-bold text-sm text-gray-800 mb-1">{label}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && <Results result={result} />}

      {/* Query too short */}
      {query && query.length < 3 && (
        <p className="text-center text-sm text-gray-400 mt-4">
          Type at least 3 characters to search.
        </p>
      )}
    </div>
  )
}
