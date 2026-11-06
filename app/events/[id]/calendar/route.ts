import { getSupabaseClient } from '@/lib/supabase'
import { eventCalendar } from '@/lib/event-calendar'
export const runtime = 'nodejs'
export async function GET(_request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id)) return new Response('Event not found', {status:404})
  const {data, error} = await getSupabaseClient().from('events').select('id,title,description,location,start_date,end_date,source_url').eq('id',id).eq('status','approved').maybeSingle()
  if (error) return new Response('Calendar temporarily unavailable', {status:503,headers:{'Cache-Control':'no-store'}})
  if (!data) return new Response('Event not found', {status:404})
  return new Response(eventCalendar(data), {headers:{'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':`attachment; filename="moholocal-${id}.ics"`,'Cache-Control':'public, max-age=300','X-Robots-Tag':'noindex'}})
}
