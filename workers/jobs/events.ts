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
import { isCrimeContent, logCrimeSkip } from '../lib/content-filter'
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

// ── Adapter 6: San Joaquin County Library system (DEFAULT) ───────────────────
//
// SJ County Library branches serve Tracy, Mountain House, Manteca, Lathrop.
// The Drupal-based site exposes RSS at several known paths — we try each in order.
// Library events are high-quality structured data: title, date, branch clearly labelled.

const SJ_LIBRARY_BRANCHES: Array<{ city: SupportedCity; name: string; urls: string[] }> = [
  {
    city: 'Tracy',
    name: 'Tracy Branch Library',
    urls: [
      'https://www.sjcountylibrary.org/tracy/events/rss',
      'https://www.sjcountylibrary.org/tracy/rss.xml',
      'https://www.sjcountylibrary.org/events/rss',
      'https://www.sjcountylibrary.org/rss.xml',
    ],
  },
  {
    city: 'Mountain House',
    name: 'Mountain House Branch Library',
    urls: [
      'https://www.sjcountylibrary.org/mountain-house/events/rss',
      'https://www.sjcountylibrary.org/mountain-house/rss.xml',
    ],
  },
  {
    city: 'Manteca',
    name: 'Manteca Branch Library',
    urls: [
      'https://www.sjcountylibrary.org/manteca/events/rss',
      'https://www.sjcountylibrary.org/manteca/rss.xml',
    ],
  },
  {
    city: 'Lathrop',
    name: 'Lathrop Branch Library',
    urls: [
      'https://www.sjcountylibrary.org/lathrop/events/rss',
      'https://www.sjcountylibrary.org/lathrop/rss.xml',
    ],
  },
]

const SJCountyLibraryAdapter: SourceAdapter<RawEvent> = {
  name:     'sjcounty-library-rss',
  type:     'rss',
  required: false,
  isAvailable: () => true,

  async fetch() {
    const results: RawEvent[] = []
    for (const branch of SJ_LIBRARY_BRANCHES) {
      const found = await fetchFirstWorkingRss(branch.urls)
      if (!found) continue
      for (const item of parseRssItems(found.xml)) {
        if (!item.title) continue
        const startDate = tryParseDate(item.pubDate)
        if (!startDate) continue
        results.push({
          title:       item.title,
          description: stripHtml(item.description).slice(0, 600),
          city:        branch.city,
          startDate,
          imageUrl:    item.enclosureUrl,
          sourceUrl:   item.link || found.url,
          source:      'sjcounty-library-rss',
        })
      }
    }
    return results
  },
}

// ── Adapter 7: Known recurring farmers markets (DEFAULT) ─────────────────────
//
// Farmers markets don't have RSS feeds.  We generate upcoming Saturday
// occurrences for known 209 markets so the events table always has structured
// food-community entries.  Deduplicate by title+city+start_date prevents
// duplicate inserts on every run.

interface MarketConfig {
  title:        string
  city:         SupportedCity
  location:     string
  description:  string
  dayOfWeek:    number   // 0 = Sun … 6 = Sat
  startHour:    number
  activeMonths: number[] // 1-based (empty = year-round)
}

const KNOWN_MARKETS: MarketConfig[] = [
  {
    title:       'Tracy Certified Farmers Market',
    city:        'Tracy',
    location:    'Tracy Civic Center, 333 Civic Center Dr, Tracy, CA 95376',
    description: 'Shop fresh local produce, artisan goods, and community vendors every Saturday morning at Tracy Civic Center.',
    dayOfWeek:   6,
    startHour:   8,
    activeMonths: [4, 5, 6, 7, 8, 9, 10], // April–October
  },
  {
    title:       'Manteca Certified Farmers Market',
    city:        'Manteca',
    location:    'Downtown Manteca, Yosemite Ave & Center St, Manteca, CA 95336',
    description: 'Weekly certified farmers market featuring fresh local produce, flowers, and specialty foods in downtown Manteca.',
    dayOfWeek:   6,
    startHour:   8,
    activeMonths: [4, 5, 6, 7, 8, 9, 10], // April–October
  },
  {
    title:       'Tracy Downtown Friday Night Market',
    city:        'Tracy',
    location:    'Central Park, Tracy, CA 95376',
    description: 'Summer Friday night community market with local vendors, food trucks, and live entertainment in Central Park.',
    dayOfWeek:   5, // Friday
    startHour:   17,
    activeMonths: [6, 7, 8], // June–August
  },
]

/** Returns upcoming occurrences of a market for the next N weeks. */
function getUpcomingMarketDates(market: MarketConfig, weeks = 5): Date[] {
  const dates: Date[] = []
  const dayMs = 86_400_000
  let cursor = new Date()
  cursor.setHours(market.startHour, 0, 0, 0)

  // Advance to the next occurrence of the target day of week
  while (cursor.getDay() !== market.dayOfWeek) {
    cursor = new Date(cursor.getTime() + dayMs)
  }

  for (let i = 0; i < weeks; i++) {
    const month = cursor.getMonth() + 1
    const isActive = market.activeMonths.length === 0 || market.activeMonths.includes(month)
    if (isActive) dates.push(new Date(cursor.getTime()))
    cursor = new Date(cursor.getTime() + 7 * dayMs)
  }
  return dates
}

const FarmersMarketsAdapter: SourceAdapter<RawEvent> = {
  name:     'farmers-markets-static',
  type:     'manual',
  required: false,
  isAvailable: () => true,

  async fetch() {
    const results: RawEvent[] = []
    for (const market of KNOWN_MARKETS) {
      const dates = getUpcomingMarketDates(market, 5)
      for (const date of dates) {
        results.push({
          title:       market.title,
          description: market.description,
          city:        market.city,
          location:    market.location,
          startDate:   date.toISOString(),
          source:      'farmers-markets-static',
        })
      }
    }
    return results
  },
}

// ── Event category inference ───────────────────────────────────────────────────
//
// Maps event title + description to a structured category.
// This powers AI querying: "community events in Tracy this weekend",
// "kids events in Mountain House", etc.
// First matching rule wins — rules are ordered by specificity.

const EVENT_CATEGORY_RULES: Array<{ keywords: string[]; category: string }> = [
  // Food & Dining (check early — farmers markets are also Community)
  {
    keywords: ['farmers market', "farmers' market", 'farm market', 'produce market', 'food festival', 'food truck', 'wine tasting', 'beer festival', 'taste of'],
    category: 'Food & Dining',
  },
  // Arts & Culture
  {
    keywords: ['concert', 'live music', 'jazz', 'symphony', 'orchestra', 'band performance', 'art walk', 'art show', 'gallery opening', 'exhibition', 'theater', 'theatre', 'dance recital', 'choir', 'opera', 'movie night', 'film screening', 'open mic'],
    category: 'Arts & Culture',
  },
  // Kids & Family
  {
    keywords: ['storytime', 'story time', 'kids craft', 'family fun', 'family event', "children's", 'toddler', 'easter egg hunt', 'trick or treat', 'halloween costume', 'winter carnival', 'summer reading', 'youth program'],
    category: 'Kids & Family',
  },
  // Sports & Recreation
  {
    keywords: ['5k', '10k', 'marathon', 'fun run', 'walk-a-thon', 'youth soccer', 'youth baseball', 'youth basketball', 'swim meet', 'golf tournament', 'volleyball', 'sports tournament', 'sports league', 'pickleball'],
    category: 'Sports & Recreation',
  },
  // Health & Wellness
  {
    keywords: ['health fair', 'wellness fair', 'blood drive', 'flu shot', 'vaccination clinic', 'yoga class', 'fitness class', 'mental health workshop', 'meditation', 'health screening'],
    category: 'Health & Wellness',
  },
  // Education
  {
    keywords: ['workshop', 'seminar', 'webinar', 'training class', 'graduation ceremony', 'open house school', 'back to school', 'college fair', 'stem', 'coding class', 'library class'],
    category: 'Education',
  },
  // Government
  {
    keywords: ['city council', 'town hall meeting', 'public hearing', 'planning commission', 'board meeting', 'school board meeting', 'hoa meeting', 'neighborhood meeting', 'voter registration', 'election'],
    category: 'Government',
  },
  // Holiday & Seasonal
  {
    keywords: ['christmas', 'holiday parade', 'holiday festival', 'halloween', 'thanksgiving', 'fourth of july', '4th of july', "new year's", 'fireworks', 'easter', 'diwali', 'lunar new year', 'seasonal festival', 'winter wonderland', "st. patrick's"],
    category: 'Holiday & Seasonal',
  },
  // Nonprofit & Fundraiser
  {
    keywords: ['fundraiser', 'charity auction', 'benefit dinner', 'nonprofit gala', 'food drive', 'toy drive', 'donation event', 'charity run', 'walk for', 'run for'],
    category: 'Nonprofit & Fundraiser',
  },
  // Community (broad catch-all for local social events)
  {
    keywords: ['community', 'block party', 'neighborhood', 'meetup', 'social', 'mixer', 'open house', 'ribbon cutting', 'grand opening', 'street fair', 'swap meet', 'garage sale'],
    category: 'Community',
  },
]

function inferEventCategory(title: string, description?: string): string {
  const text = ((title ?? '') + ' ' + (description ?? '')).toLowerCase()
  for (const rule of EVENT_CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) return rule.category
    }
  }
  return 'Community' // safe default — most local events are community-oriented
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
    [
      CityCalendarAdapter,
      SJCountyAdapter,
      TracyPressAdapter,
      Times209Adapter,
      PatchAdapter,
      SJCountyLibraryAdapter,
      FarmersMarketsAdapter,
      EventbriteAdapter,        // optional — only runs when EVENTBRITE_API_KEY is set
    ],
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

  // ── Category inference — critical for AI layer queryability ───────────────
  const category = inferEventCategory(title, raw.description)

  const existing = await findExistingEvent(env, title, city, startDate)
  const now      = new Date().toISOString()

  if (existing) {
    const patch: Record<string, unknown> = { last_ingested_at: now }
    if (!existing.image_url && imageUrl)   { patch.image_url = imageUrl; patch.image_source = imageSource }
    if (!existing.category && category)    { patch.category = category }
    await updateRow(env, 'events', String(existing.id), patch)
    log.updated++; bump('updated')
  } else {
    // Auto-approve Eventbrite events (structured, high-confidence) and static market entries
    const autoApprove = (raw.source === 'eventbrite-api' || raw.source === 'farmers-markets-static') && !review
    const result = await upsertRow(env, 'events', {
      title,
      description:      raw.description ? stripHtml(raw.description).slice(0, 800) : null,
      city,
      category,
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

    // ── Crime / violence filter ──────────────────────────────────────────────
    if (isCrimeContent(item.title, item.description)) {
      logCrimeSkip(source, item.title)
      continue
    }

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
