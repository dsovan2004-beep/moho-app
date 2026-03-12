export const runtime = 'edge'

import { getSupabaseClient, type Event } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getEvent(id: string): Promise<Event | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as Event
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr)
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
    date:    d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    time:    dateStr.includes('T')
      ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : null,
    month:   d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
    day:     d.getDate(),
  }
}

const CITY_THEMES: Record<string, { bg: string; badge: string }> = {
  'Mountain House': { bg: '#1e3a5f', badge: 'bg-blue-100 text-blue-800' },
  'Tracy':          { bg: '#14532d', badge: 'bg-green-100 text-green-800' },
  'Lathrop':        { bg: '#581c87', badge: 'bg-purple-100 text-purple-800' },
  'Manteca':        { bg: '#7c2d12', badge: 'bg-orange-100 text-orange-800' },
  'Brentwood':      { bg: '#134e4a', badge: 'bg-teal-100 text-teal-800' },
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  const { weekday, date, time, month, day } = formatFullDate(event.start_date)
  const theme = CITY_THEMES[event.city] ?? CITY_THEMES['Mountain House']

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Back link */}
      <Link
        href={`/events?city=${encodeURIComponent(event.city)}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      {/* Flyer image */}
      {event.image_url && (
        <div className="w-full rounded-2xl overflow-hidden mb-6 bg-gray-100 shadow-sm">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full object-cover object-top"
          />
        </div>
      )}

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-5">
        {/* City color bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: theme.bg }} />

        <div className="p-6">
          {/* City + category badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${theme.badge}`}>
              📍 {event.city}
            </span>
            {event.category && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                {event.category}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-extrabold text-gray-900 leading-snug mb-4">
            {event.title}
          </h1>

          {/* Date / time block */}
          <div className="flex items-start gap-4 mb-4">
            {/* Calendar widget */}
            <div className="shrink-0 w-14 text-center">
              <div
                className="text-white rounded-t-lg py-0.5 text-xs font-bold tracking-wider"
                style={{ backgroundColor: theme.bg }}
              >
                {month}
              </div>
              <div className="border border-t-0 border-gray-200 rounded-b-lg py-1 text-2xl font-extrabold text-gray-900">
                {day}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{weekday}, {date}</p>
              {time && <p className="text-sm text-gray-500 mt-0.5">🕐 {time}</p>}
              {event.end_date && (
                <p className="text-sm text-gray-500 mt-0.5">
                  Until {new Date(event.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
              <span className="mt-0.5">📍</span>
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">About this event</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>
      )}

      {/* Source link */}
      {event.source_url && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-5">
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            More info / Register
          </a>
        </div>
      )}

      {/* Footer CTA */}
      <div className="text-center pt-4">
        <Link
          href={`/events?city=${encodeURIComponent(event.city)}`}
          className="inline-block text-sm font-semibold px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition"
        >
          ← See all {event.city} events
        </Link>
      </div>
    </div>
  )
}
