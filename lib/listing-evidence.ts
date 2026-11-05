export interface ListingCheck {
  checked_at: string
  source_url: string
  checked_fields: string[]
  service_areas: string[]
  service_tags: string[]
  scope_note: string
}
export const CHECK_COLUMNS = 'checked_at,source_url,checked_fields,service_areas,service_tags,scope_note'
export function checkDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' }).format(new Date(value))
}
