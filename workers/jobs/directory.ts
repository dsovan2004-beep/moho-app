// ── Directory ingestion handler ───────────────────────────────────────────────
// Source priority:
//   1. Yelp Fusion API  (YELP_API_KEY required)
//   2. Graceful skip    (logs warning if no key)
//
// Each business goes through:
//   fetch → normalize → deduplicate → upsert → log
//
// New records inserted with status='pending' so they require admin review
// before appearing publicly (status='approved').
// High-confidence records (≥0.75) are auto-flagged for fast approval.

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
import { createLog, logError, printLog } from '../lib/logger'
import {
  SUPPORTED_CITIES,
  CITY_ZIPS,
  type Env,
  type SupportedCity,
  type RunLog,
} from '../lib/types'

// Yelp categories to query per ingestion run (mapped to canonical categories)
const YELP_QUERIES: Array<{ term: string; limit: number }> = [
  { term: 'restaurants',       limit: 20 },
  { term: 'home services',     limit: 15 },
  { term: 'health wellness',   limit: 15 },
  { term: 'beauty salon',      limit: 10 },
  { term: 'pet services',      limit: 10 },
  { term: 'automotive',        limit: 10 },
  { term: 'real estate',       limit: 10 },
  { term: 'education tutoring',limit: 10 },
  { term: 'retail',            limit: 10 },
]

const YELP_BASE = 'https://api.yelp.com/v3/businesses/search'

// ── Fetch businesses from Yelp for a city + term ─────────────────────────────
async function fetchYelpBusinesses(
  apiKey: string,
  city: SupportedCity,
  term: string,
  limit: number,
): Promise<YelpBusiness[]> {
  try {
    const url =
      `${YELP_BASE}?location=${encodeURIComponent(city + ', CA')}&term=${encodeURIComponent(term)}` +
      `&limit=${limit}&sort_by=rating`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (res.status === 401) throw new Error('Yelp API key invalid or expired')
    if (!res.ok)           throw new Error(`Yelp API error ${res.status}`)

    const json = (await res.json()) as { businesses?: YelpBusiness[] }
    return json.businesses ?? []
  } catch (err) {
    throw err
  }
}

// ── Yelp API response shape (partial) ────────────────────────────────────────
interface YelpBusiness {
  id:          string
  name:        string
  rating?:     number
  review_count?: number
  phone?:      string
  image_url?:  string
  url?:        string
  categories?: Array<{ alias: string; title: string }>
  location?: {
    address1?: string
    city?:     string
    state?:    string
    zip_code?: string
    display_address?: string[]
  }
}

// ── Main directory ingestion function ─────────────────────────────────────────
export async function runDirectoryIngestion(env: Env): Promise<RunLog[]> {
  const logs: RunLog[] = []

  if (!env.YELP_API_KEY) {
    console.warn('[directory] YELP_API_KEY not set — skipping Yelp ingestion')
    const log = createLog('directory', 'yelp-skipped')
    logError(log, 'YELP_API_KEY environment secret not configured')
    printLog(log, Date.now())
    logs.push(log)
    return logs
  }

  for (const city of SUPPORTED_CITIES) {
    const cityLog = createLog('directory', 'yelp', city)
    const startMs = Date.now()

    for (const { term, limit } of YELP_QUERIES) {
      let raw: YelpBusiness[]
      try {
        raw = await fetchYelpBusinesses(env.YELP_API_KEY, city, term, limit)
      } catch (err) {
        logError(cityLog, `Yelp fetch failed for term "${term}": ${String(err)}`)
        continue
      }

      cityLog.discovered += raw.length

      for (const biz of raw) {
        try {
          await processYelpBusiness(env, city, biz, cityLog)
        } catch (err) {
          logError(cityLog, `Error processing "${biz.name}": ${String(err)}`)
        }
      }
    }

    printLog(cityLog, startMs)
    logs.push(cityLog)
  }

  return logs
}

// ── Process a single Yelp business ───────────────────────────────────────────
async function processYelpBusiness(
  env: Env,
  city: SupportedCity,
  raw: YelpBusiness,
  log: RunLog,
): Promise<void> {
  // 1. Normalize
  const name        = normalizeString(raw.name) ?? ''
  if (!name) { log.skipped++; return }

  const normalCity  = normalizeCity(raw.location?.city ?? city)
  if (!normalCity)  { log.skipped++; return }   // outside supported cities

  const category    = normalizeCategory(raw.categories?.[0]?.title)
  const address     = normalizeAddress(
    raw.location?.display_address?.join(', ') ?? raw.location?.address1,
  )
  const phone       = normalizePhone(raw.phone)
  const website     = normalizeUrl(raw.url)

  // 2. Resolve image
  const { url: imageUrl, source: imageSource } = await resolveBusinessImage({
    apiImage:   raw.image_url,
    websiteUrl: website,
  })
  if (imageUrl) log.images_captured++
  else          log.images_missing++

  // 3. Confidence + review flag
  const fields = { name, city: normalCity, category, address, phone, website, description: undefined, image_url: imageUrl }
  const confidence = scoreConfidence(fields)
  const review     = needsReview(confidence)
  if (review) log.flagged++

  // 4. Deduplication
  const existing = await findExistingBusiness(env, name, normalCity, phone ?? undefined)

  const now = new Date().toISOString()

  if (existing) {
    // UPDATE — fill in missing fields, refresh metadata
    const patch: Record<string, unknown> = { last_ingested_at: now }
    if (!existing.image_url  && imageUrl) { patch.image_url  = imageUrl;  patch.image_source = imageSource }
    if (!existing.phone      && phone)    patch.phone      = phone
    if (!existing.website    && website)  patch.website    = website
    if (!existing.address    && address)  patch.address    = address

    await updateRow(env, 'businesses', String(existing.id), patch)
    log.updated++
  } else {
    // INSERT — new record
    const row = {
      name,
      category,
      city:              normalCity,
      address:           address    ?? null,
      phone:             phone      ?? null,
      website:           website    ?? null,
      image_url:         imageUrl   ?? null,
      image_source:      imageSource !== 'none' ? imageSource : null,
      status:            'pending',
      source:            'yelp',
      source_url:        raw.url    ?? null,
      last_ingested_at:  now,
      confidence_score:  confidence,
      needs_review:      review,
      ingestion_status:  review ? 'flagged' : 'inserted',
      // Preserve Yelp rating as a signal (admin can validate)
      rating:            raw.rating      ?? null,
      review_count:      raw.review_count ?? null,
    }

    const result = await upsertRow(env, 'businesses', row, 'name,city')
    if (result.ok) log.inserted++
    else           logError(log, `Insert failed for "${name}": ${result.error}`)
  }
}
