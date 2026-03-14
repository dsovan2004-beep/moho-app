export const runtime = 'edge'

/**
 * Dynamic sitemap at /sitemap.xml — the standard location Google Search Console expects.
 * Uses getSupabaseClient() (anon key) — same auth pattern as the rest of the app.
 */

import { getSupabaseClient } from '@/lib/supabase'

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

function urlTag(entry: SitemapEntry): string {
  const lastmod = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ''
  return `  <url>
    <loc>${entry.loc}</loc>${lastmod}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
}

export async function GET() {
  const supabase = getSupabaseClient()
  const entries: SitemapEntry[] = []

  const add = (loc: string, priority: string, changefreq: string, lastmod?: string) => {
    entries.push({ loc, priority, changefreq, lastmod })
  }

  // ── Core static pages ────────────────────────────────────────────────
  add(`${BASE}/`,                '1.0', 'daily')
  add(`${BASE}/ask`,             '0.9', 'weekly')
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

  // ── Dynamic pages (fetched from Supabase via anon key, same as all pages) ──
  try {
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, updated_at')
      .eq('status', 'approved')
      .eq('verified', true)

    if (businesses) {
      for (const biz of businesses) {
        const lm = (biz.updated_at ?? '').slice(0, 10) || undefined
        add(`${BASE}/business/${biz.id}`, '0.7', 'monthly', lm)
      }
    }
  } catch {
    // non-fatal — static pages already added above
  }

  try {
    const { data: events } = await supabase
      .from('events')
      .select('id, updated_at')
      .eq('ingestion_status', 'approved')   // only surface approved events to Google

    if (events) {
      for (const ev of events) {
        const lm = (ev.updated_at ?? '').slice(0, 10) || undefined
        add(`${BASE}/events/${ev.id}`, '0.6', 'weekly', lm)
      }
    }
  } catch {
    // non-fatal
  }

  try {
    const { data: laf } = await supabase
      .from('lost_and_found')
      .select('id, updated_at')

    if (laf) {
      for (const item of laf) {
        const lm = (item.updated_at ?? '').slice(0, 10) || undefined
        add(`${BASE}/lost-and-found/${item.id}`, '0.5', 'weekly', lm)
      }
    }
  } catch {
    // non-fatal
  }

  // ── Build XML ────────────────────────────────────────────────────────
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <!-- Dynamic sitemap | ${entries.length} URLs | Generated at ${new Date().toISOString()} -->`,
    ...entries.map(urlTag),
    '</urlset>',
  ].join('\n')

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=43200, stale-while-revalidate=3600',
    },
  })
}
