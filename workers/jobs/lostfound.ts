// ── Lost & Found ingestion handler ───────────────────────────────────────────
// Source priority:
//   1. PetFinder API  (PETFINDER_CLIENT_ID + PETFINDER_CLIENT_SECRET required)
//      → ingests "found" status animals reported in the 209/East Bay area
//   2. 209times RSS feed (public fallback — scrapes lost pet articles)
//
// After ingestion, stale records (older than 30 days, not reunited) are archived.
//
// All ingested records are inserted with status='lost' and needs_review=true.
// The type NOT NULL constraint is satisfied — defaults to animal type string.

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
import { createLog, logError, printLog } from '../lib/logger'
import {
  SUPPORTED_CITIES,
  CITY_ZIPS,
  type Env,
  type SupportedCity,
  type RunLog,
} from '../lib/types'

const PETFINDER_AUTH_URL = 'https://api.petfinder.com/v2/oauth2/token'
const PETFINDER_ANIMALS_URL = 'https://api.petfinder.com/v2/animals'

// ── PetFinder API shapes (partial) ───────────────────────────────────────────
interface PetFinderAnimal {
  id:           number
  name?:        string
  type?:        string
  species?:     string
  breeds?:      { primary?: string; secondary?: string }
  age?:         string
  gender?:      string
  description?: string
  contact?: {
    name?:    string
    phone?:   string
    email?:   string
  }
  photos?: Array<{ full?: string; large?: string; medium?: string }>
  url?:    string
  published_at?: string
}

// ── Get PetFinder OAuth token ─────────────────────────────────────────────────
async function getPetFinderToken(
  clientId: string,
  clientSecret: string,
): Promise<string | null> {
  try {
    const res = await fetch(PETFINDER_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     clientId,
        client_secret: clientSecret,
      }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { access_token?: string }
    return json.access_token ?? null
  } catch {
    return null
  }
}

// ── Fetch animals from PetFinder for a zip code ────────────────────────────────
async function fetchPetFinderAnimals(
  token: string,
  zip: string,
  status: 'adoptable' | 'found' = 'found',
): Promise<PetFinderAnimal[]> {
  const url =
    `${PETFINDER_ANIMALS_URL}?location=${zip}&distance=15&status=${status}&limit=25&sort=recent`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error(`PetFinder API error ${res.status}`)
  const json = (await res.json()) as { animals?: PetFinderAnimal[] }
  return json.animals ?? []
}

// ── 209 times RSS fallback — parse lost pet mentions ─────────────────────────
// 209times publishes a public RSS feed. We scan titles/descriptions for
// "lost", "found", "missing", "pet", "dog", "cat" keywords.

interface RssItem {
  title?:       string
  link?:        string
  pubDate?:     string
  description?: string
  city?:        string
}

const NEWS_RSS_FEEDS = [
  'https://www.209times.com/feed',
  'https://www.tracypress.com/feed',
]

const PET_KEYWORDS = /\b(lost|found|missing|pet|dog|cat|puppy|kitten|reward|stray)\b/i

async function fetchNewsRssItems(): Promise<RssItem[]> {
  const items: RssItem[] = []
  for (const feedUrl of NEWS_RSS_FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        headers: { 'User-Agent': 'MoHoLocal-Bot/1.0 (+https://www.moholocal.com)' },
      })
      if (!res.ok) continue
      const xml  = await res.text()
      const matches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)
      for (const m of matches) {
        const block = m[1]
        const get   = (tag: string) =>
          block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))?.[1]
          ?? block.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`))?.[1]
        const title = get('title') ?? ''
        const desc  = get('description') ?? ''
        if (PET_KEYWORDS.test(title) || PET_KEYWORDS.test(desc)) {
          items.push({
            title:       title,
            link:        get('link'),
            pubDate:     get('pubDate'),
            description: desc,
          })
        }
      }
    } catch { /* skip this feed */ }
  }
  return items
}

// ── Guess city from title/description text ────────────────────────────────────
function guessCityFromText(text: string): SupportedCity | null {
  for (const city of SUPPORTED_CITIES) {
    if (text.toLowerCase().includes(city.toLowerCase())) return city
  }
  return null
}

// ── Main lost & found ingestion ───────────────────────────────────────────────
export async function runLostFoundIngestion(env: Env): Promise<RunLog[]> {
  const logs: RunLog[] = []

  // Archive stale records first
  try {
    const archived = await archiveStaleLostFound(env)
    if (archived > 0) console.log(`[lost_and_found] Archived ${archived} stale records`)
  } catch (err) {
    console.warn(`[lost_and_found] Archive step failed: ${String(err)}`)
  }

  // ── Source 1: PetFinder API ──────────────────────────────────────────────
  if (env.PETFINDER_CLIENT_ID && env.PETFINDER_CLIENT_SECRET) {
    const token = await getPetFinderToken(
      env.PETFINDER_CLIENT_ID,
      env.PETFINDER_CLIENT_SECRET,
    )

    if (!token) {
      console.warn('[lost_and_found] PetFinder token fetch failed')
    } else {
      for (const city of SUPPORTED_CITIES) {
        const cityLog = createLog('lost_and_found', 'petfinder', city)
        const startMs = Date.now()

        const zips = CITY_ZIPS[city]
        for (const zip of zips) {
          let animals: PetFinderAnimal[]
          try {
            animals = await fetchPetFinderAnimals(token, zip, 'found')
          } catch (err) {
            logError(cityLog, `PetFinder fetch failed for zip ${zip}: ${String(err)}`)
            continue
          }

          cityLog.discovered += animals.length
          for (const animal of animals) {
            try {
              await processPetFinderAnimal(env, city, animal, cityLog)
            } catch (err) {
              logError(cityLog, `Error processing animal ${animal.id}: ${String(err)}`)
            }
          }
        }

        printLog(cityLog, startMs)
        logs.push(cityLog)
      }
    }
  } else {
    console.warn('[lost_and_found] PetFinder keys not set — using RSS fallback only')
  }

  // ── Source 2: 209 area news RSS fallback ────────────────────────────────
  const newsLog = createLog('lost_and_found', '209-news-rss')
  const startMs = Date.now()
  const rssItems = await fetchNewsRssItems()
  newsLog.discovered = rssItems.length

  for (const item of rssItems) {
    try {
      await processNewsRssItem(env, item, newsLog)
    } catch (err) {
      logError(newsLog, `RSS item error: ${String(err)}`)
    }
  }

  printLog(newsLog, startMs)
  logs.push(newsLog)

  return logs
}

// ── Process a PetFinder animal ────────────────────────────────────────────────
async function processPetFinderAnimal(
  env: Env,
  city: SupportedCity,
  raw: PetFinderAnimal,
  log: RunLog,
): Promise<void> {
  const petName   = normalizeString(raw.name) ?? 'Unknown'
  const animalType = normalizeString(raw.type ?? raw.species) ?? 'Dog'
  const title     = `Found ${animalType}: ${petName}`

  const { url: imageUrl, source: imageSource } = await resolveLostFoundImage({
    apiImage:  raw.photos?.[0]?.full ?? raw.photos?.[0]?.large,
    sourceUrl: raw.url,
  })
  if (imageUrl) log.images_captured++
  else          log.images_missing++

  const confidence = scoreConfidence({
    title, city, type: animalType, pet_name: petName,
    image_url: imageUrl, description: raw.description,
  })
  const review = needsReview(confidence)
  if (review) log.flagged++

  const existing = await findExistingLostFound(env, city, petName, title)
  if (existing) {
    const patch: Record<string, unknown> = { last_ingested_at: new Date().toISOString() }
    if (!existing.image_url && imageUrl) { patch.image_url = imageUrl; patch.image_source = imageSource }
    await updateRow(env, 'lost_and_found', String(existing.id), patch)
    log.updated++
    return
  }

  const row = {
    title,
    description:      normalizeString(raw.description) ?? null,
    city,
    status:           'found',    // PetFinder "found" status = animal was found
    type:             animalType, // NOT NULL — required by schema
    pet_name:         petName,
    breed:            raw.breeds?.primary ?? null,
    age:              raw.age ?? null,
    gender:           raw.gender ?? null,
    contact_name:     normalizeString(raw.contact?.name) ?? 'MoHoLocal',
    contact_phone:    normalizePhone(raw.contact?.phone) ?? null,
    image_url:        imageUrl ?? null,
    image_source:     imageSource !== 'none' ? imageSource : null,
    source:           'petfinder',
    source_url:       raw.url ?? null,
    last_ingested_at: new Date().toISOString(),
    confidence_score: confidence,
    needs_review:     true,    // Always review external lost/found records
  }

  const result = await upsertRow(env, 'lost_and_found', row, 'pet_name,city')
  if (result.ok) log.inserted++
  else           logError(log, `Insert failed for "${title}": ${result.error}`)
}

// ── Process a news RSS item mentioning a lost/found pet ──────────────────────
async function processNewsRssItem(
  env: Env,
  raw: RssItem,
  log: RunLog,
): Promise<void> {
  const title = normalizeString(raw.title) ?? ''
  if (!title) { log.skipped++; return }

  const text = `${title} ${raw.description ?? ''}`
  const city = guessCityFromText(text)
  if (!city) { log.skipped++; return }  // can't assign to a city — skip

  // Determine if lost or found
  const statusGuess = /\bfound\b/i.test(title) ? 'found' : 'lost'

  // Guess pet type from content
  let animalType = 'Pet'
  if (/\bdog\b|\bpuppy\b/i.test(text)) animalType = 'Dog'
  else if (/\bcat\b|\bkitten\b/i.test(text)) animalType = 'Cat'

  const { url: imageUrl, source: imageSource } = await resolveLostFoundImage({
    sourceUrl: raw.link,
  })
  if (imageUrl) log.images_captured++
  else          log.images_missing++

  const confidence = scoreConfidence({ title, city, type: animalType, image_url: imageUrl })
  if (needsReview(confidence)) log.flagged++

  const existing = await findExistingLostFound(env, city, undefined, title)
  if (existing) { log.skipped++; return }

  const row = {
    title,
    description:      normalizeString(raw.description) ?? null,
    city,
    status:           statusGuess,
    type:             animalType,   // NOT NULL
    contact_name:     '209 Area News',
    image_url:        imageUrl ?? null,
    image_source:     imageSource !== 'none' ? imageSource : null,
    source:           'news-rss',
    source_url:       raw.link ?? null,
    last_ingested_at: new Date().toISOString(),
    confidence_score: confidence,
    needs_review:     true,
  }

  const result = await upsertRow(env, 'lost_and_found', row, 'title,city')
  if (result.ok) log.inserted++
  else           logError(log, `RSS insert failed for "${title}": ${result.error}`)
}
