// ── Shared types for the MoHoLocal ingestion worker system ───────────────────

// ── Env bindings (Cloudflare Worker env) ─────────────────────────────────────
export interface Env {
  SUPABASE_URL:             string   // var — set in wrangler.toml
  SUPABASE_SERVICE_ROLE_KEY: string  // secret — wrangler secret put
  YELP_API_KEY?:            string   // secret — optional
  EVENTBRITE_API_KEY?:      string   // secret — optional
  PETFINDER_CLIENT_ID?:     string   // secret — optional
  PETFINDER_CLIENT_SECRET?: string   // secret — optional
  APP_ENV?:                 string   // var — "production" | "staging"
}

// ── Canonical city / category lists ──────────────────────────────────────────
export const SUPPORTED_CITIES = [
  'Mountain House',
  'Tracy',
  'Lathrop',
  'Manteca',
  'Brentwood',
] as const
export type SupportedCity = (typeof SUPPORTED_CITIES)[number]

export const CANONICAL_CATEGORIES = [
  'Restaurants',
  'Health & Wellness',
  'Beauty & Spa',
  'Retail',
  'Education',
  'Automotive',
  'Real Estate',
  'Home Services',
  'Pet Services',
] as const
export type CanonicalCategory = (typeof CANONICAL_CATEGORIES)[number]

// Zip codes per city — used for geo API lookups
export const CITY_ZIPS: Record<SupportedCity, string[]> = {
  'Mountain House': ['95391'],
  'Tracy':          ['95304', '95376', '95377', '95378'],
  'Lathrop':        ['95330'],
  'Manteca':        ['95336', '95337'],
  'Brentwood':      ['94513'],
}

// ── Normalised domain records ─────────────────────────────────────────────────

export interface NormalizedBusiness {
  name:              string
  description?:      string
  category:          CanonicalCategory
  city:              SupportedCity
  address?:          string
  phone?:            string
  website?:          string
  image_url?:        string
  image_source?:     string
  status:            'pending'        // all ingested records start as pending
  source:            string
  source_url?:       string
  last_ingested_at:  string           // ISO-8601
  confidence_score:  number           // 0.0–1.0
  needs_review:      boolean
  ingestion_status:  'inserted' | 'updated' | 'skipped' | 'flagged'
}

export interface NormalizedEvent {
  title:             string
  description?:      string
  city:              SupportedCity
  location?:         string
  start_date:        string           // ISO-8601
  end_date?:         string
  category?:         string
  url?:              string
  image_url?:        string
  image_source?:     string
  source:            string
  source_url?:       string
  last_ingested_at:  string
  confidence_score:  number
  needs_review:      boolean
  ingestion_status:  'inserted' | 'updated' | 'skipped' | 'flagged'
}

export interface NormalizedLostFound {
  title:             string
  description?:      string
  city:              SupportedCity
  status:            'lost' | 'found'
  type:              string           // required NOT NULL per schema
  pet_name?:         string
  contact_name:      string
  contact_phone?:    string
  image_url?:        string
  image_source?:     string
  source:            string
  source_url?:       string
  last_ingested_at:  string
  confidence_score:  number
  needs_review:      boolean
  ingestion_status:  'inserted' | 'updated' | 'skipped' | 'flagged'
}

// ── Ingestion run log ─────────────────────────────────────────────────────────
export interface RunLog {
  domain:          'directory' | 'events' | 'lost_and_found'
  city?:           string
  source:          string
  discovered:      number
  inserted:        number
  updated:         number
  skipped:         number
  flagged:         number
  images_captured: number
  images_missing:  number
  errors:          string[]
  run_at:          string  // ISO-8601
  duration_ms:     number
}

// ── Supabase REST helpers ─────────────────────────────────────────────────────
export interface SupabaseRow {
  id?: string
  [key: string]: unknown
}
