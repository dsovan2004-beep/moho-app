// ── Directory ingestion handler ───────────────────────────────────────────────
//
// DEFAULT SOURCES (no credentials required — run every Monday 3am UTC):
//   1. ManualFeedAdapter    — founder-controlled JSON endpoint (MANUAL_BUSINESS_FEED_URL)
//   2. ChamberRssAdapter    — Tracy/Manteca/Lathrop/Brentwood chamber of commerce RSS (public)
//
// OPTIONAL ADAPTER (only runs when YELP_API_KEY secret is present):
//   3. YelpAdapter          — Yelp Fusion API
//
// All ingested records land as status='pending' requiring admin review before
// they appear publicly. High-confidence records are flagged for fast approval.
// Per-source stats tracked and returned in /run/directory response.
// ─────────────────────────────────────────────────────────────────────────────

import {
  normalizeCity,
  normalizeCategory,
  normalizePhone,
  normalizeString,
  normalizeUrl,
  normalizeAddress,
  scoreConfidence,
  needsReview,
} from '../lib/normalize'
import { resolveBusinessImage } from '../lib/images'
import { findExistingBusiness } from '../lib/deduplicate'
import { upsertRow, updateRow } from '../lib/supabase'
import { createLog, logError, logWarning, printLog } from '../lib/logger'
import {
  runAdapters,
  fetchRss,
  parseRssItems,
  stripHtml,
  type SourceAdapter,
  type RawBusiness,
  type AdapterResult,
} from '../lib/sources'
import {
  SUPPORTED_CITIES,
  type Env,
  type SupportedCity,
  type RunLog,
  type PerSourceStats,
} from '../lib/types'

// ── Adapter 1: Manual curated JSON feed (DEFAULT) ────────────────────────────
// The founder publishes a JSON array of RawBusiness objects to any HTTPS URL
// (e.g. a GitHub raw file or Cloudflare R2 object).
// Format: [ { name, city, category, address, phone, website, description, image_url } ]

const ManualFeedAdapter: SourceAdapter<RawBusiness> = {
  name:     'manual-json-feed',
  type:     'manual',
  required: false,

  isAvailable: (env) => Boolean(env.MANUAL_BUSINESS_FEED_URL),

  async fetch(env) {
    const url = env.MANUAL_BUSINESS_FEED_URL!
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10_000)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'MoHoLocal-Ingestion/1.0 (+https://moholocal.com)' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching manual feed`)
      const data = (await res.json()) as RawBusiness[]
      return Array.isArray(data)
        ? data.map((r) => ({ ...r, source: 'manual-json-feed' }))
        : []
    } finally {
      clearTimeout(timer)
    }
  },
}

// ── Adapter 2: Chamber of Commerce RSS feeds (DEFAULT) ───────────────────────
// Public RSS feeds from local chambers and business associations.
// All are public — no API key required.

const CHAMBER_RSS_FEEDS: Array<{ city: SupportedCity; name: string; url: string }> = [
  {
    city: 'Tracy',
    name: 'Tracy Chamber of Commerce',
    url:  'https://www.tracychamber.org/feed/',
  },
  {
    city: 'Manteca',
    name: 'Manteca Chamber of Commerce',
    url:  'https://www.mantecachamber.org/feed/',
  },
  {
    city: 'Lathrop',
    name: 'Lathrop-Manteca Chamber',
    url:  'https://www.lathropchamber.com/feed/',
  },
  {
    city: 'Brentwood',
    name: 'Brentwood Chamber of Commerce',
    url:  'https://www.brentwoodchamber.com/feed/',
  },
]

const ChamberRssAdapter: SourceAdapter<RawBusiness> = {
  name:     'chamber-rss',
  type:     'rss',
  required: false,

  isAvailable: () => true,  // always attempt — gracefully skips feeds that 404

  async fetch() {
    const results: RawBusiness[] = []

    for (const feed of CHAMBER_RSS_FEEDS) {
      let xml: string
      try {
        xml = await fetchRss(feed.url)
      } catch {
        // Feed may not exist or may be unavailable — skip silently
        continue
      }

      const items = parseRssItems(xml)
      for (const item of items) {
        if (!item.title) continue
        results.push({
          name:        item.title,
          description: stripHtml(item.description).slice(0, 500),
          city:        feed.city,
          website:     item.link || undefined,
          imageUrl:    item.enclosureUrl || undefined,
          sourceUrl:   item.link || undefined,
          source:      'chamber-rss',
        })
      }
    }

    return results
  },
}

// ── Optional Adapter 3: Yelp Fusion API ──────────────────────────────────────
// Only runs when YELP_API_KEY secret is present.
// Must be explicitly approved and configured before use.

const YELP_QUERIES: Array<{ term: string; limit: number }> = [
  { term: 'restaurants',        limit: 20 },
  { term: 'home services',      limit: 15 },
  { term: 'health wellness',    limit: 15 },
  { term: 'beauty salon',       limit: 10 },
  { term: 'pet services',       limit: 10 },
  { term: 'automotive',         limit: 10 },
  { term: 'real estate',        limit: 10 },
  { term: 'education tutoring', limit: 10 },
  { term: 'retail',             limit: 10 },
]

interface YelpBusiness {
  id:            string
  name:          string
  rating?:       number
  review_count?: number
  phone?:        string
  image_url?:    string
  url?:          string
  categories?:   Array<{ alias: string; title: string }>
  location?: {
    address1?:        string
    city?:            string
    zip_code?:        string
    display_address?: string[]
  }
}

const YelpAdapter: SourceAdapter<RawBusiness> = {
  name:     'yelp-api',
  type:     'api',
  required: false,

  isAvailable: (env) => Boolean(env.YELP_API_KEY),

  async fetch(env) {
    const results: RawBusiness[] = []
    const base = 'https://api.yelp.com/v3/businesses/search'

    for (const city of SUPPORTED_CITIES) {
      for (const { term, limit } of YELP_QUERIES) {
        try {
          const url = `${base}?location=${encodeURIComponent(city + ', CA')}&term=${encodeURIComponent(term)}&limit=${limit}&sort_by=rating`
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${env.YELP_API_KEY}` },
          })
          if (res.status === 401) throw new Error('Yelp API key invalid')
          if (!res.ok) throw new Error(`Yelp API error ${res.status}`)
          const json = (await res.json()) as { businesses?: YelpBusiness[] }

          for (const biz of json.businesses ?? []) {
            results.push({
              name:        biz.name,
              category:    biz.categories?.[0]?.title,
              city:        biz.location?.city ?? city,
              address:     biz.location?.display_address?.join(', ') ?? biz.location?.address1,
              phone:       biz.phone,
              website:     biz.url,
              imageUrl:    biz.image_url,
              sourceUrl:   biz.url,
              source:      'yelp-api',
            })
          }
        } catch (err) {
          // Log but continue with remaining queries
          console.warn(`[yelp] ${city}/${term}: ${String(err)}`)
        }
      }
    }

    return results
  },
}

// ── Main entry point ──────────────────────────────────────────────────────────

export async function runDirectoryIngestion(env: Env): Promise<RunLog[]> {
  const log     = createLog('directory', 'multi-source')
  const startMs = Date.now()

  const adapterResults: AdapterResult<RawBusiness>[] = await runAdapters(
    [ManualFeedAdapter, ChamberRssAdapter, YelpAdapter],
    env,
    (msg) => logWarning(log, msg),
  )

  for (const result of adapterResults) {
    log.per_source[result.source] = { raw_items: result.raw_count, inserted: 0, updated: 0, skipped: 0, flagged: 0 }
    log.discovered += result.raw_count

    for (const raw of result.items) {
      try {
        await processBusiness(env, raw, log)
      } catch (err) {
        logError(log, `[${result.source}] Error processing "${raw.name}": ${String(err)}`)
      }
    }
  }

  printLog(log, startMs)
  return [log]
}

// ── Process a single raw business record ─────────────────────────────────────

async function processBusiness(
  env: Env,
  raw: RawBusiness,
  log: RunLog,
): Promise<void> {
  const src  = log.per_source[raw.source] as PerSourceStats | undefined
  const bump = (field: keyof PerSourceStats) => { if (src) src[field]++ }

  const name = normalizeString(raw.name) ?? ''
  if (!name) { log.skipped++; bump('skipped'); return }

  const city = normalizeCity(raw.city)
  if (!city) { log.skipped++; bump('skipped'); return }   // not in a supported city

  const category = normalizeCategory(raw.category)
  const address  = normalizeAddress(raw.address)
  const phone    = normalizePhone(raw.phone)
  const website  = normalizeUrl(raw.website)

  // Resolve image — API direct → og:image scrape → null
  const { url: imageUrl, source: imageSource } = await resolveBusinessImage({
    apiImage:   raw.imageUrl,
    websiteUrl: website,
  })
  if (imageUrl) log.images_captured++
  else          log.images_missing++

  const confidence = scoreConfidence({ name, city, category, address, phone, website, description: raw.description, image_url: imageUrl })
  const review     = needsReview(confidence)
  if (review) { log.flagged++; bump('flagged') }

  const existing = await findExistingBusiness(env, name, city, phone ?? undefined)
  const now      = new Date().toISOString()

  if (existing) {
    const patch: Record<string, unknown> = { last_ingested_at: now }
    if (!existing.image_url && imageUrl) { patch.image_url = imageUrl; patch.image_source = imageSource }
    if (!existing.phone     && phone)    patch.phone    = phone
    if (!existing.website   && website)  patch.website  = website
    if (!existing.address   && address)  patch.address  = address
    await updateRow(env, 'businesses', String(existing.id), patch)
    log.updated++; bump('updated')
  } else {
    const result = await upsertRow(env, 'businesses', {
      name,
      description:      raw.description ? stripHtml(raw.description).slice(0, 800) : null,
      category,
      city,
      address:          address  ?? null,
      phone:            phone    ?? null,
      website:          website  ?? null,
      image_url:        imageUrl ?? null,
      image_source:     imageSource !== 'none' ? imageSource : null,
      status:           'pending',
      source:           raw.source,
      source_url:       raw.sourceUrl ?? null,
      last_ingested_at: now,
      confidence_score: confidence,
      needs_review:     review,
    }, 'name,city')

    if (result.ok) { log.inserted++; bump('inserted') }
    else           logError(log, `[${raw.source}] Insert failed for "${name}": ${result.error}`)
  }
}
