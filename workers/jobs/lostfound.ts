// ── Lost & Found ingestion handler ────────────────────────────────────────────
//
// DEFAULT SOURCES (no credentials required — run every Monday 5am UTC):
//   1. Times209RssAdapter    — 209times.com/feed filtered by pet/lost keywords (public)
//   2. TracyPressRssAdapter  — tracypress.com/feed filtered by pet/lost keywords (public)
//   3. PatchRssAdapter       — patch.com/california/[city]/rss.xml pet filter (public)
//
// OPTIONAL ADAPTER (only runs when PETFINDER_CLIENT_ID + PETFINDER_CLIENT_SECRET are present):
//   4. PetFinderAdapter      — PetFinder API OAuth2
//
// Stale records (older than 30 days, not reunited) are archived before ingestion.
// ALL ingested records have needs_review=true — a human always reviews before publish.
// The `type` column NOT NULL constraint is satisfied from inferred pet type.
// ─────────────────────────────────────────────────────────────────────────────

import {
  normalizeCity,
  normalizeString,
  normalizePhone,
  scoreConfidence,
  needsReview,
} from '../lib/normalize'
import { resolveLostFoundImage } from '../lib/images'
import { findExistingLostFound } from '../lib/deduplicate'
import { upsertRow, updateRow, archiveStaleLostFound } from '../lib/supabase'
import { createLog, logError, logWarning, printLog } from '../lib/logger'
import {
  runAdapters,
  fetchRss,
  parseRssItems,
  stripHtml,
  type SourceAdapter,
  type RawLostFound,
} from '../lib/sources'
import {
  SUPPORTED_CITIES,
  CITY_ZIPS,
  type Env,
  type SupportedCity,
  type RunLog,
} from '../lib/types'

// ── Keyword filter ────────────────────────────────────────────────────────────
// Applied to titles + descriptions to identify pet-related news RSS items.

const PET_KEYWORDS = /\b(lost|found|missing|reward|stray|escaped|runaway|dog|puppy|cat|kitten|bird|rabbit|pet|animal)\b/i

function hasPetKeyword(text: string): boolean {
  return PET_KEYWORDS.test(text)
}

// ── City inference from text ──────────────────────────────────────────────────

function inferCity(text: string): SupportedCity | null {
  const lower = text.toLowerCase()
  if (lower.includes('mountain house')) return 'Mountain House'
  if (lower.includes('brentwood'))      return 'Brentwood'
  if (lower.includes('lathrop'))        return 'Lathrop'
  if (lower.includes('manteca'))        return 'Manteca'
  if (lower.includes('tracy'))          return 'Tracy'
  return null
}

// ── Pet type inference from text ──────────────────────────────────────────────

function inferPetType(text: string): string {
  const lower = text.toLowerCase()
  if (/\bdog\b|\bpuppy\b|\bpuppies\b|\bcanine\b/.test(lower)) return 'Dog'
  if (/\bcat\b|\bkitten\b|\bfeline\b/.test(lower))            return 'Cat'
  if (/\bbird\b|\bparrot\b|\bcockatiel\b/.test(lower))        return 'Bird'
  if (/\brabbit\b|\bbunny\b/.test(lower))                     return 'Rabbit'
  return 'Pet'
}

// ── Lost/found status inference ───────────────────────────────────────────────

function inferStatus(text: string): 'lost' | 'found' {
  return /\bfound\b/i.test(text) && !/\blost\b/i.test(text) ? 'found' : 'lost'
}

// ── Shared RSS-to-RawLostFound converter ─────────────────────────────────────

function rssItemsToLostFound(
  items: ReturnType<typeof parseRssItems>,
  defaultCity: SupportedCity | null,
  source: string,
): RawLostFound[] {
  const results: RawLostFound[] = []

  for (const item of items) {
    if (!item.title) continue
    const text = `${item.title} ${item.description ?? ''}`
    if (!hasPetKeyword(text)) continue

    const city = defaultCity ?? inferCity(text)
    if (!city) continue   // can't attribute to a supported city — skip

    results.push({
      title:       item.title,
      description: stripHtml(item.description).slice(0, 600),
      type:        inferStatus(text),
      petType:     inferPetType(text),
      city,
      imageUrl:    item.enclosureUrl,
      sourceUrl:   item.link || undefined,
      source,
    })
  }

  return results
}

// ── Adapter 1: 209 Times RSS (DEFAULT) ───────────────────────────────────────

const Times209RssAdapter: SourceAdapter<RawLostFound> = {
  name:     '209times-rss',
  type:     'rss',
  required: false,

  isAvailable: () => true,

  async fetch() {
    let xml: string
    try { xml = await fetchRss('https://209times.com/feed/') } catch { return [] }
    return rssItemsToLostFound(parseRssItems(xml), null, '209times-rss')
  },
}

// ── Adapter 2: Tracy Press RSS (DEFAULT) ─────────────────────────────────────

const TracyPressRssAdapter: SourceAdapter<RawLostFound> = {
  name:     'tracy-press-rss',
  type:     'rss',
  required: false,

  isAvailable: () => true,

  async fetch() {
    let xml: string
    try { xml = await fetchRss('https://www.tracypress.com/feed/') } catch { return [] }
    return rssItemsToLostFound(parseRssItems(xml), 'Tracy', 'tracy-press-rss')
  },
}

// ── Adapter 3: Patch.com RSS (DEFAULT) ───────────────────────────────────────

const PATCH_FEEDS: Array<{ city: SupportedCity; url: string }> = [
  { city: 'Tracy',     url: 'https://patch.com/california/tracy/rss.xml' },
  { city: 'Manteca',   url: 'https://patch.com/california/manteca/rss.xml' },
  { city: 'Lathrop',   url: 'https://patch.com/california/lathrop/rss.xml' },
  { city: 'Brentwood', url: 'https://patch.com/california/brentwood/rss.xml' },
]

const PatchRssAdapter: SourceAdapter<RawLostFound> = {
  name:     'patch-rss',
  type:     'rss',
  required: false,

  isAvailable: () => true,

  async fetch() {
    const results: RawLostFound[] = []
    for (const feed of PATCH_FEEDS) {
      let xml: string
      try { xml = await fetchRss(feed.url) } catch { continue }
      results.push(...rssItemsToLostFound(parseRssItems(xml), feed.city, 'patch-rss'))
    }
    return results
  },
}

// ── Optional Adapter 4: PetFinder API ────────────────────────────────────────
// Only runs when PETFINDER_CLIENT_ID + PETFINDER_CLIENT_SECRET are both present.

interface PetFinderAnimal {
  id:           number
  name?:        string
  type?:        string
  species?:     string
  breeds?:      { primary?: string }
  age?:         string
  gender?:      string
  description?: string
  contact?: { name?: string; phone?: string }
  photos?:  Array<{ full?: string; large?: string }>
  url?:     string
}

async function getPetFinderToken(id: string, secret: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.petfinder.com/v2/oauth2/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: secret }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { access_token?: string }
    return json.access_token ?? null
  } catch {
    return null
  }
}

const PetFinderAdapter: SourceAdapter<RawLostFound> = {
  name:     'petfinder-api',
  type:     'api',
  required: false,

  isAvailable: (env) => Boolean(env.PETFINDER_CLIENT_ID && env.PETFINDER_CLIENT_SECRET),

  async fetch(env) {
    const token = await getPetFinderToken(env.PETFINDER_CLIENT_ID!, env.PETFINDER_CLIENT_SECRET!)
    if (!token) {
      console.warn('[petfinder] Token fetch failed')
      return []
    }

    const results: RawLostFound[] = []

    for (const city of SUPPORTED_CITIES) {
      for (const zip of CITY_ZIPS[city]) {
        try {
          const url = `https://api.petfinder.com/v2/animals?location=${zip}&distance=15&status=found&limit=25&sort=recent`
          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
          if (!res.ok) continue

          const json = (await res.json()) as { animals?: PetFinderAnimal[] }
          for (const animal of json.animals ?? []) {
            const petName   = normalizeString(animal.name) ?? 'Unknown'
            const petType   = normalizeString(animal.type ?? animal.species) ?? 'Pet'
            results.push({
              title:       `Found ${petType}: ${petName}`,
              description: animal.description?.slice(0, 600),
              type:        'found',
              petName,
              petType,
              city,
              imageUrl:    animal.photos?.[0]?.full ?? animal.photos?.[0]?.large,
              sourceUrl:   animal.url,
              source:      'petfinder-api',
              contactInfo: [animal.contact?.name, normalizePhone(animal.contact?.phone)]
                .filter(Boolean).join(' · ') || undefined,
            })
          }
        } catch (err) {
          console.warn(`[petfinder] ${city}/${zip}: ${String(err)}`)
        }
      }
    }

    return results
  },
}

// ── Main entry point ──────────────────────────────────────────────────────────

export async function runLostFoundIngestion(env: Env): Promise<RunLog[]> {
  const log     = createLog('lost_and_found', 'multi-source')
  const startMs = Date.now()

  // Archive stale records first
  try {
    const archived = await archiveStaleLostFound(env)
    if (archived > 0) console.log(`[lost_and_found] Archived ${archived} stale records`)
  } catch (err) {
    logWarning(log, `Archive step failed: ${String(err)}`)
  }

  const adapters: SourceAdapter<RawLostFound>[] = [
    Times209RssAdapter,
    TracyPressRssAdapter,
    PatchRssAdapter,
    PetFinderAdapter,   // silently skipped unless both PetFinder secrets are present
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
      await processLostFound(env, raw, log)
    } catch (err) {
      logError(log, `Error processing "${raw.title}": ${String(err)}`)
    }
  }

  printLog(log, startMs)
  return [log]
}

// ── Process a single raw lost/found record ────────────────────────────────────

async function processLostFound(env: Env, raw: RawLostFound, log: RunLog): Promise<void> {
  const title = normalizeString(raw.title) ?? ''
  if (!title) { log.skipped++; return }

  const city = normalizeCity(raw.city)
  if (!city) { log.skipped++; return }

  const { url: imageUrl, source: imageSource } = await resolveLostFoundImage({
    apiImage:  raw.imageUrl,
    sourceUrl: raw.sourceUrl,
  })
  if (imageUrl) log.images_captured++
  else          log.images_missing++

  const petType = raw.petType ?? inferPetType(title + ' ' + (raw.description ?? ''))

  const confidence = scoreConfidence({
    title,
    city,
    type:      petType,
    pet_name:  raw.petName,
    image_url: imageUrl,
    description: raw.description,
  })
  const review = needsReview(confidence)
  if (review) log.flagged++

  const existing = await findExistingLostFound(env, city, raw.petName, title)
  const now      = new Date().toISOString()

  if (existing) {
    const patch: Record<string, unknown> = { last_ingested_at: now }
    if (!existing.image_url && imageUrl) { patch.image_url = imageUrl; patch.image_source = imageSource }
    await updateRow(env, 'lost_and_found', String(existing.id), patch)
    log.updated++
  } else {
    const result = await upsertRow(env, 'lost_and_found', {
      title,
      description:      raw.description ? stripHtml(raw.description).slice(0, 800) : null,
      city,
      status:           raw.type,      // 'lost' | 'found'
      type:             petType,       // NOT NULL — required by schema
      pet_name:         raw.petName ?? null,
      contact_name:     'MoHoLocal',
      image_url:        imageUrl   ?? null,
      image_source:     imageSource !== 'none' ? imageSource : null,
      source:           raw.source,
      source_url:       raw.sourceUrl ?? null,
      last_ingested_at: now,
      confidence_score: confidence,
      needs_review:     true,          // ALL external lost/found requires human review
      ingestion_status: 'active',
    }, 'title,city')

    if (result.ok) log.inserted++
    else           logError(log, `Insert failed for "${title}": ${result.error}`)
  }
}
