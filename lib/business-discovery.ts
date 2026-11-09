import { CITY_BY_NAME, RELAUNCH_CITY_NAMES } from './cities'
import { SERVICE_CHOICES, serviceForCategory } from './services'
import { directoryHref } from './directory-filters'
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
// A directory return destination is data, never a general redirect URL.
export function directoryReturn(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2400 || !value.startsWith('/directory?')) return null
  const url = new URL(value, 'https://www.moholocal.com')
  if (url.pathname !== '/directory' || url.hash) return null
  const p = url.searchParams
  if ([...p.keys()].some(key => !['city','category','service','q','sort'].includes(key) || p.getAll(key).length !== 1)) return null
  const city = p.get('city') ?? 'All Cities'
  const category = p.get('category') ?? 'All'
  if (city !== 'All Cities' && !CITY_BY_NAME[city]) return null
  if (!['All','Restaurants','Health & Wellness','Home Services','Pet Services','Beauty & Spa','Automotive','Education','Real Estate','Retail'].includes(category)) return null
  const query = p.get('q') ?? ''
  if (query.length > 200 || /[\x00-\x1f\x7f]/.test(query)) return null
  const service = serviceForCategory(p.get('service'), category)?.key
  return directoryHref({city,category,service,query,sort:p.get('sort') ?? 'name'})
}
export function businessHref(id: string, city?: string, service?: string, returnTo?: string) {
  const query = new URLSearchParams()
  if (city && CITY_BY_NAME[city]) query.set('city', city)
  if (SERVICE_CHOICES.some(item => item.key === service)) query.set('service', service!)
  const destination = directoryReturn(returnTo)
  if (destination) query.set('returnTo', destination)
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


// Only verified host + number pairs can change the contact channel.
export function textContact(website?:string, phone?:string) {
  let host=''
  try { const url=new URL(website??''); if(!['https:','http:'].includes(url.protocol)) return null; host=url.hostname.replace(/^www\./,'') } catch { return null }
  const digits=(phone??'').replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'')
  if(host==='ithinkpet.com'&&digits==='5102741750') return {
    href:'sms:+15102741750',label:'Text (510) 274-1750',
    note:'The provider lists this number for texts. Opens your messaging app; nothing is sent automatically.',
    source:'https://www.ithinkpet.com/central-valley-rates.html',checkedAt:'2026-11-08',
  }
  return null
}
