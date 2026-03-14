// ── Ask MoHo — Query Parser + Retrieval Engine ───────────────────────────────
//
// Three-stage pipeline:
//   1. parseQuery()   — extract city, intent, category, time range from raw text
//   2. fetchAskResults() — parallel Supabase queries across businesses/events/posts
//   3. Results returned as typed arrays → rendered by app/ask/page.tsx
//
// No external LLM required. Intent routing is deterministic keyword matching.
// Designed so that swapping in an LLM-powered parser in v2 is a one-function change.

import { getSupabaseClient } from './supabase'

// ── City detection ────────────────────────────────────────────────────────────

const CITY_KEYWORDS: Array<{ kw: string; city: string }> = [
  { kw: 'mountain house', city: 'Mountain House' },
  { kw: 'mountain-house', city: 'Mountain House' },
  { kw: 'mtn house',      city: 'Mountain House' },
  { kw: 'tracy',          city: 'Tracy' },
  { kw: 'lathrop',        city: 'Lathrop' },
  { kw: 'manteca',        city: 'Manteca' },
  { kw: 'brentwood',      city: 'Brentwood' },
]

// ── Business category detection ───────────────────────────────────────────────

const CATEGORY_KEYWORDS: Array<{ kw: string; category: string }> = [
  // Restaurants
  { kw: 'restaurant',   category: 'Restaurants' },
  { kw: 'restaurants',  category: 'Restaurants' },
  { kw: 'food',         category: 'Restaurants' },
  { kw: 'eat',          category: 'Restaurants' },
  { kw: 'dining',       category: 'Restaurants' },
  { kw: 'cafe',         category: 'Restaurants' },
  { kw: 'coffee',       category: 'Restaurants' },
  { kw: 'pizza',        category: 'Restaurants' },
  { kw: 'burger',       category: 'Restaurants' },
  { kw: 'halal',        category: 'Restaurants' },
  { kw: 'sushi',        category: 'Restaurants' },
  { kw: 'taco',         category: 'Restaurants' },
  { kw: 'tacos',        category: 'Restaurants' },
  { kw: 'brunch',       category: 'Restaurants' },
  // Health & Wellness
  { kw: 'doctor',       category: 'Health & Wellness' },
  { kw: 'dentist',      category: 'Health & Wellness' },
  { kw: 'dental',       category: 'Health & Wellness' },
  { kw: 'gym',          category: 'Health & Wellness' },
  { kw: 'fitness',      category: 'Health & Wellness' },
  { kw: 'medical',      category: 'Health & Wellness' },
  { kw: 'health',       category: 'Health & Wellness' },
  { kw: 'urgent care',  category: 'Health & Wellness' },
  { kw: 'pharmacy',     category: 'Health & Wellness' },
  { kw: 'yoga',         category: 'Health & Wellness' },
  { kw: 'chiropractor', category: 'Health & Wellness' },
  // Beauty & Spa
  { kw: 'salon',        category: 'Beauty & Spa' },
  { kw: 'spa',          category: 'Beauty & Spa' },
  { kw: 'hair',         category: 'Beauty & Spa' },
  { kw: 'nails',        category: 'Beauty & Spa' },
  { kw: 'barbershop',   category: 'Beauty & Spa' },
  { kw: 'beauty',       category: 'Beauty & Spa' },
  // Automotive
  { kw: 'mechanic',     category: 'Automotive' },
  { kw: 'auto repair',  category: 'Automotive' },
  { kw: 'car wash',     category: 'Automotive' },
  { kw: 'tire',         category: 'Automotive' },
  { kw: 'oil change',   category: 'Automotive' },
  // Education
  { kw: 'school',       category: 'Education' },
  { kw: 'tutor',        category: 'Education' },
  { kw: 'tutoring',     category: 'Education' },
  { kw: 'daycare',      category: 'Education' },
  { kw: 'childcare',    category: 'Education' },
  { kw: 'preschool',    category: 'Education' },
  // Home Services
  { kw: 'plumber',      category: 'Home Services' },
  { kw: 'electrician',  category: 'Home Services' },
  { kw: 'contractor',   category: 'Home Services' },
  { kw: 'roofing',      category: 'Home Services' },
  { kw: 'cleaning',     category: 'Home Services' },
  { kw: 'hvac',         category: 'Home Services' },
  { kw: 'landscaping',  category: 'Home Services' },
  { kw: 'handyman',     category: 'Home Services' },
  // Real Estate
  { kw: 'realtor',      category: 'Real Estate' },
  { kw: 'real estate',  category: 'Real Estate' },
  { kw: 'mortgage',     category: 'Real Estate' },
  // Pet Services
  { kw: 'vet',          category: 'Pet Services' },
  { kw: 'veterinarian', category: 'Pet Services' },
  { kw: 'dog grooming', category: 'Pet Services' },
  { kw: 'pet store',    category: 'Pet Services' },
  // Retail
  { kw: 'shop',         category: 'Retail' },
  { kw: 'store',        category: 'Retail' },
  { kw: 'grocery',      category: 'Retail' },
  { kw: 'supermarket',  category: 'Retail' },
]

// ── Event intent signals ──────────────────────────────────────────────────────

const EVENT_SIGNALS = [
  'happening', 'events', 'event', "what's on", 'whats on', 'activities',
  'things to do', 'this weekend', 'tonight', 'this week', 'next week',
  'farmers market', 'festival', 'concert', 'show', 'class', 'workshop',
  'storytime', 'community event', 'fair', 'going on',
]

// ── Community intent signals ──────────────────────────────────────────────────

const COMMUNITY_SIGNALS = [
  'asking', 'residents', 'neighbors', 'neighbours', 'community', 'posts',
  'talking about', 'recommendations', 'for sale', 'jobs', 'questions',
  'what are people', 'local talk', 'neighborhood', 'neighbourhood',
]

// ── Time range detection ──────────────────────────────────────────────────────

function getTimeRange(lower: string): { start: string; end: string } {
  const now = new Date()
  const DAY = 86_400_000

  if (lower.includes('today') || lower.includes('tonight')) {
    const start = new Date(now); start.setHours(0, 0, 0, 0)
    const end   = new Date(now); end.setHours(23, 59, 59, 999)
    return { start: start.toISOString(), end: end.toISOString() }
  }

  if (lower.includes('this weekend') || lower.includes('weekend')) {
    const daysToSat = (6 - now.getDay() + 7) % 7 || 7
    const sat = new Date(now.getTime() + daysToSat * DAY); sat.setHours(0, 0, 0, 0)
    const sun = new Date(sat.getTime() + DAY);              sun.setHours(23, 59, 59, 999)
    return { start: sat.toISOString(), end: sun.toISOString() }
  }

  if (lower.includes('next week')) {
    const start = new Date(now.getTime() + 7  * DAY); start.setHours(0, 0, 0, 0)
    const end   = new Date(now.getTime() + 14 * DAY); end.setHours(23, 59, 59, 999)
    return { start: start.toISOString(), end: end.toISOString() }
  }

  if (lower.includes('this week')) {
    const start = new Date(now); start.setHours(0, 0, 0, 0)
    const end   = new Date(now.getTime() + 7 * DAY); end.setHours(23, 59, 59, 999)
    return { start: start.toISOString(), end: end.toISOString() }
  }

  // Default: next 30 days of upcoming events
  const start = new Date(now); start.setHours(0, 0, 0, 0)
  const end   = new Date(now.getTime() + 30 * DAY)
  return { start: start.toISOString(), end: end.toISOString() }
}

// ── Parsed query type ─────────────────────────────────────────────────────────

export interface ParsedQuery {
  original:   string
  city:       string | null
  intent:     'events' | 'businesses' | 'community' | 'mixed'
  category:   string | null      // canonical business category
  timeRange:  { start: string; end: string }
  timeLabel:  string             // human-readable: "this weekend", "today", "next 30 days"
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function parseQuery(raw: string): ParsedQuery {
  const lower = raw.trim().toLowerCase()

  // City
  let city: string | null = null
  for (const { kw, city: c } of CITY_KEYWORDS) {
    if (lower.includes(kw)) { city = c; break }
  }

  // Category
  let category: string | null = null
  for (const { kw, category: cat } of CATEGORY_KEYWORDS) {
    if (lower.includes(kw)) { category = cat; break }
  }

  // Intent signals
  const hasEvent     = EVENT_SIGNALS.some(s => lower.includes(s))
  const hasCommunity = COMMUNITY_SIGNALS.some(s => lower.includes(s))
  const hasBusiness  = category !== null
    || lower.includes('best')
    || lower.includes('find')
    || lower.includes('recommend')
    || lower.includes('good')
    || lower.includes('near')
    || lower.includes('places')

  let intent: ParsedQuery['intent'] = 'mixed'
  if (hasEvent && !hasCommunity && !hasBusiness)      intent = 'events'
  else if (hasCommunity && !hasEvent && !hasBusiness) intent = 'community'
  else if (hasBusiness && !hasEvent && !hasCommunity) intent = 'businesses'

  // Time
  const timeRange = getTimeRange(lower)
  let timeLabel = 'upcoming'
  if (lower.includes('today') || lower.includes('tonight')) timeLabel = 'today'
  else if (lower.includes('this weekend') || lower.includes('weekend')) timeLabel = 'this weekend'
  else if (lower.includes('next week')) timeLabel = 'next week'
  else if (lower.includes('this week')) timeLabel = 'this week'

  return { original: raw.trim(), city, intent, category, timeRange, timeLabel }
}

// ── Result types ──────────────────────────────────────────────────────────────

export interface AskBusiness {
  id: string; name: string; city: string; category: string
  rating: number | null; review_count: number | null
  address: string | null; phone: string | null; description: string | null
}

export interface AskEvent {
  id: string; title: string; city: string; location: string | null
  start_date: string; category: string | null; source_url: string | null; image_url: string | null
}

export interface AskPost {
  id: string; title: string; city: string; category: string
  author_name: string; created_at: string; content: string | null
}

export interface AskResult {
  businesses: AskBusiness[]
  events:     AskEvent[]
  posts:      AskPost[]
  parsed:     ParsedQuery
}

// ── Retrieval ─────────────────────────────────────────────────────────────────

export async function fetchAskResults(parsed: ParsedQuery): Promise<AskResult> {
  const supabase = getSupabaseClient()
  const { city, intent, category, timeRange } = parsed

  const wantEvents    = intent === 'events'    || intent === 'mixed'
  const wantBiz       = intent === 'businesses' || intent === 'mixed'
  const wantCommunity = intent === 'community'  || intent === 'mixed'

  const [evRes, bizRes, postRes] = await Promise.allSettled([

    // ── Events ────────────────────────────────────────────────────────────────
    wantEvents
      ? (() => {
          let q = supabase
            .from('events')
            .select('id, title, city, location, start_date, category, source_url, image_url')
            .eq('ingestion_status', 'approved')
            .gte('start_date', timeRange.start)
            .lte('start_date', timeRange.end)
            .order('start_date', { ascending: true })
            .limit(5)
          if (city) q = q.eq('city', city)
          return q
        })()
      : Promise.resolve({ data: [] as AskEvent[], error: null }),

    // ── Businesses ────────────────────────────────────────────────────────────
    wantBiz
      ? (() => {
          let q = supabase
            .from('businesses')
            .select('id, name, city, category, rating, review_count, address, phone, description')
            .eq('status', 'approved')
            .eq('verified', true)
            .order('rating', { ascending: false, nullsFirst: false })
            .limit(5)
          if (city)     q = q.eq('city', city)
          if (category) q = q.eq('category', category)
          return q
        })()
      : Promise.resolve({ data: [] as AskBusiness[], error: null }),

    // ── Community posts ───────────────────────────────────────────────────────
    wantCommunity
      ? (() => {
          let q = supabase
            .from('community_posts')
            .select('id, title, city, category, author_name, created_at, content')
            .neq('status', 'flagged')
            .neq('status', 'removed')
            .order('created_at', { ascending: false })
            .limit(5)
          if (city) q = q.eq('city', city)
          return q
        })()
      : Promise.resolve({ data: [] as AskPost[], error: null }),
  ])

  return {
    events:     evRes.status === 'fulfilled'   ? ((evRes.value.data   ?? []) as AskEvent[])    : [],
    businesses: bizRes.status === 'fulfilled'  ? ((bizRes.value.data  ?? []) as AskBusiness[]) : [],
    posts:      postRes.status === 'fulfilled' ? ((postRes.value.data ?? []) as AskPost[])      : [],
    parsed,
  }
}

// ── Context label helpers (used in UI) ───────────────────────────────────────

export function eventHeading(parsed: ParsedQuery): string {
  const city = parsed.city ?? 'the 209'
  const time = parsed.timeLabel
  return `📅 Events in ${city} — ${time}`
}

export function bizHeading(parsed: ParsedQuery): string {
  const city = parsed.city ?? 'the 209'
  const cat  = parsed.category ? parsed.category.toLowerCase() : 'local businesses'
  return `🏢 Top-rated ${cat} in ${city}`
}

export function communityHeading(parsed: ParsedQuery): string {
  const city = parsed.city ?? 'the 209'
  return `💬 What ${city} residents are saying`
}
