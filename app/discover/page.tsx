import { serializeJsonLd } from '@/lib/json-ld'
import { getSupabaseClient } from '@/lib/supabase'
import { CITIES, RELAUNCH_CITY_NAMES } from '@/lib/cities'
import { SERVICE_CHOICES } from '@/lib/services'
import Link from 'next/link'

export const runtime = 'nodejs'
const LOCAL_CITIES = RELAUNCH_CITY_NAMES.map(name => CITIES.find(city => city.name === name)!)
const CATEGORIES = [
  {name:'Restaurants',emoji:'🍽️'}, {name:'Home Services',emoji:'🔧'},
  {name:'Health & Wellness',emoji:'🏥'}, {name:'Automotive',emoji:'🚗'},
  {name:'Beauty & Spa',emoji:'💇'}, {name:'Pet Services',emoji:'🐾'},
  {name:'Education',emoji:'🏫'}, {name:'Real Estate',emoji:'🏠'}, {name:'Retail',emoji:'🛍️'},
]
export const metadata = {
  title:'Discover Mountain House, Tracy, Lathrop & Manteca | MoHoLocal',
  description:'Explore local businesses, checked service shortlists and community updates in Mountain House, Tracy, Lathrop and Manteca.',
  alternates:{canonical:'https://www.moholocal.com/discover'},
  openGraph:{title:'Your nearby cities | MoHoLocal',description:'Find everyday help in Mountain House, Tracy, Lathrop and Manteca.',url:'https://www.moholocal.com/discover',siteName:'MoHoLocal'},
}

async function getBusinessCounts() {
  const db = getSupabaseClient()
  const rows: Array<{city:string;category:string}> = []
  const pageSize=1000
  for(let from=0;;from+=pageSize) {
    const {data,error} = await db.from('businesses').select('city,category').eq('status','approved').eq('verified',true)
      .in('city',[...RELAUNCH_CITY_NAMES]).order('id').range(from,from+pageSize-1)
    if(error) throw new Error('Directory counts unavailable')
    rows.push(...(data??[]))
    if(!data || data.length<pageSize) break
  }
  const totals: Record<string,number> = {}
  const matrix: Record<string,Record<string,number>> = {}
  for(const row of rows) {
    totals[row.city]=(totals[row.city]??0)+1
    matrix[row.city]??={}
    matrix[row.city][row.category]=(matrix[row.city][row.category]??0)+1
  }
  return {totals,matrix}
}

export default async function DiscoverPage() {
  const counts=await getBusinessCounts().catch(()=>null)
  const schema={'@context':'https://schema.org','@type':'ItemList',name:'MoHoLocal relaunch cities',itemListElement:LOCAL_CITIES.map((city,index)=>({'@type':'ListItem',position:index+1,name:`${city.name}, CA`,url:`https://www.moholocal.com/${city.slug}`}))}
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(schema)}} />
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600 mb-5"><Link className="inline-flex min-h-11 items-center underline" href="/">Home</Link><span aria-hidden="true" className="mx-2">/</span>Discover</nav>
    <header className="rounded-3xl border border-[#e8e3d7] bg-[#f6f3eb] p-6 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-widest text-[#59715d]">Mountain House · Tracy · Lathrop · Manteca</p>
      <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-[#18324f]">Nearby cities.<br />Everyday connections.</h1>
      <p className="mt-4 max-w-2xl text-slate-700 leading-relaxed">Choose your city to find local help, explore places and openings, or connect with your community. Providers based in another city may still serve your neighborhood.</p>
      <form action="/directory" className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
        <label htmlFor="discover-search" className="sr-only">Search local businesses</label>
        <input id="discover-search" name="q" placeholder="Business name or service" className="min-w-0 min-h-11 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#19352d]" />
        <button className="min-h-11 rounded-xl bg-[#19352d] px-6 py-3 text-white font-semibold">Search directory</button>
        <input type="hidden" name="city" value="All Cities" />
      </form>
      <p className="mt-3 text-sm text-slate-600">For a city-specific service shortlist, choose a shortcut below.</p>
    </header>
    {!counts && <p role="status" className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">Listing counts could not load. You can still choose a city or service. <Link href="/discover" className="inline-flex min-h-11 items-center font-semibold underline">Try again</Link></p>}
    <section className="mt-10" aria-labelledby="choose-city-heading">
      <h2 id="choose-city-heading" className="text-2xl font-bold text-[#18324f]">Start in your city</h2>
      <p className="mt-2 text-sm text-slate-600">Service shortcuts show dated website checks. A check confirms the stated information, not quality or availability.</p>
      <div className="mt-5 grid md:grid-cols-2 gap-5">{LOCAL_CITIES.map(city => <article key={city.slug} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 min-w-0">
        <h3 className="text-xl font-bold text-[#19352d]"><Link href={`/${city.slug}`} className="inline-flex min-h-11 items-center underline underline-offset-4">{city.name} →</Link></h3>
        <p className="text-sm text-slate-600 mt-1">{counts ? `${counts.totals[city.name]??0} approved listings based here` : 'Listing count unavailable'}</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-2" aria-label={`Checked services serving ${city.name}`}>{SERVICE_CHOICES.map(service => <Link key={service.key} href={`/directory?${new URLSearchParams({city:city.name,category:'Home Services',service:service.key})}`} className="inline-flex min-h-11 items-center rounded-xl border border-[#dce5d5] bg-[#f0f4ec] px-3 py-2 text-sm font-semibold text-[#19352d] hover:border-[#19352d]">{service.label} →</Link>)}</div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#1e3a5f]">
          <Link className="inline-flex min-h-11 items-center underline" href={`/${city.slug}`}>Places & city guide</Link>
          <Link className="inline-flex min-h-11 items-center underline" href={`/events?${new URLSearchParams({city:city.name})}`}>Local events</Link>
          <Link className="inline-flex min-h-11 items-center underline" href={`/lost-and-found?${new URLSearchParams({city:city.name})}`}>Pet reports</Link>
        </div>
      </article>)}</div>
    </section>
    <section className="mt-10" aria-labelledby="browse-categories-heading">
      <h2 id="browse-categories-heading" className="text-2xl font-bold text-[#18324f]">Browse the wider directory</h2>
      <p className="mt-2 text-sm text-slate-600 max-w-3xl">Counts below show approved business locations, across listings with different information-check dates. Results can also include providers based elsewhere with checked service areas. Counts are not recommendations or independently checked-provider totals.</p>
      <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">{CATEGORIES.map(category => <article key={category.name} className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold text-slate-900">{category.emoji} {category.name}</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">{LOCAL_CITIES.map(city => <Link key={city.slug} href={`/directory?${new URLSearchParams({city:city.name,category:category.name})}`} className="inline-flex min-h-11 flex-wrap items-center gap-x-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:border-[#19352d]">{city.name}<span className="text-xs text-slate-600">{counts ? `(${counts.matrix[city.name]?.[category.name]??0} based here)` : '(count unavailable)'}</span></Link>)}</div>
      </article>)}</div>
    </section>
    <aside className="mt-10 rounded-2xl bg-[#19352d] p-6 text-white">
      <h2 className="text-xl font-bold">Help your neighbors find you.</h2>
      <p className="mt-2 text-sm text-white/90">Suggest a business or submit your own listing for review.</p>
      <Link href="/submit-business" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-amber-400 px-5 py-3 font-bold text-[#18324f]">Add a business →</Link>
    </aside>
  </div>
}
