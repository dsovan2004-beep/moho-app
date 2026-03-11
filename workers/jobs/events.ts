// ── Events ingestion handler ──────────────────────────────────────────────────
// Source priority:
//   1. Eventbrite API  (EVENTBRITE_API_KEY required)
//   2. City website RSS scraping (public fallback)
//
// After ingestion, stale events (start_date > 7 days ago) are archived.
//
// Events are inserted with status='approved' when confidence is high,
// or 'pending' when low, so admins can review before display.

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
import { createLog, logError, printLog } from '../lib/logger'
import {
  SUPPORTED_CITIES,
  CITY_ZIPS,
  type Env,
  type SupportedCity,
  type RunLog,
} from '../lib/types'

const EVENTBRITE_BASE = 'https://www.eventbriteapi.com/v3/events/search'

// ── Eventbrite API shapes (partial) ──────────────────────────────────────────
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
    address?: {
      city?:          string
      address_1?:     string
      localized_address_display?: string
    }
  }
  category_id?: string
}

// ── Fetch Eventbrite events for a city ───────────────────────────────────────
async function fetchEventbriteEvents(
  apiKey: string,
  city: SupportedCity,
): Promise<EventbriteEvent[]> {
  const url =
    `${EVENTBRITE_BASE}/?location.address=${encodeURIComponent(city + ', CA')}` +
    `&start_date.range_start=${new Date().toISOString()}` +
    `&expand=venue,logo&page_size=50`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (res.status === 401) throw new Error('Eventbrite API key invalid')
  if (!res.ok)            throw new Error(`Eventbrite API error ${res.status}`)

  const json = (await res.json()) as { events?: EventbriteEvent[] }
  return json.events ?? []
}

// ── City RSS fallback — simple RSS parsing ────────────────────────────────────
// Parse RSS items from city websites as a lightweight event fallback.
// This handles cities where Eventbrite has limited coverage.

interface RssItem {
  title?: string
  link?:  string
  pubDate?: string
  description?: string
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = []
  const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)
  for (const m of itemMatches) {
    const block = m[1]
    const get   = (tag: string) => block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))?.[1]
                                ?? block.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`))?.[1]
    items.push({
      title:       get('title'),
      link:        get('link'),
      pubDate:     get('pubDate'),
      description: get('description'),
    })
  }
  return items
}

const CITY_RSS_FEEDS: Partial<Record<SupportedCity, string>> = {
  Tracy:     'https://www.cityoftracy.org/services/news-events/rss',
  Lathrop:   'https://ci.lathrop.ca.us/rss',
  Manteca:   'https://www.mantecacity.org/feed',
  Brentwood: 'https://www.brentwoodca.gov/rss',
  // Mountain House uses MHCSD — no public RSS, skip
}

async function fetchCityRssEvents(city: SupportedCity): Promise<RssItem[]> {
  const feedUrl = CITY_RSS_FEEDS[city]
  if (!feedUrl) return []

  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'MoHoLocal-Bot/1.0 (+https://www.moholocal.com)' },
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseRssItems(xml)
  } catch {
    return []
  }
}

// ── Main events ingestion function ────────────────────────────────────────────
export async function runEventsIngestion(env: Env): Promise<RunLog[]> {
  const logs: RunLog[] = []

  // Archive stale events first
  try {
    const archived = await archiveStaleEvents(env)
    if (archived > 0) console.log(`[events] Archived ${archived} stale events`)
  } catch (err) {
    console.warn(`[events] Archive step failed: ${String(err)}`)
  }

  for (const city of SUPPORTED_CITIES) {
    const cityLog = createLog('events', 'eventbrite+rss', city)
    const startMs = Date.now()

    // ── Source 1: Eventbrite ─────────────────────────────────────────────────
    if (env.EVENTBRITE_API_KEY) {
      let rawEvents: EventbriteEvent[]
      try {
        rawEvents = await fetchEventbriteEvents(env.EVENTBRITE_API_KEY, city)
      } catch (err) {
        logError(cityLog, `Eventbrite fetch failed: ${String(err)}`)
        rawEvents = []
      }

      cityLog.discovered += rawEvents.length

      for (const ev of rawEvents) {
        try {
          await processEventbriteEvent(env, city, ev, cityLog)
        } catch (err) {
          logError(cityLog, `Error processing event "${ev.name?.text}": ${String(err)}`)
        }
      }
    } else {
      console.warn(`[events][${city}] EVENTBRITE_API_KEY not set — using RSS fallback only`)
    }

    // ── Source 2: City RSS fallback ──────────────────────────────────────────
    const rssItems = await fetchCityRssEvents(city)
    cityLog.discovered += rssItems.length
    for (const item of rssItems) {
      try {
        await processRssEvent(env, city, item, cityLog)
      } catch (err) {
        logError(cityLog, `RSS event error: ${String(err)}`)
      }
    }

    printLog(cityLog, startMs)
    logs.push(cityLog)
  }

  return logs
}

// ── Process a single Eventbrite event ────────────────────────────────────────
async function processEventbriteEvent(
  env: Env,
  city: SupportedCity,
  raw: EventbriteEvent,
  log: RunLog,
): Promise<void> {
  const title = normalizeString(raw.name?.text) ?? ''
  if (!title) { log.skipped++; return }

  const startDate = raw.start?.utc ?? raw.start?.local
  if (!startDate) { log.skipped++; return }

  // Resolve image
  const { url: imageUrl, source: imageSource } = await resolveEventImage({
    apiImage:  raw.logo?.url,
    eventUrl:  raw.url,
  })
  if (imageUrl) log.images_captured++
  else          log.images_missing++

  const venueCity  = normalizeCity(raw.venue?.address?.city ?? city) ?? city
  const location   = normalizeString(
    raw.venue?.address?.localized_address_display ?? raw.venue?.name,
  )
  const description = normalizeString(raw.description?.text)
  const confidence  = scoreConfidence({ title, city: venueCity, start_date: startDate, location })
  const review      = needsReview(confidence)
  if (review) log.flagged++

  const existing = await findExistingEvent(env, title, venueCity, startDate)
  const now      = new Date().toISOString()

  if (existing) {
    const patch: Record<string, unknown> = { last_ingested_at: now }
    if (!existing.image_url && imageUrl) { patch.image_url = imageUrl; patch.image_source = imageSource }
    await updateRow(env, 'events', String(existing.id), patch)
    log.updated++
  } else {
    const row = {
      title,
      description:      description ?? null,
      city:             venueCity,
      location:         location    ?? null,
      start_date:       startDate,
      end_date:         raw.end?.utc ?? raw.end?.local ?? null,
      image_url:        imageUrl    ?? null,
      image_source:     imageSource !== 'none' ? imageSource : null,
      source_url:       raw.url     ?? null,
      status:           review ? 'pending' : 'approved',
      source:           'eventbrite',
      last_ingested_at: now,
      confidence_score: confidence,
      needs_review:     review,
    }

    const result = await upsertRow(env, 'events', row, 'title,city,start_date')
    if (result.ok) log.inserted++
    else           logError(log, `Insert failed for "${title}": ${result.error}`)
  }
}

// ── Process a single RSS item ─────────────────────────────────────────────────
async function processRssEvent(
  env: Env,
  city: SupportedCity,
  raw: RssItem,
  log: RunLog,
): Promise<void> {
  const title = normalizeString(raw.title) ?? ''
  if (!title || title.length < 5) { log.skipped++; return }

  // Use pubDate as start_date fallback for RSS items (better than nothing)
  const startDate = raw.pubDate ? new Date(raw.pubDate).toISOString() : null
  if (!startDate) { log.skipped++; return }

  // Resolve image from item link
  const { url: imageUrl, source: imageSource } = await resolveEventImage({
    eventUrl: raw.link,
  })
  if (imageUrl) log.images_captured++
  else          log.images_missing++

  const confidence = scoreConfidence({ title, city, start_date: startDate })
  const review     = needsReview(confidence)
  if (review) log.flagged++

  const existing = await findExistingEvent(env, title, city, startDate)
  if (existing) { log.skipped++; return }

  const row = {
    title,
    description:      normalizeString(raw.description) ?? null,
    city,
    location:         null,
    start_date:       startDate,
    image_url:        imageUrl  ?? null,
    image_source:     imageSource !== 'none' ? imageSource : null,
    source_url:       normalizeUrl(raw.link) ?? null,
    status:           'pending',    // RSS events always need review
    source:           'city-rss',
    last_ingested_at: new Date().toISOString(),
    confidence_score: confidence,
    needs_review:     true,
  }

  const result = await upsertRow(env, 'events', row, 'title,city,start_date')
  if (result.ok) log.inserted++
  else           logError(log, `RSS insert failed for "${title}": ${result.error}`)
}
