import { UUID } from './directory-requests'
import { RELAUNCH_CITY_NAMES } from './cities'

export function savedSubmissionReference(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const data = value as Record<string, unknown>
  return data.status === 'success' && data.needs_review === true && typeof data.submission_id === 'string' && UUID.test(data.submission_id)
    ? data.submission_id : null
}
export function receiptListingHref(id?: string, city?: string): string | null {
  if (!id || !UUID.test(id)) return null
  const params = new URLSearchParams()
  if (city && RELAUNCH_CITY_NAMES.some(item => item === city)) params.set('city',city)
  return `/business/${id}${params.size ? `?${params}` : ''}`
}
