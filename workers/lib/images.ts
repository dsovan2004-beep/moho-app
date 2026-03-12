// ── Image URL ingestion helpers ───────────────────────────────────────────────
// Rules:
//  • Ingest image URLs only — never download binaries
//  • Never fail ingestion if image is unavailable
//  • Prefer official/public source images
//  • Always log whether an image was captured or missing
//
// Fallback order (applies to all domains):
//  1. Source API direct image field
//  2. og:image from source URL
//  3. schema.org image
//  4. null (leave blank — UI handles gracefully)

const FETCH_TIMEOUT_MS = 5000

// ── Safely fetch a URL and return the HTML body ───────────────────────────────
async function fetchHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'MoHoLocal-Bot/1.0 (+https://www.moholocal.com)' },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

// ── Extract og:image from raw HTML ───────────────────────────────────────────
export function extractOgImage(html: string): string | null {
  // <meta property="og:image" content="...">
  const ogMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  )
  if (ogMatch) return ogMatch[1]

  // alternate attribute order
  const altMatch = html.match(
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  )
  return altMatch ? altMatch[1] : null
}

// ── Extract schema.org image from raw HTML ────────────────────────────────────
export function extractSchemaImage(html: string): string | null {
  const ldMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  if (!ldMatch) return null
  for (const block of ldMatch) {
    try {
      const json = JSON.parse(block.replace(/<\/?script[^>]*>/gi, '').trim())
      const img = json.image || json.logo
      if (typeof img === 'string')          return img
      if (typeof img?.url === 'string')     return img.url
      if (Array.isArray(img) && img[0])     return typeof img[0] === 'string' ? img[0] : img[0]?.url
    } catch { /* skip malformed block */ }
  }
  return null
}

// ── Resolve an image URL from a public source page ───────────────────────────
// Returns { url, source } or { url: null, source: 'none' }
export async function resolveImageFromUrl(
  pageUrl: string | undefined | null,
): Promise<{ url: string | null; source: string }> {
  if (!pageUrl) return { url: null, source: 'none' }

  const html = await fetchHtml(pageUrl)
  if (!html)   return { url: null, source: 'none' }

  const og = extractOgImage(html)
  if (og) return { url: og, source: 'og:image' }

  const schema = extractSchemaImage(html)
  if (schema) return { url: schema, source: 'schema.org' }

  return { url: null, source: 'none' }
}

// ── Business image resolver ───────────────────────────────────────────────────
// Priority: Yelp image → og:image on website → null
export async function resolveBusinessImage(opts: {
  apiImage?:    string | null  // direct from API (e.g. Yelp image_url)
  websiteUrl?:  string | null  // business website for fallback scrape
}): Promise<{ url: string | null; source: string }> {
  if (opts.apiImage) return { url: opts.apiImage, source: 'yelp' }

  if (opts.websiteUrl) {
    const scraped = await resolveImageFromUrl(opts.websiteUrl)
    if (scraped.url) return scraped
  }

  return { url: null, source: 'none' }
}

// ── Event image resolver ──────────────────────────────────────────────────────
// Priority: API logo/image → event URL og:image → null
export async function resolveEventImage(opts: {
  apiImage?:  string | null   // e.g. Eventbrite logo.url
  eventUrl?:  string | null   // event listing URL for fallback
}): Promise<{ url: string | null; source: string }> {
  if (opts.apiImage) return { url: opts.apiImage, source: 'eventbrite' }

  if (opts.eventUrl) {
    const scraped = await resolveImageFromUrl(opts.eventUrl)
    if (scraped.url) return scraped
  }

  return { url: null, source: 'none' }
}

// ── Lost & Found image resolver ───────────────────────────────────────────────
// Priority: API primary photo → source page og:image → null
export async function resolveLostFoundImage(opts: {
  apiImage?:   string | null   // e.g. PetFinder photos[0].full
  sourceUrl?:  string | null   // listing URL for fallback
}): Promise<{ url: string | null; source: string }> {
  if (opts.apiImage) return { url: opts.apiImage, source: 'petfinder' }

  if (opts.sourceUrl) {
    const scraped = await resolveImageFromUrl(opts.sourceUrl)
    if (scraped.url) return scraped
  }

  return { url: null, source: 'none' }
}
