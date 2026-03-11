// ── MoHoLocal — Source Adapter Contract ──────────────────────────────────────
//
// All ingestion adapters implement SourceAdapter<T>.
//
// Adapter types:
//   'rss'    — fetches a public RSS/Atom feed, no credentials required
//   'manual' — reads from a founder-controlled JSON endpoint (env var URL)
//   'scrape' — parses structured HTML from an approved public page
//   'api'    — calls a third-party API that requires credentials
//
// required: false  → the adapter is skipped gracefully when its
//                    credentials or URL are missing. The worker continues
//                    with remaining sources and logs a warning — it never
//                    throws or blocks the run.
//
// DEFAULT APPROVED SOURCES (no credentials required):
//   - Official city websites / event calendars (RSS)
//   - Tracy Press RSS        (tracypress.com/feed)
//   - 209 Times RSS          (209times.com/feed)
//   - Patch RSS              (patch.com/california/[city]/rss.xml)
//   - Founder-managed manual JSON feed (MANUAL_BUSINESS_FEED_URL)
//
// OPTIONAL THIRD-PARTY ADAPTERS (only run when credentials are present):
//   - Yelp Fusion API        (YELP_API_KEY)
//   - Eventbrite API         (EVENTBRITE_API_KEY)
//   - PetFinder API          (PETFINDER_CLIENT_ID + PETFINDER_CLIENT_SECRET)
// ─────────────────────────────────────────────────────────────────────────────

import type { Env } from './types'

export type AdapterType = 'rss' | 'manual' | 'scrape' | 'api'

export interface SourceAdapter<T> {
  readonly name: string
  readonly type: AdapterType
  /** If false the adapter silently no-ops when unavailable */
  readonly required: boolean
  /** Returns true when all required env vars / URLs are present */
  isAvailable(env: Env): boolean
  fetch(env: Env): Promise<T[]>
}

// ── Raw types returned by adapters before normalization ──────────────────────

export interface RawBusiness {
  name: string
  description?: string
  category?: string
  city: string
  address?: string
  phone?: string
  website?: string
  imageUrl?: string
  sourceUrl?: string
  source: string            // adapter name, e.g. 'tracy-press-rss', 'yelp'
}

export interface RawEvent {
  title: string
  description?: string
  city: string
  location?: string
  startDate: string         // ISO string or human-readable date
  endDate?: string
  imageUrl?: string
  sourceUrl?: string
  source: string
}

export interface RawLostFound {
  title: string
  description?: string
  type: 'lost' | 'found'
  petName?: string
  petType?: string
  city: string
  imageUrl?: string
  sourceUrl?: string
  source: string
  contactInfo?: string
}

// ── RSS fetch + parse utilities ───────────────────────────────────────────────

/** Fetch raw RSS/Atom XML from a public URL */
export async function fetchRss(url: string, timeoutMs = 8_000): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MoHoLocal-Ingestion/1.0 (+https://moholocal.com)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

export interface RssItem {
  title: string
  link: string
  description: string
  pubDate: string
  enclosureUrl?: string     // often carries an image URL
}

/** Minimal RSS/Atom item parser — no external deps needed in Workers */
export function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = []
  const blocks = xml.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi) ?? []

  for (const block of blocks) {
    const get = (tag: string): string => {
      const m = block.match(
        new RegExp(
          `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`,
          'i'
        )
      )
      return (m?.[1] ?? m?.[2] ?? '').trim()
    }

    // <link> appears both as element content and as href attribute (Atom)
    const linkM = block.match(/<link[^>]+href="([^"]+)"|<link>([^<]+)<\/link>/i)
    const encM  = block.match(/<enclosure[^>]+url="([^"]+)"/i)
    const mediaM = block.match(/<media:content[^>]+url="([^"]+)"/i)

    items.push({
      title:        get('title'),
      link:         (linkM?.[1] ?? linkM?.[2] ?? '').trim(),
      description:  get('description') || get('summary') || get('content'),
      pubDate:      get('pubDate') || get('published') || get('updated'),
      enclosureUrl: encM?.[1] ?? mediaM?.[1],
    })
  }

  return items
}

/** Strip HTML tags and decode common entities for clean plain-text descriptions */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Run a list of adapters in parallel; skip unavailable ones gracefully */
export async function runAdapters<T>(
  adapters: SourceAdapter<T>[],
  env: Env,
  logWarning: (msg: string) => void
): Promise<{ source: string; items: T[] }[]> {
  const results = await Promise.allSettled(
    adapters.map(async (adapter) => {
      if (!adapter.isAvailable(env)) {
        if (adapter.required) {
          throw new Error(`Required adapter "${adapter.name}" is unavailable`)
        }
        logWarning(`Skipping optional adapter "${adapter.name}" — credentials/URL not configured`)
        return { source: adapter.name, items: [] as T[] }
      }
      const items = await adapter.fetch(env)
      return { source: adapter.name, items }
    })
  )

  return results
    .map((r, i) => {
      if (r.status === 'fulfilled') return r.value
      logWarning(`Adapter "${adapters[i].name}" failed: ${(r.reason as Error).message}`)
      return { source: adapters[i].name, items: [] as T[] }
    })
}
