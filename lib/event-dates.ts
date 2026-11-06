// Event dates always use the community's timezone, including on UTC Workers.
export const EVENT_TIME_ZONE = 'America/Los_Angeles'
const dateOnly = /^\d{4}-\d{2}-\d{2}$/
export function eventDateParts(value: string) {
  const d = new Date(dateOnly.test(value) ? `${value}T12:00:00-08:00` : value)
  const options = { timeZone: EVENT_TIME_ZONE } as const
  return {
    weekday: d.toLocaleDateString('en-US', { ...options, weekday: 'long' }),
    date: d.toLocaleDateString('en-US', { ...options, month: 'long', day: 'numeric', year: 'numeric' }),
    month: d.toLocaleDateString('en-US', { ...options, month: 'short' }).toUpperCase(),
    day: d.toLocaleDateString('en-US', { ...options, day: 'numeric' }),
    time: dateOnly.test(value) ? null : d.toLocaleTimeString('en-US', { ...options, hour: 'numeric', minute: '2-digit' }),
  }
}
function localDay(value: string | Date) {
  if (typeof value === 'string' && dateOnly.test(value)) return value
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: EVENT_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value))
  const get = (name: string) => parts.find(p => p.type === name)!.value
  return `${get('year')}-${get('month')}-${get('day')}`
}
export function isUpcomingEvent(event: {start_date: string; end_date?: string | null}, now = new Date()) {
  // Unknown end time: retain the event through its local calendar date.
  return event.end_date ? new Date(event.end_date).getTime() >= now.getTime() : localDay(event.start_date) >= localDay(now)
}
export function eventBucket(value: string, now = new Date()): 'today' | 'tomorrow' | 'this-weekend' | 'this-week' | 'upcoming' {
  const day = localDay(value)
  const delta = Math.round((Date.parse(day) - Date.parse(localDay(now))) / 86400000)
  if (delta === 0) return 'today'
  if (delta === 1) return 'tomorrow'
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay()
  if (delta >= 2 && delta < 7 && (weekday === 0 || weekday === 6)) return 'this-weekend'
  if (delta >= 2 && delta < 7) return 'this-week'
  return 'upcoming'
}
