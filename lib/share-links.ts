import { UUID } from './directory-requests'
import { RELAUNCH_CITY_NAMES } from './cities'

// Build from public listing data, never the current URL or navigation state.
export function businessShareUrl(id: unknown, city?: unknown): string | null {
  if (typeof id !== 'string' || !UUID.test(id)) return null
  const params = new URLSearchParams()
  if (typeof city === 'string' && RELAUNCH_CITY_NAMES.some(item => item === city)) params.set('city',city)
  return `https://www.moholocal.com/business/${id}${params.size ? `?${params}` : ''}`
}

export async function copyShareText(text: string, clipboard?: {writeText:(value:string)=>Promise<void>}): Promise<boolean> {
  if (!clipboard) return false
  try { await clipboard.writeText(text); return true } catch { return false }
}
