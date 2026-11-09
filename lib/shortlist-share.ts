import { CITIES, RELAUNCH_CITY_NAMES } from './cities'
import { SERVICE_CHOICES } from './services'

export function shortlistShare(city: string, serviceKey?: string) {
  const cityConfig = CITIES.find(item => item.name === city && RELAUNCH_CITY_NAMES.some(name => name === city))
  if (!cityConfig) return null
  const service = SERVICE_CHOICES.find(item => item.key === serviceKey)
  if (serviceKey && !service) return null
  const path = `/shortlists/${cityConfig.slug}${service ? `/${service.key}` : ''}`
  const title = service ? `${service.label} in ${city}` : `Local directory for ${city}`
  const description = service
    ? `Browse ${service.label.toLowerCase()} options serving ${city} with dated website checks. Confirm your exact job, service address and availability directly; this is a contact shortlist, not a quality endorsement.`
    : `Find local listings for ${city}. Check each listing's source information, service area and current availability directly.`
  const url = `https://www.moholocal.com${path}`
  return {city,service,path,url,title,description,text:`${title}\n${description}\n${url}`}
}

export function shortlistFromPath(citySlug: string, serviceSegments?: string[]) {
  if (serviceSegments && serviceSegments.length !== 1) return null
  const city = CITIES.find(item => item.slug === citySlug)
  return city ? shortlistShare(city.name, serviceSegments?.[0]) : null
}
