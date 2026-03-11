// ── Lost & Found ingestion handler ────────────────────────────────────────────
//
// DEFAULT SOURCES (no credentials required — run every Monday 5am UTC):
//   1. SJAnimalServicesAdapter — San Joaquin County Animal Services (public)
//   2. Times209Adapter         — 209times.com/feed/ pet keyword filter
//   3. TracyPressAdapter       — tracypress.com/feed/ pet keyword filter
//   4. PatchAdapter            — patch.com/california/[city]/rss.xml pet filter
//
// OPTIONAL (only runs when PETFINDER_CLIENT_ID + SECRET are present):
//   5. PetFinderAdapter        — PetFinder API OAuth2
//
// All records land with needs_review=true. Human always reviews before publish.
// Stale records (>30 days) auto-archived before ingestion.
// Per-source stats tracked and returned in /run/lostfound response.
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
  fetchFirstWorkingRss,
  parseRssItems,
  stripHtml,
  type SourceAdapter,
  type RawLostFound,
  type AdapterResult,
} from '../lib/sources'
import {
  SUPPORTED_CITIES,
  CITY_ZIPS,
  type Env,
  type SupportedCity,
  type RunLog,
  type PerSourceStats,
} from '../lib/types'

// ── Keyword filters ───────────────────────────────────────────────────────────

const PET_KEYWORDS  = /\b(lost|found|missing|reward|stray|escaped|runaway|dog|puppy|cat|kitten|bird|rabbit|pet|animal)\b/i
const LOST_KEYWORDS = /\blost\b/i
const FOUND_KEYWORDS = /\bfound\b/i

function hasPetKeyword(text: string)   { return PET_KEYWORDS.test(text) }
function inferStatus(text: string): 'lost' | 'found' {
  return FOUND_KEYWORDS.test(text) && !LOST_KEYWORDS.test(text) ? 'found' : 'lost'
}
function inferPetType(text: string): string {
  const l = text.toLowerCase()
  if (/\bdog\b|\bpuppy\b|\bpuppies\b|\bcanine\b/.test(l)) return 'Dog'
  if (/\bcat\b|\bkitten\b|\bfeline\b/.test(l))            return 'Cat'
  if (/\bbird\b|\bparrot\b|\bcockatiel\b/.test(l))        return 'Bird'
  if (/\brabbit\b|\bbunny\b/.test(l))                     return 'Rabbit'
  return 'Pet'
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

function rssToLostFound(
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
    if (!city) continue
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

// ── Adapter 1: San Joaquin County Animal Services (DEFAULT) ───────────────────
// SJ County Animal Services uses Chameleon/PetPoint software.
// Try known public feed paths for found/stray animals.

const SJANIMAL_FEEDS = [
  'https://www.sjgov.org/department/animalservices/rss.xml',
  'https://www.sjgov.org/department/animalservices/lost-found/rss',
  'https://sjacd.org/rss.xml',
  'https://www.petango.com/Widgets/PostAdoption/FoundAnimals?accountId=19839&size=50', // SJ County Petango public
]

const SJAnimalServicesAdapter: SourceAdapter<RawLostFound> = {
  name:     'sj-animal-services',
  type:     'rss',
  required: false,
  isAvailable: () => true,

  async fetch() {
    const found = await fetchFirstWorkingRss(SJANIMAL_FEEDS)
    if (!found) return []

    const results: RawLostFound[] = []
    for (const item of parseRssItems(found.xml)) {
      if (!item.title) continue
      const city = inferCity(item.title + ' ' + item.description) ?? 'Tracy' // default to Tracy area
      results.push({
        title:       item.title,
        description: stripHtml(item.description).slice(0, 600),
        type:        'found',   // Animal services primarily posts found/stray animals
        petType:     inferPetType(item.title + ' ' + item.description),
        city,
        imageUrl:    item.enclosureUrl,
        sourceUrl:   item.link || found.url,
        source:      'sj-animal-services',
      })
    }
    return results
  },
}

// ── Adapter 2: 209 Times RSS — pet keyword filter (DEFAULT) ──────────────────

const TIMES209_URLS = [
  'https://209times.com/feed/',
  'https://www.209times.com/feed/',
  'https://209times.com/rss.xml',
]

const Times209Adapter: SourceAdapter<RawLostFound> = {
  name:     '209times-rss',
  type:     'rss',
  required: false,
  isAvailable: () => true,

  async fetch() {
    const found = await fetchFirstWorkingRss(TIMES209_URLS)
    if (!found) return []
    return rssToLostFound(parseRssItems(found.xml), null, '209times-rss')
  },
}

// ── Adapter 3: Tracy Press RSS — pet keyword filter (DEFAULT) ─────────────────

const TRACYPRESS_URLS = [
  'https://www.tracypress.com/feed/',
  'https://tracypress.com/feed/',
  'https://www.tracypress.com/rss.xml',
]

const TracyPressAdapter: SourceAdapter<RawLostFound> = {
  name:     'tracy-press-rss',
  type:     'rss',
  required: false,
  isAvailable: () => true,

  async fetch() {
    const found = await fetchFirstWorkingRss(TRACYPRESS_URLS)
    if (!found) return []
    return rssToLostFound(parseRssItems(found.xml), 'Tracy', 'tracy-press-rss')
  },
}

// ── Adapter 4: Patch.com RSS — pet keyword filter (DEFAULT) ──────────────────

const PATCH_FEEDS: Array<{ city: SupportedCity; url: string }> = [
  { city: 'Tracy',     url: 'https://patch.com/california/tracy/rss.xml' },
  { city: 'Manteca',   url: 'https://patch.com/california/manteca/rss.xml' },
  { city: 'Lathrop',   url: 'https://patch.com/california/lathrop/rss.xml' },
  { city: 'Brentwood', url: 'https://patch.com/california/brentwood/rss.xml' },
]

const PatchAdapter: SourceAdapter<RawLostFound> = {
  name:     'patch-rss',
  type:     'rss',
  required: false,
  isAvailable: () => true,

  async fetch() {
    const results: RawLostFound[] = []
    for (const feed of PATCH_FEEDS) {
      let xml: string
      try { xml = await fetchRss(feed.url) } catch { continue }
      results.push(...rssToLostFound(parseRssItems(xml), feed.city, 'patch-rss'))
    }
    return results
  },
}

// ── Optional Adapter 5: PetFinder API ────────────────────────────────────────

interface PetFinderAnimal {
  id:           number
  name?:        string
  type?:        string
  species?:     string
  description?: string
  contact?: { name?: string; phone?: string }
  photos?:  Array<{ full?: string; large?: string }>
  url?:     string
}

const PetFinderAdapter: SourceAdapter<RawLostFound> = {
  name:     'petfinder-api',
  type:     'api',
  required: false,
  isAvailable: (env) => Boolean(env.PETFINDER_CLIENT_ID && env.PETFINDER_CLIENT_SECRET),

  async fetch(env) {
    // Fetch OAuth token
    let token: string | null = null
    try {
      const res = await fetch('https://api.petfinder.com/v2/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'client_credentials',
          client_id:     env.PETFINDER_CLIENT_ID!,
          client_secret: env.PETFINDER_CLIENT_SECRET!,
        }),
      })
      if (res.ok) {
        const json = (await res.json()) as { access_token?: string }
        token = json.access_token ?? null
      }
    } catch { /* token stays null */ }

    if (!token) return []

    const results: RawLostFound[] = []
    for (const city of SUPPORTED_CITIES) {
      for (const zip of CITY_ZIPS[city]) {
        try {
          const url = `https://api.petfinder.com/v2/animals?location=${zip}&distance=15&status=found&limit=25&sort=recent`
          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
          if (!res.ok) continue
          const json = (await res.json()) as { animals?: PetFinderAnimal[] }

          for (const animal of json.animals ?? []) {
            const petName  = normalizeString(animal.name) ?? 'Unknown'
            const petType  = normalizeString(animal.type ?? animal.species) ?? 'Pet'
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

  try {
    const archived = await archiveStaleLostFound(env)
    if (archived > 0) console.log(`[lost_and_found] Archived ${archived} stale records`)
  } catch (err) {
    logWarning(log, `Archive step failed: ${String(err)}`)
  }

  const adapterResults: AdapterResult<RawLostFound>[] = await runAdapters(
    [SJAnimalServicesAdapter, Times209Adapter, TracyPressAdapter, PatchAdapter, PetFinderAdapter],
    env,
    (msg) => logWarning(log, msg),
  )

  for (const result of adapterResults) {
    log.per_source[result.source] = { raw_items: result.raw_count, inserted: 0, updated: 0, skipped: 0, flagged: 0 }
    log.discovered += result.raw_count

    for (const raw of result.items) {
      try {
        await processLostFound(env, raw, log)
      } catch (err) {
        logError(log, `[${result.source}] Error processing "${raw.title}": ${String(err)}`)
      }
    }
  }

  printLog(log, startMs)
  return [log]
}

// ── Process a single record ───────────────────────────────────────────────────

async function processLostFound(env: Env, raw: RawLostFound, log: RunLog): Promise<void> {
  const src  = log.per_source[raw.source] as PerSourceStats | undefined
  const bump = (field: keyof PerSourceStats) => { if (src) src[field]++ }

  const title = normalizeString(raw.title) ?? ''
  if (!title) { log.skipped++; bump('skipped'); return }

  const city = normalizeCity(raw.city)
  if (!city) { log.skipped++; bump('skipped'); return }

  const { url: imageUrl, source: imageSource } = await resolveLostFoundImage({
    apiImage:  raw.imageUrl,
    sourceUrl: raw.sourceUrl,
  })
  if (imageUrl) log.images_captured++
  else          log.images_missing++

  const petType = raw.petType ?? inferPetType(title + ' ' + (raw.description ?? ''))

  const confidence = scoreConfidence({ title, city, type: petType, pet_name: raw.petName, image_url: imageUrl, description: raw.description })
  const review     = needsReview(confidence)
  if (review) { log.flagged++; bump('flagged') }

  const existing = await findExistingLostFound(env, city, raw.petName, title)
  const now      = new Date().toISOString()

  if (existing) {
    const patch: Record<string, unknown> = { last_ingested_at: now }
    if (!existing.image_url && imageUrl) { patch.image_url = imageUrl; patch.image_source = imageSource }
    await updateRow(env, 'lost_and_found', String(existing.id), patch)
    log.updated++; bump('updated')
  } else {
    const result = await upsertRow(env, 'lost_and_found', {
      title,
      description:      raw.description ? stripHtml(raw.description).slice(0, 800) : null,
      city,
      status:           raw.type,
      type:             petType,
      pet_name:         raw.petName ?? null,
      contact_name:     'MoHoLocal',
      image_url:        imageUrl   ?? null,
      image_source:     imageSource !== 'none' ? imageSource : null,
      source:           raw.source,
      source_url:       raw.sourceUrl ?? null,
      last_ingested_at: now,
      confidence_score: confidence,
      needs_review:     true,
      ingestion_status: 'active',
    }, 'title,city')

    if (result.ok) { log.inserted++; bump('inserted') }
    else           logError(log, `[${raw.source}] Insert failed for "${title}": ${result.error}`)
  }
}
