// ── Events ingestion handler ───────────────────────────────────────────────────
//
// DEFAULT SOURCES (no credentials required — run every Monday 4am UTC):
//
//   CityCalendarAdapter   — tries multiple URL paths per city (Granicus, CivicPlus,
//                           standard /calendar.rss, /rss.xml variants).
//                           Uses first path that returns valid RSS.
//
//   SJCountyAdapter       — San Joaquin County government feeds (sjgov.org)
//
//   TracyPressAdapter     — tracypress.com/feed/ (WordPress RSS)
//   Times209Adapter       — 209times.com/feed/ (WordPress RSS)
//   PatchAdapter          — patch.com/california/[city]/rss.xml (4 cities)
//
// OPTIONAL (only runs when EVENTBRITE_API_KEY is present):
//   EventbriteAdapter     — Eventbrite API
//
// Each adapter reports per-source stats: raw_items, inserted, updated,
// skipped, flagged. These are included in the /run/events response.
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
  fetchFirstWorkingRss,
  parseRssItems,
  stripHtml,
  type SourceAdapter,
  type RawEvent,
  type AdapterResult,
} from '../lib/sources'
import {
  SUPPORTED_CITIES,
  type Env,
  type SupportedCity,
  type RunLog,
  type PerSourceStats,
} from '../lib/types'

// ── Adapter 1: City government calendars — multi-path (DEFAULT) ───────────────
// Each city is tried against multiple known URL patterns so we pick up
// whichever path the CMS exposes.  fetchFirstWorkingRss() stops at the
// first URL that returns valid RSS content.

const CITY_CALENDAR_FEEDS: Array<{ city: SupportedCity; name: string; urls: string[] }> = [
  {
    city: 'Mountain House',
    name: 'MHCSD Events',
    urls: [
      'https://www.mhcsd.ca.gov/calendar.rss',
      'https://www.mhcsd.ca.gov/site/calendar.xml',
      'https://www.mhcsd.ca.gov/rss.xml',
      'https://www.mhcsd.ca.gov/rss',
    ],
  },
  {
    city: 'Tracy',
    name: 'City of Tracy Events',
    urls: [
      'https://www.cityoftracy.org/services/news-events/rss',
      'https://www.cityoftracy.org/rss.xml',
      'https://www.cityoftracy.org/rss',
      'https://www.cityoftracy.org/Home.aspx?id=RSS',
      'https://www.cityoftracy.org/calendar.rss',
    ],
  },
  {
    city: 'Lathrop',
    name: 'City of Lathrop Events',
    urls: [
      'https://ci.lathrop.ca.us/calendar.rss',
      'https://ci.lathrop.ca.us/rss.xml',
      'https://ci.lathrop.ca.us/rss',
      'https://www.lathropca.gov/calendar.rss',
      'https://www.lathropca.gov/rss.xml',
    ],
  },
  {
    city: 'Manteca',
    name: 'City of Manteca Events',
    urls: [
      'https://www.mantecacity.org/calendar.rss',
      'https://www.mantecacity.org/rss.xml',
      'https://www.mantecacity.org/rss',
      'https://www.ci.manteca.ca.us/calendar.rss',
    ],
  },
  {
    city: 'Brentwood',
    name: 'City of Brentwood Events',
    urls: [
      'https://www.brentwoodca.gov/calendar.rss',
      'https://www.brentwoodca.gov/rss.xml',
      'https://www.brentwoodca.gov/rss',
      'https://www.ci.brentwood.ca.us/calendar.rss',
    ],
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
      const found = await fetchFirstWorkingRss(feed.urls)
      if (!found) continue

      for (const item of parseRssItems(found.xml)) {
        if (!item.title) continue
        const startDate = tryParseDate(item.pubDate)
        if (!startDate) continue
        results.push({
          title:       item.title,
          description: stripHtml(item.description).slice(0, 600),
          city:        feed.city,
          startDate,
          imageUrl:    item.enclosureUrl,
          sourceUrl:   item.link || found.url,
          source:      'city-calendar-rss',
        })
      }
    }
    return results
  },
}

// ── Adapter 2: San Joaquin County government (DEFAULT) ────────────────────────

const SJCOUNTY_FEEDS = [
  { name: 'SJ County News',   url: 'https://www.sjgov.org/rss.xml' },
  { name: 'SJ County Events', url: 'https://www.sjgov.org/events/rss' },
  { name: 'SJ County RSS',    url: 'https://www.co.san-joaquin.ca.us/rss.xml' },
]

const SJCountyAdapter: SourceAdapter<RawEvent> = {
  name:     'sjcounty-rss',
  type:     'rss',
  required: false,
  isAvailable: () => true,

  async fetch() {
    const results: RawEvent[] = []
    for (const feed of SJCOUNTY_FEEDS) {
      let xml: string
      try { xml = await fetchRss(feed.url) } catch { continue }

      for (const item of parseRssItems(xml)) {
        if (!item.title) continue
        const city = inferCity(item.title + ' ' + item.description)
        if (!city) continue
        const startDate = tryParseDate(item.pubDate)
        if (!startDate) continue
        results.push({
          title:       item.title,
          description: stripHtml(item.description).slice(0, 600),
          city,
          startDate,
          imageUrl:    item.enclosureUrl,
          sourceUrl:   item.link || undefined,
          source:      'sjcounty-rss',
        })
      }
    }
    return results
  },
}

// ── Adapter 3: Tracy Press RSS (DEFAULT) ─────────────────────────────────────

const TRACYPRESS_URLS = [
  'https://www.tracypress.com/feed/',
  'https://tracypress.com/feed/',
  'https://www.tracypress.com/category/news/feed/',
  'https://www.tracypress.com/category/local/feed/',
  'https://www.tracypress.com/rss.xml',
]

const TracyPressAdapter: SourceAdapter<RawEvent> = {
  name:     'tracy-press-rss',
  type:     'rss',
  required: false,
  isAvailable: () => true,

  async fetch() {
    // tracypress.com blocks our default User-Agent — try with browser UA first
    const found = await fetchFirstWorkingRss(TRACYPRESS_URLS, true)
    if (!found) return []
    return newsRssToEvents(parseRssItems(found.xml), 'Tracy', 'tracy-press-rss')
  },
}

// ── Adapter 4: 209 Times RSS (DEFAULT) ───────────────────────────────────────

const TIMES209_URLS = [
  'https://209times.com/feed/',
  'https://www.209times.com/feed/',
  'https://209times.com/rss.xml',
]

const Times209Adapter: SourceAdapter<RawEvent> = {
  name:     '209times-rss',
  type:     'rss',
  required: false,
  isAvailable: () => true,

  async fetch() {
    const found = await fetchFirstWorkingRss(TIMES209_URLS)
    if (!found) return []
    // 209times covers the entire 209 area — use Tracy as fallback for articles
    // that don't explicitly name a supported city in the headline.
    return newsRssToEvents(parseRssItems(found.xml), 'Tracy', '209times-rss')
  },
}

// ── Adapter 5: Patch.com RSS (DEFAULT) ───────────────────────────────────────

// Patch.com dropped /rss.xml — try multiple URL formats per city.
const PATCH_FEEDS: Array<{ city: SupportedCity; urls: string[] }> = [
  { city: 'Tracy',     urls: ['https://patch.com/california/tracy/rss.xml', 'https://patch.com/california/tracy/feed', 'https://patch.com/california/tracy/rss'] },
  { city: 'Manteca',   urls: ['https://patch.com/california/manteca/rss.xml', 'https://patch.com/california/manteca/feed', 'https://patch.com/california/manteca/rss'] },
  { city: 'Lathrop',   urls: ['https://patch.com/california/lathrop/rss.xml', 'https://patch.com/california/lathrop/feed', 'https://patch.com/california/lathrop/rss'] },
  { city: 'Brentwood', urls: ['https://patch.com/california/brentwood/rss.xml', 'https://patch.com/california/brentwood/feed', 'https://patch.com/california/brentwood/rss'] },
]

const PatchAdapter: SourceAdapter<RawEvent> = {
  name:     'patch-rss',
  type:     'rss',
  required: false,
  isAvailable: () => true,

  async fetch() {
    const results: RawEvent[] = []
    for (const feed of PATCH_FEEDS) {
      const found = await fetchFirstWorkingRss(feed.urls)
      if (!found) continue
      results.push(...newsRssToEvents(parseRssItems(found.xml), feed.city, 'patch-rss'))
    }
    return results
  },
}

// ── Optional Adapter 6: Eventbrite API ───────────────────────────────────────

interface EventbriteEvent {
  id:           string
  name?:        { text?: string }
  description?: { text?: string }
  start?:       { utc?: string; local?: string }
  end?:         { utc?: string; local?: string }
  url?:         string
  logo?:        { url?: string }
  venue?: { name?: string; address?: { city?: string; localized_address_display?: string } }
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
        const url = `${base}/?location.address=${encodeURIComponent(city + ', CA')}&start_date.range_start=${new Date().toISOString()}&expand=venue,logo&page_size=50`
        const res = await fetch(url, { headers: { Authorization: `Bearer ${env.EVENTBRITE_API_KEY}` } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
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

  try {
    const archived = await archiveStaleEvents(env)
    if (archived > 0) console.log(`[events] Archived ${archived} stale events`)
  } catch (err) {
    logWarning(log, `Archive step failed: ${String(err)}`)
  }

  const adapterResults: AdapterResult<RawEvent>[] = await runAdapters(
    [CityCalendarAdapter, SJCountyAdapter, TracyPressAdapter, Times209Adapter, PatchAdapter, EventbriteAdapter],
    env,
    (msg) => logWarning(log, msg),
  )

  for (const result of adapterResults) {
    // Initialise per-source bucket
    log.per_source[result.source] = { raw_items: result.raw_count, inserted: 0, updated: 0, skipped: 0, flagged: 0 }
    log.discovered += result.raw_count

    for (const raw of result.items) {
      try {
        await processEvent(env, raw, log)
      } catch (err) {
        logError(log, `[${result.source}] Error processing "${raw.title}": ${String(err)}`)
      }
    }
  }

  printLog(log, startMs)
  return [log]
}

// ── Process a single raw event ────────────────────────────────────────────────

async function processEvent(env: Env, raw: RawEvent, log: RunLog): Promise<void> {
  const src  = log.per_source[raw.source] as PerSourceStats | undefined
  const bump = (field: keyof PerSourceStats) => { if (src) src[field]++ }

  const title = normalizeString(raw.title) ?? ''
  if (!title || title.length < 4) { log.skipped++; bump('skipped'); return }

  const city = normalizeCity(raw.city) ?? inferCity(title + ' ' + (raw.description ?? ''))
  if (!city) { log.skipped++; bump('skipped'); return }

  const startDate = tryParseDate(raw.startDate)
  if (!startDate) { log.skipped++; bump('skipped'); return }

  const { url: imageUrl, source: imageSource } = await resolveEventImage({
    apiImage: raw.imageUrl,
    eventUrl: raw.sourceUrl,
  })
  if (imageUrl) log.images_captured++
  else          log.images_missing++

  const confidence = scoreConfidence({ title, city, start_date: startDate, location: raw.location })
  const review     = needsReview(confidence)
  if (review) { log.flagged++; bump('flagged') }

  const existing = await findExistingEvent(env, title, city, startDate)
  const now      = new Date().toISOString()

  if (existing) {
    const patch: Record<string, unknown> = { last_ingested_at: now }
    if (!existing.image_url && imageUrl) { patch.image_url = imageUrl; patch.image_source = imageSource }
    await updateRow(env, 'events', String(existing.id), patch)
    log.updated++; bump('updated')
  } else {
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

    if (result.ok) { log.inserted++; bump('inserted') }
    else           logError(log, `[${raw.source}] Insert failed for "${title}": ${result.error}`)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tryParseDate(val: string | undefined): string | null {
  if (!val) return null
  try {
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d.toISOString()
  } catch { return null }
}

function inferCity(text: string): SupportedCity | null {
  const lower = text.toLowerCase()
  if (lower.includes('mountain house')) return 'Mountain House'
  if (lower.includes('brentwood'))      return 'Brentwood'
  if (lower.includes('lathrop'))        return 'Lathrop'
  if (lower.includes('manteca'))        return 'Manteca'
  if (lower.includes('tracy'))          return 'Tracy'
  return null
}

function newsRssToEvents(
  items: ReturnType<typeof parseRssItems>,
  defaultCity: SupportedCity | null,
  source: string,
): RawEvent[] {
  const results: RawEvent[] = []
  for (const item of items) {
    if (!item.title) continue
    // Prefer explicit city match in text; fall back to defaultCity if provided
    const city = inferCity(item.title + ' ' + item.description) ?? defaultCity
    if (!city) continue
    const startDate = tryParseDate(item.pubDate)
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
