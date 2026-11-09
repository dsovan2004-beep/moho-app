import {RELAUNCH_CITY_NAMES} from './cities'

export function outcomeReturnTo(city: string) {
  const allowed = RELAUNCH_CITY_NAMES.some(c=>c===city) ? city : 'All Cities'
  return `/directory?${new URLSearchParams({city:allowed})}#resident-outcome`
}

export function safeReturnTo(value: string | null): string {
  if (value === '/directory') return value
  if (value?.startsWith('/directory?') && value.length < 200) {
    const url = new URL(value, 'https://www.moholocal.com')
    const city = url.searchParams.get('city')
    if (url.pathname === '/directory' && url.hash === '#resident-outcome' &&
      [...url.searchParams.keys()].every(key=>key==='city') && url.searchParams.getAll('city').length===1 &&
      (city==='All Cities' || RELAUNCH_CITY_NAMES.some(c=>c===city))) return outcomeReturnTo(city!)
  }
  if (value?.startsWith('/submit?') && value.length<=1500) {
    const params=new URL(value,'https://www.moholocal.com').searchParams
    if ([...params.keys()].every(key=>['submission_type','business_id','city','title'].includes(key))) return `/submit?${params.toString()}`
  }
  if (value === '/community' || value === '/submit' || value === '/submit-business' || value === '/my-requests' || value === '/messages' || value === '/my-pet-reports') return value
  if (value && /^\/(?:claim-listing|community|lost-and-found)\/[0-9a-f-]{36}$/i.test(value)) return value
  return '/'
}
