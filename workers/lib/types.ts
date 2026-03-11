// ── Shared types for the MoHoLocal ingestion worker system ───────────────────

// ── Env bindings (Cloudflare Worker env) ─────────────────────────────────────
export interface Env {
  // Required — worker will not run without these
  SUPABASE_URL:              string   // var — set in wrangler.toml
  SUPABASE_SERVICE_ROLE_KEY: string   // secret — wrangler secret put
  APP_ENV:                   string   // var — "production" | "preview" | "dev"

  // Default source config — optional, no credentials required
  /**
   * Founder-controlled HTTPS URL returning a JSON array of RawBusiness objects.
   * Can be a GitHub raw URL, Cloudflare R2 public URL, or any HTTPS JSON endpoint.
   * When absent the ManualFeedAdapter is silently skipped.
   */
  MANUAL_BUSINESS_FEED_URL?: string

  // Optional third-party API adapters
  // These are NOT required. The worker runs safely without them.
  // Each adapter checks for its own key and skips gracefully if absent.
  // Add later via: npx wrangler secret put <KEY>
  YELP_API_KEY?:             string   // Yelp Fusion API  — business directory
  EVENTBRITE_API_KEY?:       string   // Eventbrite API   — events
  PETFINDER_CLIENT_ID?:      string   // PetFinder OAuth2 — lost & found
  PETFINDER_CLIENT_SECRET?:  string   // PetFinder OAuth2 — lost & found
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
  warnings:        string[]
  run_at:          string  // ISO-8601
  duration_ms:     number
  /** Per-adapter breakdown — keyed by adapter name */
  per_source:      Record<string, PerSourceStats>
}

export interface PerSourceStats {
  raw_items:   number   // items the adapter returned
  inserted:    number
  updated:     number
  skipped:     number
  flagged:     number
}

// ── Supabase REST helpers ─────────────────────────────────────────────────────
export interface SupabaseRow {
  id?: string
  [key: string]: unknown
}
