/**
 * MoHoLocal — canonical city configuration.
 * Single source of truth for all pages. Import from here; never hardcode city lists.
 */

export type CityRegion = '209' | 'south-bay'

export interface CityConfig {
  slug:       string
  name:       string
  emoji:      string
  region:     CityRegion
  county:     string        // e.g. "San Joaquin County"
  gradient:   string        // CSS gradient for hero / card backgrounds
  chip:       string        // Tailwind classes for category / city badge
  population: string        // approximate pop string, e.g. "~103k"
  tagline:    string        // one-line city description
  dotColor:   string        // hex — used in nav dot, footer chips, etc.
}

export const CITIES: CityConfig[] = [
  // ── 209 / San Joaquin County ─────────────────────────────────────────────────
  {
    slug:       'mountain-house',
    name:       'Mountain House',
    region:     '209',
    county:     'San Joaquin County',
    emoji:      '🏘️',
    gradient:   'linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)',
    chip:       'bg-blue-50 text-blue-700',
    population: '~31k',
    tagline:    "California's newest master-planned community",
    dotColor:   '#2563eb',
  },
  {
    slug:       'tracy',
    name:       'Tracy',
    region:     '209',
    county:     'San Joaquin County',
    emoji:      '🌿',
    gradient:   'linear-gradient(135deg,#14532d 0%,#16a34a 100%)',
    chip:       'bg-green-50 text-green-700',
    population: '~103k',
    tagline:    'A thriving Central Valley hub',
    dotColor:   '#16a34a',
  },
  {
    slug:       'lathrop',
    name:       'Lathrop',
    region:     '209',
    county:     'San Joaquin County',
    emoji:      '🔮',
    gradient:   'linear-gradient(135deg,#581c87 0%,#9333ea 100%)',
    chip:       'bg-purple-50 text-purple-700',
    population: '~28k',
    tagline:    "One of California's fastest-growing cities",
    dotColor:   '#9333ea',
  },
  {
    slug:       'manteca',
    name:       'Manteca',
    region:     '209',
    county:     'San Joaquin County',
    emoji:      '🍊',
    gradient:   'linear-gradient(135deg,#7c2d12 0%,#ea580c 100%)',
    chip:       'bg-orange-50 text-orange-700',
    population: '~90k',
    tagline:    'Small-town charm with big-city convenience',
    dotColor:   '#ea580c',
  },
  {
    slug:       'brentwood',
    name:       'Brentwood',
    region:     '209',
    county:     'Contra Costa County',
    emoji:      '🌾',
    gradient:   'linear-gradient(135deg,#134e4a 0%,#0d9488 100%)',
    chip:       'bg-teal-50 text-teal-700',
    population: '~65k',
    tagline:    'East Bay gem with small-town spirit',
    dotColor:   '#0d9488',
  },
  // ── South Bay / Santa Clara County (FIFA World Cup 2026 expansion) ────────────
  {
    slug:       'san-jose',
    name:       'San Jose',
    region:     'south-bay',
    county:     'Santa Clara County',
    emoji:      '🏙️',
    gradient:   'linear-gradient(135deg,#1e3a5f 0%,#0369a1 100%)',
    chip:       'bg-sky-50 text-sky-700',
    population: '~1M',
    tagline:    "Silicon Valley's culinary and cultural hub",
    dotColor:   '#0369a1',
  },
  {
    slug:       'santa-clara',
    name:       'Santa Clara',
    region:     'south-bay',
    county:     'Santa Clara County',
    emoji:      '🏟️',
    gradient:   'linear-gradient(135deg,#7e1d1d 0%,#b91c1c 100%)',
    chip:       'bg-red-50 text-red-700',
    population: '~130k',
    tagline:    "Home to Levi's Stadium — FIFA World Cup 2026 venue",
    dotColor:   '#b91c1c',
  },
  {
    slug:       'sunnyvale',
    name:       'Sunnyvale',
    region:     'south-bay',
    county:     'Santa Clara County',
    emoji:      '☀️',
    gradient:   'linear-gradient(135deg,#78350f 0%,#d97706 100%)',
    chip:       'bg-amber-50 text-amber-700',
    population: '~155k',
    tagline:    "One of the Bay Area's most livable cities",
    dotColor:   '#d97706',
  },
]

// ── Convenience lookups (O(1) access by slug or name) ─────────────────────────

export const CITY_BY_SLUG: Record<string, CityConfig> =
  Object.fromEntries(CITIES.map(c => [c.slug, c]))

export const CITY_BY_NAME: Record<string, CityConfig> =
  Object.fromEntries(CITIES.map(c => [c.name, c]))

export const CITY_NAMES: string[] = CITIES.map(c => c.name)
export const CITY_SLUGS_LIST: string[] = CITIES.map(c => c.slug)

export const CITIES_209        = CITIES.filter(c => c.region === '209')
export const CITIES_SOUTH_BAY  = CITIES.filter(c => c.region === 'south-bay')
