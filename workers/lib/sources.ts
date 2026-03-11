// ── MoHoLocal — Source Adapter Contract ──────────────────────────────────────
import type { Env } from './types'

export type AdapterType = 'rss' | 'manual' | 'scrape' | 'api'

export interface SourceAdapter<T> {
  readonly name: string
  readonly type: AdapterType
  readonly required: boolean
  isAvailable(env: Env): boolean
  fetch(env: Env): Promise<T[]>
}

// ── Diagnostic types ──────────────────────────────────────────────────────────

export type SourceVerdict = 'WORKING' | 'REACHABLE_NO_RSS' | 'REACHABLE_EMPTY' | 'DEAD' | 'BLOCKED' | 'ERROR'

export interface SourceValidation {
  name:          string
  url:           string
  status:        number | null
  content_type:  string | null
  is_rss:        boolean
  item_count:    number
  latency_ms:    number
  verdict:       SourceVerdict
  error?:        string
}

export interface AdapterResult<T> {
  source:     string
  items:      T[]
  raw_count:  number       // items before any city/keyword filtering inside the adapter
  error:      string | null
}

// ── URL validation utility (used by /validate endpoint) ──────────────────────

export async function validateUrl(name: string, url: string): Promise<SourceValidation> {
  const start = Date.now()
  let status: number | null = null
  let contentType: string | null = null
  let isRss = false
  let itemCount = 0
  let error: string | undefined

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6_000)
    try {
      const res = await fetch(url, {
        signal:  controller.signal,
        headers: { 'User-Agent': 'MoHoLocal-Validator/1.0 (+https://moholocal.com)' },
      })
      status      = res.status
      contentType = res.headers.get('content-type')

      if (res.ok) {
        const text = await res.text()
        // Detect RSS/Atom by checking for common root elements
        isRss = /<(?:rss|feed|channel)\b/i.test(text)
        if (isRss) {
          itemCount = parseRssItems(text).length
        } else if (text.length > 0) {
          // Might be XML/HTML that isn't RSS — still reachable
          contentType = contentType ?? 'text/html'
        }
      }
    } finally {
      clearTimeout(timer)
    }
  } catch (err) {
    error = String(err)
  }

  let verdict: SourceVerdict
  if (error) {
    verdict = error.includes('abort') ? 'BLOCKED' : 'ERROR'
  } else if (status === null || status >= 400) {
    verdict = 'DEAD'
  } else if (!isRss) {
    verdict = 'REACHABLE_NO_RSS'
  } else if (itemCount === 0) {
    verdict = 'REACHABLE_EMPTY'
  } else {
    verdict = 'WORKING'
  }

  return {
    name, url, status, content_type: contentType,
    is_rss: isRss, item_count: itemCount,
    latency_ms: Date.now() - start,
    verdict, ...(error ? { error } : {}),
  }
}

// ── Raw types returned by adapters ───────────────────────────────────────────

export interface RawBusiness {
  name:         string
  description?: string
  category?:    string
  city:         string
  address?:     string
  phone?:       string
  website?:     string
  imageUrl?:    string
  sourceUrl?:   string
  source:       string
}

export interface RawEvent {
  title:        string
  description?: string
  city:         string
  location?:    string
  startDate:    string
  endDate?:     string
  imageUrl?:    string
  sourceUrl?:   string
  source:       string
}

export interface RawLostFound {
  title:        string
  description?: string
  type:         'lost' | 'found'
  petName?:     string
  petType?:     string
  city:         string
  imageUrl?:    string
  sourceUrl?:   string
  source:       string
  contactInfo?: string
}

// ── RSS fetch utility ─────────────────────────────────────────────────────────

export async function fetchRss(url: string, timeoutMs = 8_000): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal:  controller.signal,
      headers: { 'User-Agent': 'MoHoLocal-Ingestion/1.0 (+https://moholocal.com)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

/** Try each URL in order, return the first that returns valid RSS */
export async function fetchFirstWorkingRss(urls: string[]): Promise<{ xml: string; url: string } | null> {
  for (const url of urls) {
    try {
      const xml = await fetchRss(url, 6_000)
      if (/<(?:rss|feed|channel)\b/i.test(xml)) return { xml, url }
    } catch {
      // try next
    }
  }
  return null
}

export interface RssItem {
  title:        string
  link:         string
  description:  string
  pubDate:      string
  enclosureUrl?: string
}

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
    const linkM  = block.match(/<link[^>]+href="([^"]+)"|<link>([^<]+)<\/link>/i)
    const encM   = block.match(/<enclosure[^>]+url="([^"]+)"/i)
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

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ').trim()
}

/** Run adapters sequentially (not parallel) to avoid Cloudflare subrequest limits.
 *  Returns AdapterResult[] so callers can report per-source diagnostics. */
export async function runAdapters<T>(
  adapters: SourceAdapter<T>[],
  env: Env,
  logWarning: (msg: string) => void,
): Promise<AdapterResult<T>[]> {
  const results: AdapterResult<T>[] = []

  for (const adapter of adapters) {
    if (!adapter.isAvailable(env)) {
      if (adapter.required) {
        results.push({ source: adapter.name, items: [], raw_count: 0, error: `Required adapter unavailable` })
      } else {
        logWarning(`Skipping optional adapter "${adapter.name}" — credentials/URL not configured`)
        results.push({ source: adapter.name, items: [], raw_count: 0, error: null })
      }
      continue
    }

    try {
      const items = await adapter.fetch(env)
      results.push({ source: adapter.name, items, raw_count: items.length, error: null })
    } catch (err) {
      const msg = `Adapter "${adapter.name}" failed: ${(err as Error).message}`
      logWarning(msg)
      results.push({ source: adapter.name, items: [], raw_count: 0, error: msg })
    }
  }

  return results
}
