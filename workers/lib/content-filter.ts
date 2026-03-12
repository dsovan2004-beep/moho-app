// ── MoHoLocal Content Filter ──────────────────────────────────────────────────
//
// Filters out crime, violence, and police-report content from RSS ingestion.
// Applied to all news-based feeds (209times, TracyPress, Patch).
//
// Usage:
//   import { isCrimeContent, logCrimeSkip } from './content-filter'
//
//   if (isCrimeContent(title, description)) {
//     logCrimeSkip(source, title)
//     continue
//   }
// ─────────────────────────────────────────────────────────────────────────────

// ── Crime / violence keyword list ─────────────────────────────────────────────

const CRIME_KEYWORDS: string[] = [
  // Arrests & law enforcement
  'arrest', 'arrested', 'officer', 'officers', 'police', 'sheriff', 'deputy',
  'detective', 'swat', 'fbi', 'dea', 'atf', 'warrant',
  // Violence
  'shooting', 'shot', 'shots fired', 'stabbing', 'stabbed', 'stab',
  'killed', 'killing', 'murder', 'murdered', 'homicide', 'manslaughter',
  'assault', 'attacked', 'attack', 'beaten', 'beating', 'brawl',
  'violence', 'violent', 'threat', 'threatened',
  // Weapons
  'bomb', 'bombs', 'explosive', 'gun', 'guns', 'firearm', 'firearms',
  'weapon', 'weapons', 'knife attack', 'arson',
  // Crimes
  'robbery', 'robbed', 'theft', 'stolen', 'burglary', 'burglar',
  'shoplifting', 'fraud', 'scam', 'trafficking', 'smuggling',
  'drug bust', 'drug deal', 'narcotics',
  // Legal proceedings
  'charged', 'charges', 'indicted', 'convicted', 'sentenced', 'verdict',
  'trial', 'court', 'hearing', 'prosecution', 'defendant', 'felony',
  'misdemeanor', 'plea', 'pleaded',
  // Incarceration
  'jail', 'prison', 'inmate', 'detained', 'custody',
  // Investigations
  'investigation', 'investigated', 'suspect', 'suspects', 'wanted',
  'search warrant', 'evidence', 'crime scene',
  // Incidents
  'crash', 'fatal crash', 'deadly', 'death', 'deaths', 'fatality',
  'overdose', 'casualty',
  // Political scandal / controversy
  'crooked', 'scandal', 'corruption', 'misconduct', 'controversy',
  'paid leave', 'placed on leave', 'resign', 'resigned', 'fired',
  'abuse of', 'lavish spending', 'inexplicably',
  // Racism / discrimination incidents
  'racist', 'racial slur', 'hate crime', 'discrimination',
  // Outside-area cities that frequently appear in 209times national/regional coverage
  'stockton unified', 'stanislaus', 'modesto', 'lodi city',
]

// Pre-compile to lowercase once at module load for fast matching
const CRIME_KEYWORDS_LOWER = CRIME_KEYWORDS.map((k) => k.toLowerCase())

// ── Positive allowlist — skip crime filter if these appear in title ───────────
// Allows through community-positive crime-adjacent words like "crime prevention",
// "safety tips", "neighborhood watch" if they also contain strong positive signals.

const ALLOWLIST_OVERRIDES: string[] = [
  'crime prevention',
  'safety tip',
  'neighborhood watch',
  'block party',
  'community event',
  'fundraiser',
  'food drive',
]

// ── Main filter function ──────────────────────────────────────────────────────

/**
 * Returns true if the article appears to contain crime, violence, or police content.
 * Checks both title and description (if provided).
 */
export function isCrimeContent(title: string, description?: string): boolean {
  const combined = ((title ?? '') + ' ' + (description ?? '')).toLowerCase()

  // Check allowlist first — if strong positive signal, let it through
  for (const override of ALLOWLIST_OVERRIDES) {
    if (combined.includes(override)) return false
  }

  // Check crime keywords against title + description
  for (const keyword of CRIME_KEYWORDS_LOWER) {
    if (combined.includes(keyword)) return true
  }

  return false
}

/**
 * Logs a structured skip event for crime-filtered articles.
 * Written to Cloudflare Worker logs (visible in wrangler tail).
 */
export function logCrimeSkip(source: string, title: string): void {
  console.log(
    JSON.stringify({
      event:  'content_filtered',
      reason: 'crime_filter',
      source,
      title:  title.slice(0, 120),
      ts:     new Date().toISOString(),
    })
  )
}
