// ── Normalization layer ───────────────────────────────────────────────────────
// All incoming records must pass through normalisation before they can be
// written to Supabase. This prevents dirty / inconsistent data from ever
// reaching the database.

import {
  SUPPORTED_CITIES,
  CANONICAL_CATEGORIES,
  type SupportedCity,
  type CanonicalCategory,
} from './types'

// ── City normalisation ────────────────────────────────────────────────────────
// Maps raw strings (e.g. "mountain house ca", "Tracy, CA") to exact canonical
// names. Returns null if the city is not in our supported list — those records
// should be discarded.

const CITY_ALIASES: Record<string, SupportedCity> = {
  // Mountain House variants
  'mountain house':           'Mountain House',
  'mountain house ca':        'Mountain House',
  'mountain house, ca':       'Mountain House',
  'mountain house california': 'Mountain House',
  'mtn house':                'Mountain House',
  // Tracy
  'tracy':                    'Tracy',
  'tracy ca':                 'Tracy',
  'tracy, ca':                'Tracy',
  'city of tracy':            'Tracy',
  // Lathrop
  'lathrop':                  'Lathrop',
  'lathrop ca':               'Lathrop',
  'lathrop, ca':              'Lathrop',
  'city of lathrop':          'Lathrop',
  // Manteca
  'manteca':                  'Manteca',
  'manteca ca':               'Manteca',
  'manteca, ca':              'Manteca',
  'city of manteca':          'Manteca',
  // Brentwood
  'brentwood':                'Brentwood',
  'brentwood ca':             'Brentwood',
  'brentwood, ca':            'Brentwood',
  'east brentwood':           'Brentwood',
}

export function normalizeCity(raw: string | undefined | null): SupportedCity | null {
  if (!raw) return null
  const key = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  if (CITY_ALIASES[key]) return CITY_ALIASES[key]
  // Exact canonical match (case-insensitive)
  const exact = SUPPORTED_CITIES.find(
    (c) => c.toLowerCase() === key,
  )
  return exact ?? null
}

// ── Category normalisation ────────────────────────────────────────────────────
// Maps raw categories from external APIs to one of the 9 canonical categories.
// Falls back to 'Retail' as a safe catch-all rather than dropping the record.

const CATEGORY_ALIASES: Record<string, CanonicalCategory> = {
  // Restaurants
  restaurant: 'Restaurants', restaurants: 'Restaurants', food: 'Restaurants',
  dining: 'Restaurants', cafe: 'Restaurants', coffee: 'Restaurants',
  bakery: 'Restaurants', pizza: 'Restaurants', 'fast food': 'Restaurants',
  bar: 'Restaurants', 'food & drink': 'Restaurants',
  // Health & Wellness
  health: 'Health & Wellness', medical: 'Health & Wellness',
  dental: 'Health & Wellness', doctor: 'Health & Wellness',
  dentist: 'Health & Wellness', pharmacy: 'Health & Wellness',
  gym: 'Health & Wellness', fitness: 'Health & Wellness',
  yoga: 'Health & Wellness', chiropractor: 'Health & Wellness',
  'health & wellness': 'Health & Wellness', 'health and wellness': 'Health & Wellness',
  optometrist: 'Health & Wellness', veterinarian: 'Pet Services',
  // Beauty & Spa
  beauty: 'Beauty & Spa', spa: 'Beauty & Spa', salon: 'Beauty & Spa',
  'hair salon': 'Beauty & Spa', 'nail salon': 'Beauty & Spa',
  barbershop: 'Beauty & Spa', 'beauty & spa': 'Beauty & Spa',
  // Retail
  retail: 'Retail', shop: 'Retail', store: 'Retail', shopping: 'Retail',
  grocery: 'Retail', market: 'Retail', hardware: 'Retail',
  clothing: 'Retail', apparel: 'Retail', bookstore: 'Retail',
  // Education
  education: 'Education', school: 'Education', tutor: 'Education',
  tutoring: 'Education', childcare: 'Education', preschool: 'Education',
  daycare: 'Education', 'after school': 'Education', learning: 'Education',
  // Automotive
  automotive: 'Automotive', auto: 'Automotive', car: 'Automotive',
  mechanic: 'Automotive', 'auto repair': 'Automotive', 'car wash': 'Automotive',
  dealership: 'Automotive', tires: 'Automotive',
  // Real Estate
  'real estate': 'Real Estate', realtor: 'Real Estate', realty: 'Real Estate',
  'property management': 'Real Estate', mortgage: 'Real Estate',
  // Home Services
  'home services': 'Home Services', plumber: 'Home Services',
  plumbing: 'Home Services', electrician: 'Home Services',
  electrical: 'Home Services', roofing: 'Home Services',
  landscaping: 'Home Services', cleaning: 'Home Services',
  'house cleaning': 'Home Services', contractor: 'Home Services',
  hvac: 'Home Services', 'home improvement': 'Home Services',
  // Pet Services
  'pet services': 'Pet Services', 'pet care': 'Pet Services',
  grooming: 'Pet Services', 'dog grooming': 'Pet Services',
  'pet store': 'Pet Services', 'animal hospital': 'Pet Services',
  vet: 'Pet Services', 'dog training': 'Pet Services',
}

export function normalizeCategory(raw: string | undefined | null): CanonicalCategory {
  if (!raw) return 'Retail'
  const key = raw.trim().toLowerCase()
  return CATEGORY_ALIASES[key] ?? 'Retail'
}

// ── Phone normalisation ───────────────────────────────────────────────────────
// Strips everything except digits, then re-formats as (XXX) XXX-XXXX.
export function normalizePhone(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits[0] === '1') {
    const d = digits.slice(1)
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return raw.trim() // return as-is if unusual format
}

// ── String normalisation ──────────────────────────────────────────────────────
export function normalizeString(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined
  return raw.trim().replace(/\s+/g, ' ').replace(/[\u200B-\u200D\uFEFF]/g, '')
}

// ── URL normalisation ─────────────────────────────────────────────────────────
export function normalizeUrl(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined
  const s = raw.trim()
  if (!s) return undefined
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  return `https://${s}`
}

// ── Address normalisation ─────────────────────────────────────────────────────
// Light pass: trim + collapse whitespace. Does NOT geocode.
export function normalizeAddress(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined
  return raw.trim().replace(/\s+/g, ' ')
}

// ── Confidence scoring ────────────────────────────────────────────────────────
// Simple heuristic: more fields filled = higher confidence.
export function scoreConfidence(fields: Record<string, unknown>): number {
  const weights: Record<string, number> = {
    name:        0.20,
    city:        0.15,
    category:    0.10,
    address:     0.15,
    phone:       0.10,
    website:     0.10,
    description: 0.10,
    image_url:   0.10,
  }
  let score = 0
  for (const [key, weight] of Object.entries(weights)) {
    if (fields[key]) score += weight
  }
  return Math.min(1.0, score)
}

// ── Review flag ───────────────────────────────────────────────────────────────
// Records with confidence below this threshold go to review queue.
export const REVIEW_THRESHOLD = 0.40

export function needsReview(confidence: number): boolean {
  return confidence < REVIEW_THRESHOLD
}
