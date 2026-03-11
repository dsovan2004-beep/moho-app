// ── Events ingestion handler ───────────────────────────────────────────────────
//
// DEFAULT SOURCES (no credentials required — run every Monday 4am UTC):
//   1. CityCalendarAdapter  — official city event RSS/calendar feeds (public)
//   2. TracyPressRssAdapter — tracypress.com/feed (public)
//   3. Times209RssAdapter   — 209times.com/feed (public)
//   4. PatchRssAdapter      — patch.com/california/[city]/rss.xml (public)
//
// OPTIONAL ADAPTER (only runs when EVENTBRITE_API_KEY secret is present):
//   5. EventbriteAdapter    — Eventbrite API
//
// Stale events (start_date older than 7 days) are archived before ingestion.
// High-confidence events from RSS are set to ingestion_status='pending'.
// Only admin-approved records appear on the public events page.
// ─────────────────────────────────────────────────────────────────────────────

import {
  normalizeCity,
  normalizeString,
  normalizeUrl,
  scoreConfidence,
  needsReview,
} from '../lib/normalize'
import { resolveEventImage } from '../lib/images'
import { findExistingEvent } from '../lib/deduplicate'
import { upsertRow, updateRow, archiveStaleEvents } from '../lib/supabase'
import { createLog, logError, logWarning, printLog } from '../lib/logger'
import {
  runAdapters,
  fetchRss,
  parseRssItems,
  stripHtml,
  type SourceAdapter,
  type RawEvent,
} from '../lib/sources'
import {
  SUPPORTED_CITIES,
  type Env,
  type SupportedCity,
  type RunLog,
} from '../lib/types'

// ── Adapter 1: Official city event RSS/calendar feeds (DEFAULT) ───────────────
// Official city websites for Mountain House, Tracy, Lathrop, Manteca, Brentwood.
// All are public — no credentials required.
// Feeds that 404 or error are skipped silently.

const CITY_CALENDAR_FEEDS: Array<{ city: SupportedCity; name: string; url: string }> = [
  {
    city: 'Mountain House',
    name: 'MHCSD Events',
    url:  'https://www.mhcsd.ca.gov/calendar.rss',
  },
  {
    city: 'Tracy',
    name: 'City of Tracy Events',
    url:  'https://www.cityoftracy.org/services/news-events/rss',
  },
  {
    city: 'Lathrop',
    name: 'City of Lathrop Events',
    url:  'https://ci.lathrop.ca.us/calendar.rss',
  },
  {
    city: 'Manteca',
    name: 'City of Manteca Events',
    url:  'https://www.mantecacity.org/calendar.rss',
  },
  {
    city: 'Brentwood',
    name: 'City of Brentwood Events',
    url:  'https://www.brentwoodca.gov/calendar.rss',
  },
]

const CityCalendarAdapter: SourceAdapter<RawEvent> = {
  name:     'city-calendar-rss',
  type:     'rss',
  required: false,

  isAvailable: () => true,

  async fetch() {
    const results: RawEvent[] = []

    for (const feed of CITY_CALENDAR_FEEDS) {
      let xml: string
      try {
        xml = await fetchRss(feed.url)
      } catch {
        continue   // feed may not exist — skip silently
      }

      for (const item of parseRssItems(xml)) {
        if (!item.title) continue
        const startDate = item.pubDate ? tryParseDate(item.pubDate) : null
        if (!startDate) continue

        results.push({
          title:       item.title,
          description: stripHtml(item.description).slice(0, 600),
          city:        feed.city,
          startDate,
          imageUrl:    item.enclosureUrl,
          sourceUrl:   item.link || undefined,
          source:      'city-calendar-rss',
        })
      }
    }

    return results
  },
}

// ── Adapter 2: Tracy Press RSS (DEFAULT) ─────────────────────────────────────

const TracyPressRssAdapter: SourceAdapter<RawEvent> = {
  name:     'tracy-press-rss',
  type:     'rss',
  required: false,

  isAvailable: () => true,

  async fetch() {
    let xml: string
    try {
      xml = await fetchRss('https://www.tracypress.com/feed/')
    } catch {
      return []
    }
    return rssItemsToEvents(parseRssItems(xml), 'Tracy', 'tracy-press-rss')
  },
}

// ── Adapter 3: 209 Times RSS (DEFAULT) ───────────────────────────────────────

const Times209RssAdapter: SourceAdapter<RawEvent> = {
  name:     '209times-rss',
  type:     'rss',
  required: false,

  isAvailable: () => true,

  async fetch() {
    let xml: string
    try {
      xml = await fetchRss('https://209times.com/feed/')
    } catch {
      return []
    }
    return rssItemsToEvents(parseRssItems(xml), null, '209times-rss')
  },
}

// ── Adapter 4: Patch.com city RSS feeds (DEFAULT) ────────────────────────────

const PATCH_FEEDS: Array<{ city: SupportedCity; url: string }> = [
  { city: 'Tracy',    url: 'https://patch.com/california/tracy/rss.xml' },
  { city: 'Manteca',  url: 'https://patch.com/california/manteca/rss.xml' },
  { city: 'Lathrop',  url: 'https://patch.com/california/lathrop/rss.xml' },
  { city: 'Brentwood',url: 'https://patch.com/california/brentwood/rss.xml' },
]

const PatchRssAdapter: SourceAdapter<RawEvent> = {
  name:     'patch-rss',
  type:     'rss',
  required: false,

  isAvailable: () => true,

  async fetch() {
    const results: RawEvent[] = []
    for (const feed of PATCH_FEEDS) {
      let xml: string
      try {
        xml = await fetchRss(feed.url)
      } catch {
        continue
      }
      results.push(...rssItemsToEvents(parseRssItems(xml), feed.city, 'patch-rss'))
    }
    return results
  },
}

// ── Optional Adapter 5: Eventbrite API ───────────────────────────────────────
// Only runs when EVENTBRITE_API_KEY secret is present.

interface EventbriteEvent {
  id:           string
  name?:        { text?: string }
  description?: { text?: string }
  start?:       { utc?: string; local?: string }
  end?:         { utc?: string; local?: string }
  url?:         string
  logo?:        { url?: string }
  venue?: {
    name?:    string
    address?: { city?: string; localized_address_display?: string }
  }
}

const EventbriteAdapter: SourceAdapter<RawEvent> = {
  name:     'eventbrite-api',
  type:     'api',
  required: false,

  isAvailable: (env) => Boolean(env.EVENTBRITE_API_KEY),

  async fetch(env) {
    const results: RawEvent[] = []
    const base = 'https://www.eventbriteapi.com/v3/events/search'

    for (const city of SUPPORTED_CITIES) {
      try {
        const url =
          `${base}/?location.address=${encodeURIComponent(city + ', CA')}` +
          `&start_date.range_start=${new Date().toISOString()}` +
          `&expand=venue,logo&page_size=50`

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${env.EVENTBRITE_API_KEY}` },
        })
        if (res.status === 401) throw new Error('Eventbrite API key invalid')
        if (!res.ok) throw new Error(`Eventbrite API error ${res.status}`)

        const json = (await res.json()) as { events?: EventbriteEvent[] }
        for (const ev of json.events ?? []) {
          const title     = ev.name?.text?.trim()
          const startDate = ev.start?.utc ?? ev.start?.local
          if (!title || !startDate) continue

          results.push({
            title,
            description: ev.description?.text?.slice(0, 600),
            city:        ev.venue?.address?.city ?? city,
            location:    ev.venue?.address?.localized_address_display ?? ev.venue?.name,
            startDate,
            endDate:     ev.end?.utc ?? ev.end?.local,
            imageUrl:    ev.logo?.url,
            sourceUrl:   ev.url,
            source:      'eventbrite-api',
          })
        }
      } catch (err) {
        console.warn(`[eventbrite] ${city}: ${String(err)}`)
      }
    }

    return results
  },
}

// ── Main entry point ──────────────────────────────────────────────────────────

export async function runEventsIngestion(env: Env): Promise<RunLog[]> {
  const log     = createLog('events', 'multi-source')
  const startMs = Date.now()

  // Archive stale events first
  try {
    const archived = await archiveStaleEvents(env)
    if (archived > 0) console.log(`[events] Archived ${archived} stale events`)
  } catch (err) {
    logWarning(log, `Archive step failed: ${String(err)}`)
  }

  const adapters: SourceAdapter<RawEvent>[] = [
    CityCalendarAdapter,
    TracyPressRssAdapter,
    Times209RssAdapter,
    PatchRssAdapter,
    EventbriteAdapter,  // silently skipped unless EVENTBRITE_API_KEY is set
  ]

  const adapterResults = await runAdapters(
    adapters,
    env,
    (msg) => logWarning(log, msg),
  )

  const allRaw = adapterResults.flatMap((r) => r.items)
  log.discovered = allRaw.length

  for (const raw of allRaw) {
    try {
      await processEvent(env, raw, log)
    } catch (err) {
      logError(log, `Error processing "${raw.title}": ${String(err)}`)
    }
  }

  printLog(log, startMs)
  return [log]
}

// ── Process a single raw event ────────────────────────────────────────────────

async function processEvent(env: Env, raw: RawEvent, log: RunLog): Promise<void> {
  const title = normalizeString(raw.title) ?? ''
  if (!title || title.length < 4) { log.skipped++; return }

  const city = normalizeCity(raw.city) ?? inferCityFromText(title + ' ' + (raw.description ?? ''))
  if (!city) { log.skipped++; return }

  const startDate = tryParseDate(raw.startDate)
  if (!startDate) { log.skipped++; return }

  const { url: imageUrl, source: imageSource } = await resolveEventImage({
    apiImage: raw.imageUrl,
    eventUrl: raw.sourceUrl,
  })
  if (imageUrl) log.images_captured++
  else          log.images_missing++

  const confidence = scoreConfidence({ title, city, start_date: startDate, location: raw.location })
  const review     = needsReview(confidence)
  if (review) log.flagged++

  const existing = await findExistingEvent(env, title, city, startDate)
  const now      = new Date().toISOString()

  if (existing) {
    const patch: Record<string, unknown> = { last_ingested_at: now }
    if (!existing.image_url && imageUrl) { patch.image_url = imageUrl; patch.image_source = imageSource }
    await updateRow(env, 'events', String(existing.id), patch)
    log.updated++
  } else {
    // Eventbrite records with high confidence are auto-approved; all others pending
    const autoApprove = raw.source === 'eventbrite-api' && !review
    const result = await upsertRow(env, 'events', {
      title,
      description:      raw.description ? stripHtml(raw.description).slice(0, 800) : null,
      city,
      location:         raw.location ?? null,
      start_date:       startDate,
      end_date:         raw.endDate ? tryParseDate(raw.endDate) : null,
      image_url:        imageUrl   ?? null,
      image_source:     imageSource !== 'none' ? imageSource : null,
      source_url:       normalizeUrl(raw.sourceUrl) ?? null,
      ingestion_status: autoApprove ? 'approved' : 'pending',
      source:           raw.source,
      last_ingested_at: now,
      confidence_score: confidence,
      needs_review:     review,
    }, 'title,city,start_date')

    if (result.ok) log.inserted++
    else           logError(log, `Insert failed for "${title}": ${result.error}`)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tryParseDate(val: string | undefined): string | null {
  if (!val) return null
  try {
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d.toISOString()
  } catch {
    return null
  }
}

/** Keyword-based city inference for news RSS items that don't carry city metadata */
function inferCityFromText(text: string): SupportedCity | null {
  const lower = text.toLowerCase()
  if (lower.includes('mountain house')) return 'Mountain House'
  if (lower.includes('brentwood'))      return 'Brentwood'
  if (lower.includes('lathrop'))        return 'Lathrop'
  if (lower.includes('manteca'))        return 'Manteca'
  if (lower.includes('tracy'))          return 'Tracy'
  return null
}

/** Convert generic RSS items to RawEvent, optionally with a known city */
function rssItemsToEvents(
  items: ReturnType<typeof parseRssItems>,
  defaultCity: SupportedCity | null,
  source: string,
): RawEvent[] {
  const results: RawEvent[] = []
  for (const item of items) {
    if (!item.title) continue
    // Only include items that mention a city keyword or have a defaultCity
    const city = defaultCity ?? inferCityFromText(item.title + ' ' + item.description)
    if (!city) continue

    const startDate = item.pubDate ? tryParseDate(item.pubDate) : null
    if (!startDate) continue

    results.push({
      title:       item.title,
      description: stripHtml(item.description).slice(0, 600),
      city,
      startDate,
      imageUrl:    item.enclosureUrl,
      sourceUrl:   item.link || undefined,
      source,
    })
  }
  return results
}
