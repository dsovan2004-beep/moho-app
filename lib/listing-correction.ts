import { RELAUNCH_CITY_NAMES } from './cities'
import { UUID } from './directory-requests'

export function listingCorrectionParams(id: string, name: string, officeCity: string, requestedCity: unknown, areas: string[] = []) {
  if (!UUID.test(id)) throw new Error('Invalid listing reference')
  const supported = (value: unknown): value is string => typeof value === 'string' && RELAUNCH_CITY_NAMES.some(city => city === value)
  const city = supported(requestedCity) ? requestedCity : supported(officeCity) ? officeCity : areas.find(supported)
  const params = new URLSearchParams({submission_type:'business_update', business_id:id, title:`Listing correction: ${name}`.slice(0,200)})
  if (city) params.set('city', city)
  return params
}
