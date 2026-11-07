import type { ListingCheck } from './listing-evidence'
import { safeReturnTo } from './auth-return'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ─── Browser singleton ────────────────────────────────────────────────────────
// One GoTrueClient per browser context — avoids "Multiple GoTrueClient
// instances detected" warning. The variable lives at module scope but is
// never initialised at build time (typeof window guard) so edge runtime is safe.

let _browserClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  // Server / edge build-time: always create a fresh instance (no window)
  if (typeof window === 'undefined') {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { flowType: 'pkce', persistSession: false, autoRefreshToken: false } },
    )
  }
  // Browser: reuse singleton
  if (!_browserClient) {
    _browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { flowType: 'pkce', detectSessionInUrl: false } },
    )
  }
  return _browserClient
}

// Preserve the existing allowlisted callback URL; store only the safe return
// path locally rather than requiring new query-specific Auth redirect entries.
function authCallbackUrl() {
  const next = safeReturnTo(new URLSearchParams(window.location.search).get('next'))
  window.sessionStorage.setItem('moho-auth-return', next)
  return `${window.location.origin}/auth/callback`
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authCallbackUrl(),
    },
  })
  return { error }
}

export async function signInWithFacebook() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: authCallbackUrl(),
    },
  })
  return { error }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      ...(fullName ? { data: { full_name: fullName } } : {}),
      emailRedirectTo: authCallbackUrl(),
    },
  })
  return { data, error }
}

export async function signOut() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  const supabase = getSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Explicit projection: email/contact_email are private follow-up details.
export const PUBLIC_BUSINESS_COLUMNS = 'id,name,category,city,address,phone,website,description,hours,rating,review_count,claimed,verified,featured,status,created_at,updated_at,source,source_url,last_ingested_at,confidence_score,needs_review,image_source,google_place_id,verification_source,verified_at'

// ─── Trust Gate Helper ───────────────────────────────────────────────────────
// ALWAYS use this for any public-facing businesses query.
// Enforces the dual trust rule: status = 'approved' AND verified = true.
// Prevents future developers from accidentally exposing unverified listings.
//
// Usage:
//   const { data } = await trustedListings(supabase)
//     .eq('city', 'Tracy')
//     .order('rating', { ascending: false })
//     .limit(6)
//
// For specific columns:
//   const { data } = await trustedListings(supabase, 'id, name, city, rating')
//     .eq('category', 'Restaurants')
//
// ⚠️ Admin and audit routes intentionally bypass this helper —
//    they must remain auth-gated and scope their queries explicitly.
export function trustedListings(supabase: SupabaseClient, columns = PUBLIC_BUSINESS_COLUMNS) {
  return supabase
    .from('businesses')
    .select(columns)
    .eq('status', 'approved')
    .eq('verified', true)
}

// ─── Table Types ─────────────────────────────────────────────────────────────

export interface Business {
  listing_checks?: ListingCheck | ListingCheck[] | null
  id: string
  name: string
  category: string
  city: string
  description: string
  address: string
  phone?: string
  website?: string
  rating?: number
  review_count?: number
  image_url?: string
  status?: 'pending' | 'approved' | 'rejected'
  slug?: string
  verified?: boolean
  featured?: boolean
  contact_email?: string
  hours?: string
  claimed?: boolean
  created_at: string
  // Populated when queried with .select('*, business_images(image_url, position, verified, source)')
  business_images?: Array<{
    image_url: string
    position: number
    verified?: boolean
    source?: string
  }>
}

export interface BusinessImage {
  id: string
  business_id: string
  image_url: string
  alt_text?: string
  position: number
  source?: 'google_places' | 'owner_upload' | 'admin_verified' | 'unknown'
  source_reference?: string
  verified?: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  city: string
  location: string
  start_date: string
  end_date?: string
  category?: string
  source_url?: string
  confidence?: string
  status?: string
  image_url?: string
  created_at: string
}

export interface CommunityPost {
  id: string
  user_id?: string
  title: string
  content: string
  city: string
  category: string
  author_name: string
  created_at: string
  reply_count?: number
  likes?: number
  image_url?: string
}

export const PUBLIC_PET_COLUMNS = 'id,type,pet_name,pet_type,description,city,location_last_seen,contact_name,contact_phone,status,image_url,created_at,breed,age,gender,last_seen,location_detail,coat_description,reward,title,source,source_url,last_ingested_at,confidence_score,needs_review,image_source,ingestion_status,status_revision,status_confirmed_at,expires_at,progress,progress_observed_at,contact_stage,contact_updated_at'

export interface LostAndFound {
  contact_stage?: 'unknown' | 'attempted' | 'contacted' | 'return_arranged'
  contact_updated_at?: string | null
  progress?: 'unknown' | 'sighted' | 'secured'
  progress_observed_at?: string | null
  status_revision: number
  status_confirmed_at?: string | null
  id: string
  title: string
  description: string
  city: string
  source_url?: string
  status: 'lost' | 'found' | 'reunited'
  type: string
  pet_type?: string
  pet_name?: string
  breed?: string
  age?: string
  gender?: string
  last_seen?: string
  location_detail?: string
  coat_description?: string
  reward?: string
  contact_name: string
  contact_phone?: string
  image_url?: string
  created_at: string
}
