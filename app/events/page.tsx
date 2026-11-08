export const runtime = 'nodejs'

import { getSupabaseClient, type Event } from '@/lib/supabase'
import Link from 'next/link'
import CardCityPhoto from '@/app/components/CardCityPhoto'
import { RELAUNCH_CITY_NAMES } from '@/lib/cities'
import { eventDateParts, eventBucket, isUpcomingEvent, eventTimeRange } from '@/lib/event-dates'

const CITIES = ['All Cities', ...RELAUNCH_CITY_NAMES]

interface PageProps {
  searchParams: Promise<{ city?: string; season?: string; month?: string }>
}

async function getEvents(city?: string, seasonal = false, month?: string) {
  const supabase = getSupabaseClient()
  let req = supabase.from('events').select('*').eq('status', 'approved').order('start_date', { ascending: true })

  if (seasonal) req = req.eq('source', 'editorial_seasonal_2026')
  if (seasonal && month === '11') req = req.gte('start_date','2026-11-01T07:00:00Z').lt('start_date','2026-12-01T08:00:00Z')
  if (seasonal && month === '12') req = req.gte('start_date','2026-12-01T08:00:00Z').lt('start_date','2027-01-01T08:00:00Z')
  if (city && city !== 'All Cities') {
    req = req.eq('city', city)
  }

  const { data, error } = await req
  return { events: (data ?? []) as Event[], unavailable: Boolean(error) }
}

const BUCKET_META: Record<string, { label: string; emoji: string; desc: string }> = {
  'today':        { label: 'Today',        emoji: '🔴', desc: 'Happening today' },
  'tomorrow':     { label: 'Tomorrow',     emoji: '📅', desc: 'Coming up tomorrow' },
  'this-weekend': { label: 'This Weekend', emoji: '🎉', desc: 'This Saturday & Sunday' },
  'this-week':    { label: 'Next 7 Days',    emoji: '📆', desc: 'Within the next seven days' },
  'upcoming':     { label: 'Upcoming',     emoji: '🗓️', desc: 'Coming up soon' },
}

const BUCKET_ORDER = ['today', 'tomorrow', 'this-weekend', 'this-week', 'upcoming'] as const

const CITY_COLORS: Record<string, string> = {
  'Mountain House': 'bg-blue-100 text-blue-800',
  Tracy: 'bg-green-100 text-green-800',
  Lathrop: 'bg-purple-100 text-purple-800',
  Manteca: 'bg-orange-100 text-orange-800',
  Brentwood: 'bg-teal-100 text-teal-800',
}

function EventCard({ event, archived = false }: { event: Event; archived?: boolean }) {
  const { month, day, date: full } = eventDateParts(event.start_date)
  const cityColor = CITY_COLORS[event.city] ?? 'bg-gray-100 text-gray-700'

  return (
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
      {!event.image_url && <CardCityPhoto city={event.city} />}
      <Link href={`/events/${event.id}`} className="block group focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
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
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition min-w-0 sm:flex-1">
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
          <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-4 mt-2 text-xs text-slate-600">
            <span>📅 {full}</span>
            {event.start_date.includes('T') && (
              <span>🕐 {eventTimeRange(event)}</span>
            )}
            {event.location && <span>📍 {event.location}</span>}
          </div>
          <span className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-blue-700">View event details →</span>
          {/* Bucket label chip on each card — immediate visual context */}
          {(() => {
            const bucket = eventBucket(event.start_date)
            if (archived) return <p className="mt-2 text-xs font-semibold text-slate-500">Past event · kept for reference</p>
            if (bucket === 'upcoming') return null
            const meta = BUCKET_META[bucket]
            return (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {meta.emoji} {meta.label}
                </span>
              </div>
            )
          })()}
        </div>
      </div>
    </Link>
    </article>
  )
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const city = params.city ?? 'All Cities'
  const seasonal = params.season === '2026'
  const month = ['11','12'].includes(params.month ?? '') ? params.month : undefined
  const { events, unavailable } = await getEvents(city, seasonal, month)
  const cityHref = (name: string) => `/events?${new URLSearchParams({ city: name, ...(seasonal ? {season:'2026', ...(month ? {month} : {})} : {}) })}`

  // Group by upcoming vs past — use parseEventDate to avoid UTC offset bug
  const now = new Date()
  const upcoming = events.filter((e) => isUpcomingEvent(e, now))
  const past     = events.filter((e) => !isUpcomingEvent(e, now))

  // Sub-bucket upcoming events for time labels
  const buckets = BUCKET_ORDER.reduce<Record<string, typeof upcoming>>((acc, key) => {
    acc[key] = []
    return acc
  }, {})
  for (const event of upcoming) {
    const bucket = eventBucket(event.start_date)
    buckets[bucket].push(event)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">{seasonal ? 'Seasonal celebrations 2026' : 'Community Events'}</h1>
        <p className="text-gray-500 mt-1">Gatherings, celebrations and things to do close to home. Times shown in Pacific Time.</p>
      </div>

      <nav aria-label="Event views" className="flex flex-wrap gap-3 mb-4"><Link className={`min-h-11 inline-flex items-center px-4 rounded-full border ${!seasonal ? 'bg-[#1e3a5f] text-white' : 'bg-white text-slate-700'}`} href={`/events?city=${encodeURIComponent(city)}`} aria-current={!seasonal ? 'page' : undefined}>All events</Link><Link className={`min-h-11 inline-flex items-center px-4 rounded-full border ${seasonal ? 'bg-[#1e3a5f] text-white' : 'bg-white text-slate-700'}`} href={`/events?city=${encodeURIComponent(city)}&season=2026`} aria-current={seasonal ? 'page' : undefined}>Thanksgiving & holidays 2026</Link></nav>
      {seasonal && <div className="mb-5"><p className="text-sm text-slate-600 mb-2">Organizer details checked November 6. Registration, eligibility and costs vary; read the event before making plans.</p><nav aria-label="Seasonal month" className="flex flex-wrap gap-2">{[['','All season'],['11','November'],['12','December']].map(([value,label]) => <Link key={label} aria-current={(month ?? '') === value ? 'page' : undefined} className={`inline-flex items-center min-h-11 rounded-full px-4 border text-sm ${(month ?? '') === value ? 'bg-[#e9eee5] border-[#59715d] text-[#243d30]' : 'bg-white border-slate-200 text-slate-600'}`} href={`/events?${new URLSearchParams({city,season:'2026',...(value ? {month:value} : {})})}`}>{label}</Link>)}</nav></div>}
      {/* City Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CITIES.map((c) => (
          <Link
            key={c}
            href={cityHref(c)}
            className={`text-sm font-semibold px-4 py-3 min-h-11 rounded-full transition-all ${
              city === c
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {!unavailable && events.length > 0 && <div role="status" className="mb-6 rounded-xl border border-[#dce5d5] bg-[#f0f4ec] px-4 py-3 text-sm text-[#19352d]">
        <p className="font-semibold">{upcoming.length} current or upcoming {upcoming.length === 1 ? 'event' : 'events'}{city === 'All Cities' ? ' across our cities' : ` in ${city}`}</p>
        <p className="mt-1 text-slate-600">Check the organizer for availability and changes.{past.length > 0 && ' Past events are tucked into the archive below.'}</p>
      </div>}
      {unavailable ? <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-slate-700"><h2 className="font-bold">Events are temporarily unavailable</h2><p className="mt-2">We couldn’t load the calendar. Please try again shortly.</p><Link href={`/events?city=${encodeURIComponent(city)}`} className="inline-flex min-h-11 items-center underline mt-2">Try again →</Link></div> : events.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-medium">No events found</p>
          <p className="text-sm mt-1">Check back soon or try a different city</p>
        </div>
      ) : (
        <>
          {upcoming.length === 0 && <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-bold text-lg text-[#18324f]">No upcoming events in this view yet</h2><p className="mt-2 text-sm text-slate-600">We’re checking new dates. Past listings below are for reference.</p><Link className="mt-3 inline-flex min-h-11 items-center font-semibold underline text-[#19352d]" href={cityHref('All Cities')}>Explore all four cities →</Link></section>}
          {/* Upcoming — bucketed into time labels */}
          {upcoming.length > 0 && BUCKET_ORDER.map((key) => {
            const group = buckets[key]
            if (!group || group.length === 0) return null
            const meta = BUCKET_META[key]
            return (
              <section key={key} className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span>{meta.emoji}</span>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {meta.label}
                  </h2>
                  <span className="text-xs text-gray-400 font-medium">· {group.length} event{group.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-3">
                  {group.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )
          })}

          {/* Past */}
          {past.length > 0 && (
            <details className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <summary className="min-h-11 cursor-pointer font-semibold text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">Past events · {past.length} — open archive</summary>
              <p className="mt-2 mb-4 text-sm text-slate-500">These dates have passed. Check the organizer for any new occurrence.</p>
              <div className="space-y-3">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} archived />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  )
}
