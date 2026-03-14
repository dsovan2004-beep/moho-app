export const runtime = 'edge'

import { getSupabaseClient, type Event } from '@/lib/supabase'
import Link from 'next/link'

const CITIES = ['All Cities', 'Mountain House', 'Tracy', 'Lathrop', 'Manteca', 'Brentwood']

interface PageProps {
  searchParams: Promise<{ city?: string }>
}

async function getEvents(city?: string) {
  const supabase = getSupabaseClient()
  let req = supabase.from('events').select('*').order('start_date', { ascending: true })

  if (city && city !== 'All Cities') {
    req = req.eq('city', city)
  }

  const { data, error } = await req
  if (error) console.error(error)
  return (data ?? []) as Event[]
}

// Parse event dates safely — date-only strings (YYYY-MM-DD) must be treated
// as local midnight, NOT UTC midnight. new Date('2026-03-15') parses as UTC
// which shifts the day back one in PST (UTC-8), showing March 14 instead of 15.
function parseEventDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d) // local midnight — no UTC offset shift
  }
  return new Date(dateStr) // datetime strings with T already carry offset info
}

function formatDate(dateStr: string) {
  const d = parseEventDate(dateStr)
  return {
    month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day: d.getDate(),
    full: d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  }
}

const CITY_COLORS: Record<string, string> = {
  'Mountain House': 'bg-blue-100 text-blue-800',
  Tracy: 'bg-green-100 text-green-800',
  Lathrop: 'bg-purple-100 text-purple-800',
  Manteca: 'bg-orange-100 text-orange-800',
  Brentwood: 'bg-teal-100 text-teal-800',
}

function EventCard({ event }: { event: Event }) {
  const { month, day, full } = formatDate(event.start_date)
  const cityColor = CITY_COLORS[event.city] ?? 'bg-gray-100 text-gray-700'

  return (
    <Link href={`/events/${event.id}`} className="block group">
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
      {/* Flyer / screenshot image — shown when present */}
      {event.image_url && (
        <div className="w-full h-48 bg-gray-100 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* Content row */}
      <div className="flex gap-4 p-4">
        {/* Date Column */}
        <div className="shrink-0 w-14 text-center">
          <div className="bg-blue-700 text-white rounded-t-lg py-0.5 text-xs font-bold tracking-wider">
            {month}
          </div>
          <div className="border border-t-0 border-gray-200 rounded-b-lg py-1 text-2xl font-extrabold text-gray-900">
            {day}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition flex-1">
              {event.title}
            </h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${cityColor}`}>
              {event.city}
            </span>
          </div>
          {event.category && (
            <span className="inline-block text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
              {event.category}
            </span>
          )}
          <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{event.description}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>📅 {full}</span>
            {event.start_date.includes('T') && (
              <span>🕐 {new Date(event.start_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            )}
            {event.location && <span>📍 {event.location}</span>}
          </div>
        </div>
      </div>
    </article>
    </Link>
  )
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const city = params.city ?? 'All Cities'
  const events = await getEvents(city)

  // Group by upcoming vs past — use parseEventDate to avoid UTC offset bug
  const now = new Date()
  const upcoming = events.filter((e) => parseEventDate(e.start_date) >= now)
  const past     = events.filter((e) => parseEventDate(e.start_date) < now)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Community Events</h1>
        <p className="text-gray-500 mt-1">What's happening in San Joaquin County</p>
      </div>

      {/* City Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CITIES.map((c) => (
          <Link
            key={c}
            href={`/events?city=${encodeURIComponent(c)}`}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${
              city === c
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-medium">No events found</p>
          <p className="text-sm mt-1">Check back soon or try a different city</p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Upcoming · {upcoming.length}
              </h2>
              <div className="space-y-3">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Past Events · {past.length}
              </h2>
              <div className="space-y-3 opacity-60">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
