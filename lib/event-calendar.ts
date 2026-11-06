export type CalendarEvent = { id: string; title: string; description?: string | null; location?: string | null; start_date: string; end_date?: string | null; source_url?: string | null }
function text(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
}
function stamp(value: string | Date) {
  const d = new Date(value)
  if (!Number.isFinite(d.getTime())) throw new Error('Invalid calendar date')
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}
function fold(line: string) {
  const lines: string[] = []
  let current = '', bytes = 0
  for (const char of line) {
    const size = new TextEncoder().encode(char).length
    if (bytes + size > 75) { lines.push(current); current = ' '; bytes = 1 }
    current += char; bytes += size
  }
  lines.push(current)
  return lines.join('\r\n')
}
export function eventCalendar(event: CalendarEvent, now = new Date()) {
  if (!/^[a-f0-9-]{36}$/i.test(event.id)) throw new Error('Invalid event ID')
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MoHoLocal//Local Events//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${event.id}@moholocal.com`,`DTSTAMP:${stamp(now)}`,`DTSTART:${stamp(event.start_date)}`]
  if (event.end_date && new Date(event.end_date) > new Date(event.start_date)) lines.push(`DTEND:${stamp(event.end_date)}`)
  lines.push(`SUMMARY:${text(event.title)}`,`LOCATION:${text(event.location ?? '')}`,`DESCRIPTION:${text((event.description ?? '') + '\nConfirm details with the organizer before attending.')}`)
  if (event.source_url) {
    const url = new URL(event.source_url)
    if (url.protocol === 'https:' || url.protocol === 'http:') lines.push(`URL:${text(url.href)}`)
  }
  lines.push('END:VEVENT','END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}
