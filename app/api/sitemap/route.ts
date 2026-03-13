export const runtime = 'edge'

const BASE = 'https://www.moholocal.com'

const CITIES = [
  'mountain-house',
  'tracy',
  'lathrop',
  'manteca',
  'brentwood',
]

const CATEGORY_SLUGS = [
  'restaurants',
  'health-wellness',
  'beauty-spa',
  'retail',
  'education',
  'automotive',
  'real-estate',
  'home-services',
  'pet-services',
]

const BEST_OF_SLUGS = [
  'restaurants',
  'health-and-wellness',
  'beauty-and-spa',
  'retail',
  'education',
  'automotive',
  'real-estate',
  'home-services',
  'pet-services',
]

interface SitemapEntry {
  loc: string
  priority: string
  changefreq: string
  lastmod?: string
}

async function fetchAll(
  supabaseUrl: string,
  serviceKey: string,
  table: string,
  select: string,
  filters: Record<string, string> = {}
): Promise<Record<string, string>[]> {
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  }

  const results: Record<string, string>[] = []
  const pageSize = 1000
  let offset = 0

  while (true) {
    let qs = `select=${select}`
    for (const [k, v] of Object.entries(filters)) {
      qs += `&${k}=eq.${v}`
    }
    qs += `&limit=${pageSize}&offset=${offset}`

    const url = `${supabaseUrl}/rest/v1/${table}?${qs}`
    const res = await fetch(url, { headers })
    if (!res.ok) break

    const batch: Record<string, string>[] = await res.json()
    results.push(...batch)
    if (batch.length < pageSize) break
    offset += pageSize
  }

  return results
}

function urlTag(entry: SitemapEntry): string {
  const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''
  return `  <url>
    <loc>${entry.loc}</loc>${lastmod}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
}

export async function GET() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  const entries: SitemapEntry[] = []

  const add = (loc: string, priority: string, changefreq: string, lastmod?: string) => {
    entries.push({ loc, priority, changefreq, lastmod })
  }

  // ── Core static pages ────────────────────────────────────────────────
  add(`${BASE}/`,                '1.0', 'daily')
  add(`${BASE}/directory`,       '0.9', 'daily')
  add(`${BASE}/events`,          '0.8', 'weekly')
  add(`${BASE}/community`,       '0.8', 'weekly')
  add(`${BASE}/lost-and-found`,  '0.8', 'daily')
  add(`${BASE}/new-resident`,    '0.7', 'monthly')
  add(`${BASE}/submit-business`, '0.6', 'monthly')

  // ── City landing pages ───────────────────────────────────────────────
  for (const city of CITIES) {
    add(`${BASE}/${city}`, '0.9', 'weekly')
  }

  // ── City/category pages ──────────────────────────────────────────────
  for (const city of CITIES) {
    for (const cat of CATEGORY_SLUGS) {
      add(`${BASE}/${city}/${cat}`, '0.8', 'weekly')
    }
  }

  // ── Best Of pages ────────────────────────────────────────────────────
  for (const city of CITIES) {
    for (const cat of BEST_OF_SLUGS) {
      add(`${BASE}/best/${cat}/${city}`, '0.75', 'weekly')
    }
  }

  // ── New-resident city pages ──────────────────────────────────────────
  for (const city of CITIES) {
    add(`${BASE}/new-resident/${city}`, '0.6', 'monthly')
  }

  // ── Dynamic pages (fetched from Supabase) ───────────────────────────
  if (supabaseUrl && serviceKey) {
    // Businesses
    try {
      const businesses = await fetchAll(
        supabaseUrl, serviceKey,
        'businesses', 'id,updated_at',
        { status: 'approved', verified: 'true' }
      )
      for (const biz of businesses) {
        const lm = (biz.updated_at ?? '').slice(0, 10) || undefined
        add(`${BASE}/business/${biz.id}`, '0.7', 'monthly', lm)
      }
    } catch {
      // non-fatal — static pages already added above
    }

    // Events
    try {
      const events = await fetchAll(supabaseUrl, serviceKey, 'events', 'id,updated_at')
      for (const ev of events) {
        const lm = (ev.updated_at ?? '').slice(0, 10) || undefined
        add(`${BASE}/events/${ev.id}`, '0.6', 'weekly', lm)
      }
    } catch {
      // non-fatal
    }

    // Lost & found
    try {
      const laf = await fetchAll(supabaseUrl, serviceKey, 'lost_and_found', 'id,updated_at')
      for (const item of laf) {
        const lm = (item.updated_at ?? '').slice(0, 10) || undefined
        add(`${BASE}/lost-and-found/${item.id}`, '0.5', 'weekly', lm)
      }
    } catch {
      // non-fatal
    }
  }

  // ── Build XML ────────────────────────────────────────────────────────
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <!-- Auto-generated by /api/sitemap | ${entries.length} URLs -->`,
    ...entries.map(urlTag),
    '</urlset>',
  ].join('\n')

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Cache for 12 hours on Cloudflare edge; revalidate every hour
      'Cache-Control': 'public, max-age=3600, s-maxage=43200, stale-while-revalidate=3600',
    },
  })
}
