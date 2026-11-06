import { CITY_BY_NAME, RELAUNCH_CITY_NAMES } from './cities'
import { SERVICE_CHOICES } from './services'
import type { Business } from './supabase'
import type { ListingCheck } from './listing-evidence'

export function latestCheck(incoming: Business['listing_checks']): ListingCheck | null {
  const checks = Array.isArray(incoming) ? incoming : incoming ? [incoming] : []
  return [...checks].sort((a, b) => Date.parse(b.checked_at) - Date.parse(a.checked_at))[0] ?? null
}
export function discoveryContext(biz: Business, city?: string, service?: string) {
  const check = latestCheck(biz.listing_checks)
  const targetCity = city && CITY_BY_NAME[city] ? city
    : CITY_BY_NAME[biz.city] ? biz.city
    : check?.service_areas.find(area => RELAUNCH_CITY_NAMES.some(name => name === area)) ?? 'Mountain House'
  const selected = SERVICE_CHOICES.find(item => item.key === service && check?.service_tags.includes(item.tag))
  return { city: targetCity, service: selected, tags: selected ? [selected.tag] : check?.service_tags ?? [] }
}
export function businessHref(id: string, city?: string, service?: string) {
  const query = new URLSearchParams()
  if (city && CITY_BY_NAME[city]) query.set('city', city)
  if (SERVICE_CHOICES.some(item => item.key === service)) query.set('service', service!)
  return `/business/${encodeURIComponent(id)}${query.size ? `?${query}` : ''}`
}
// Explicit editorial contact instructions, checked against the provider's own site.
// Match exact hosts; a provider name or lookalike domain must not inherit these rules.
export function contactPreference(website?: string) {
  let host = ''
  try { host = new URL(website ?? '').hostname.replace(/^www\./, '') } catch { return null }
  if (host === 'mattdisko.com') return {
    label: 'Start service request',
    note: 'Submit the required website request form first. Phone is for follow-up.',
    source: 'https://www.mattdisko.com/', checkedAt: '2026-11-06',
  }
  return null
}
