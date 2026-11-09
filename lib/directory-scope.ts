import { RELAUNCH_CITY_NAMES } from './cities'
import { UUID } from './directory-requests'

// An outside-city office belongs in the regional view only with recorded coverage.
export function regionalDirectoryFilter(checkedIds: unknown[]) {
  const ids=[...new Set(checkedIds.filter((id):id is string=>typeof id==='string' && UUID.test(id)))]
  const cities=RELAUNCH_CITY_NAMES.map(city=>`"${city}"`).join(',')
  return `city.in.(${cities})${ids.length ? `,id.in.(${ids.join(',')})` : ''}`
}
