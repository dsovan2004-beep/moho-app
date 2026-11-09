export const runtime='nodejs'
import {getSupabaseClient} from '@/lib/supabase'
import {RELAUNCH_CITY_NAMES} from '@/lib/cities'
import {sitemapStaticPaths,sitemapXml} from '@/lib/sitemap'

export async function GET() {
  const db=getSupabaseClient()
  const entries:Array<{path:string;updated_at?:string|null}>=sitemapStaticPaths().map(path=>({path}))
  // Fail the sitemap request rather than silently publishing a truncated/empty catalog.
  try {
    const ids:string[]=[]
    for(let from=0;;from+=500) {
      const {data:checks,error:checkError}=await db.from('listing_checks').select('business_id').overlaps('service_areas',[...RELAUNCH_CITY_NAMES]).order('business_id').range(from,from+499)
      if(checkError) throw checkError
      ids.push(...(checks??[]).map(c=>c.business_id).filter(id=>/^[0-9a-f-]{36}$/i.test(id)))
      if((checks??[]).length<500) break
    }
    const scope=[...RELAUNCH_CITY_NAMES.map(city=>`city.eq."${city}"`),...(ids.length?[`id.in.(${ids.join(',')})`]:[])].join(',')
    const pageSize=500
    for(let from=0;;from+=pageSize) {
      const {data,error}=await db.from('businesses').select('id,updated_at').eq('status','approved').eq('verified',true).or(scope).order('id').range(from,from+pageSize-1)
      if(error) throw error
      for(const row of data??[]) if(/^[0-9a-f-]{36}$/i.test(row.id)) entries.push({path:`/business/${row.id}`,updated_at:row.updated_at})
      if((data??[]).length<pageSize) break
    }
    for(let from=0;;from+=pageSize) {
      const {data,error}=await db.from('events').select('id').eq('status','approved').in('city',[...RELAUNCH_CITY_NAMES]).order('id').range(from,from+pageSize-1)
      if(error) throw error
      for(const row of data??[]) if(/^[0-9a-f-]{36}$/i.test(row.id)) entries.push({path:`/events/${row.id}`})
      if((data??[]).length<pageSize) break
    }
    // Pet report eligibility is enforced by its public-read RLS policy.
    for(let from=0;;from+=pageSize) {
      const {data:pets,error:petError}=await db.from('lost_and_found').select('id').in('city',[...RELAUNCH_CITY_NAMES]).order('id').range(from,from+pageSize-1)
      if(petError) throw petError
      for(const row of pets??[]) if(/^[0-9a-f-]{36}$/i.test(row.id)) entries.push({path:`/lost-and-found/${row.id}`})
      if((pets??[]).length<pageSize) break
    }
    return new Response(sitemapXml(entries),{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=300, s-maxage=300'}})
  } catch {
    return new Response('Sitemap temporarily unavailable. Please retry.',{status:503,headers:{'Cache-Control':'no-store','Retry-After':'300'}})
  }
}
