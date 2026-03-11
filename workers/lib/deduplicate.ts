// ── Deduplication layer ───────────────────────────────────────────────────────
// Checks each normalised record against the live Supabase database before
// writing. Returns the existing row if a duplicate is found, or null if new.
//
// Duplicate rules per domain:
//
//  Directory  → name + city  OR  phone (if present)  OR  address (if present)
//  Events     → title + city + start_date (first 10 chars — date part only)
//  Lost&Found → pet_name + city  OR  title + city

import { selectRows } from './supabase'
import type { Env, SupabaseRow } from './types'

// ── Levenshtein distance (lightweight string similarity) ──────────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

// Returns true if two strings are similar enough to be considered the same
function isSimilar(a: string, b: string, threshold = 0.15): boolean {
  const sa = a.trim().toLowerCase()
  const sb = b.trim().toLowerCase()
  if (sa === sb) return true
  const maxLen = Math.max(sa.length, sb.length)
  if (maxLen === 0) return true
  return levenshtein(sa, sb) / maxLen <= threshold
}

// ── Directory deduplication ───────────────────────────────────────────────────
export async function findExistingBusiness(
  env: Env,
  name: string,
  city: string,
  phone?: string,
): Promise<SupabaseRow | null> {
  // Check by name + city
  const byName = await selectRows<SupabaseRow>(env, 'businesses', { city })
  const nameMatch = byName.find((row) =>
    isSimilar(String(row.name ?? ''), name),
  )
  if (nameMatch) return nameMatch

  // Check by phone (if provided)
  if (phone) {
    const digits = phone.replace(/\D/g, '')
    const byPhone = await selectRows<SupabaseRow>(env, 'businesses', { city })
    const phoneMatch = byPhone.find((row) => {
      const rowDigits = String(row.phone ?? '').replace(/\D/g, '')
      return rowDigits.length >= 10 && rowDigits === digits
    })
    if (phoneMatch) return phoneMatch
  }

  return null
}

// ── Events deduplication ──────────────────────────────────────────────────────
export async function findExistingEvent(
  env: Env,
  title: string,
  city: string,
  startDate: string,
): Promise<SupabaseRow | null> {
  // Match on title + city + date (date portion only, ignores time)
  const datePrefix = startDate.slice(0, 10)
  const rows = await selectRows<SupabaseRow>(env, 'events', { city })

  return (
    rows.find((row) => {
      const rowDate = String(row.start_date ?? '').slice(0, 10)
      return rowDate === datePrefix && isSimilar(String(row.title ?? ''), title)
    }) ?? null
  )
}

// ── Lost & Found deduplication ────────────────────────────────────────────────
export async function findExistingLostFound(
  env: Env,
  city: string,
  petName?: string,
  title?: string,
): Promise<SupabaseRow | null> {
  const rows = await selectRows<SupabaseRow>(env, 'lost_and_found', { city })

  if (petName) {
    const nameMatch = rows.find((row) =>
      isSimilar(String(row.pet_name ?? ''), petName),
    )
    if (nameMatch) return nameMatch
  }

  if (title) {
    const titleMatch = rows.find((row) =>
      isSimilar(String(row.title ?? ''), title),
    )
    if (titleMatch) return titleMatch
  }

  return null
}
