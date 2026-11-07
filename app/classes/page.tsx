import Link from 'next/link'
import {getSupabaseClient} from '@/lib/supabase'
import {RELAUNCH_CITY_NAMES} from '@/lib/cities'
import {checkDate} from '@/lib/listing-evidence'
import {CLASS_TOPICS,classTopic,classesHref,matchesClassTopic,classCoverage} from '@/lib/class-discovery'
import BusinessContactActions from '@/app/components/BusinessContactActions'

export const runtime='nodejs'
export const metadata={title:'Cultural classes, dance & music near you | MoHoLocal',description:'Find source-checked language, dance and music programs serving Mountain House, Tracy, Lathrop and Manteca.',alternates:{canonical:'https://www.moholocal.com/classes'}}
type Program={checked_at:string;source_url:string;service_areas:string[];service_tags:string[];businesses:{id:string;name:string;city:string;description:string;phone:string;website:string}}
export default async function ClassesPage({searchParams}:{searchParams:Promise<{city?:string;topic?:string}>}) {
  const params=await searchParams
  const city=RELAUNCH_CITY_NAMES.some(name=>name===params.city)?params.city!:'All Cities'
  const topic=classTopic(params.topic)
  let req=getSupabaseClient().from('listing_checks').select('checked_at,source_url,service_areas,service_tags,businesses!inner(id,name,city,description,phone,website)')
    .eq('businesses.category','Education').eq('businesses.status','approved').eq('businesses.verified',true).order('checked_at',{ascending:false})
  const {data,error}=await req
  const programs=((data??[]) as unknown as Program[]).filter(row=>row.service_areas.some(area=>RELAUNCH_CITY_NAMES.some(name=>name===area)))
  const {visible,inCity,countForCity}=classCoverage(programs,city,topic)
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600 flex items-center gap-2"><Link className="inline-flex min-h-11 items-center underline" href={`/discover?${new URLSearchParams({city})}`}>Explore</Link><span aria-hidden="true">/</span>Classes</nav>
    <header className="mt-4 rounded-3xl border border-[#dce5d5] bg-[#edf1e8] p-6 sm:p-10">
      <p className="text-xs uppercase tracking-widest font-bold text-[#59715d]">Learn something. Find your community.</p>
      <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight text-[#18324f]">Language, dance<br />& music nearby.</h1>
      <p className="mt-4 max-w-2xl text-slate-700">Explore specific traditions and programs, open to anyone interested. Choose where you live, then the kind of class you want. A school based elsewhere may serve your city.</p>
      <div aria-label="Class city" className="mt-5 flex flex-wrap gap-2">{['All Cities',...RELAUNCH_CITY_NAMES].map(name=><Link key={name} href={classesHref(name,topic)} aria-current={city===name?'page':undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold ${city===name?'bg-[#18324f] border-[#18324f] text-white':'bg-white border-slate-300 text-slate-700'}`}>{name}{!error&&<span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">{countForCity(name)}</span>}</Link>)}</div>
    </header>
    <nav aria-label="Class topics" className="mt-6 flex flex-wrap gap-2">{CLASS_TOPICS.map(item=><Link key={item.key} href={classesHref(city,item.key)} aria-current={topic===item.key?'page':undefined} className={`inline-flex min-h-11 items-center rounded-xl border px-4 py-2 font-semibold text-sm ${topic===item.key?'bg-[#19352d] border-[#19352d] text-white':'bg-white border-slate-300 text-slate-700'}`}>{item.label}{!error&&` (${inCity.filter(row=>matchesClassTopic(row.service_tags,item.key)).length})`}</Link>)}</nav>
    <p className="mt-4 text-sm text-slate-600">Only programs with dated website checks appear here. A check confirms published details, not teaching quality, credentials, safeguarding or available places. Confirm fees, age group, accessibility, schedule and classroom with the school.</p>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p role="status" className="text-sm text-slate-700">{error?'Program counts unavailable':`${visible.length} checked ${visible.length===1?'program':'programs'}${city==='All Cities'?' across our cities':` serving ${city}`}`}{topic!=='all'&&` · ${CLASS_TOPICS.find(item=>item.key===topic)?.label}`}</p>
      {topic!=='all'&&<Link href={classesHref(city)} className="inline-flex min-h-11 items-center text-sm font-semibold underline text-[#19352d]">Clear topic filter</Link>}
    </div>
    <section className="mt-7" aria-labelledby="class-results"><h2 id="class-results" className="text-2xl font-bold text-[#18324f]">{city==='All Cities'?'Programs across our cities':`Programs serving ${city}`}</h2>
      {error?<p role="status" className="mt-4 rounded-xl border border-amber-300 p-5">Programs couldn’t load. <Link className="underline inline-flex min-h-11 items-center" href={classesHref(city,topic)}>Try again</Link></p>:visible.length?<div className="mt-5 grid md:grid-cols-2 gap-5">{visible.map(row=><article key={row.businesses.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <p className="text-xs font-semibold text-[#59715d]">Website checked · {checkDate(row.checked_at)}</p>
        <h3 className="mt-2 text-xl font-bold text-[#18324f] break-words"><Link className="hover:underline" href={`/business/${row.businesses.id}?${new URLSearchParams({city:city==='All Cities'?row.service_areas[0]:city})}`}>{row.businesses.name}</Link></h3>
        <p className="mt-2 text-xs text-slate-600">{row.businesses.city==='Service area only'?'Classroom location not established':`Based in ${row.businesses.city}`} · Serves {row.service_areas.filter(area=>RELAUNCH_CITY_NAMES.some(name=>name===area)).join(', ')}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{row.businesses.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">{row.service_tags.map(tag=><span key={tag} className="rounded-full bg-[#f0f4ec] px-3 py-1 text-xs text-[#19352d]">{tag}</span>)}</div>
        <BusinessContactActions phone={row.businesses.phone} website={row.businesses.website}/>
        <div className="mt-3 flex flex-wrap gap-x-5"><Link className="inline-flex min-h-11 items-center text-sm font-semibold underline text-[#1e3a5f]" href={`/business/${row.businesses.id}?${new URLSearchParams({city:city==='All Cities'?row.service_areas[0]:city})}`}>Details & information check →</Link><a className="inline-flex min-h-11 items-center text-sm underline text-slate-600" href={row.source_url} target="_blank" rel="noopener noreferrer">Checked source ↗</a></div>
      </article>)}</div>:<div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6"><p className="text-slate-700">No checked programs for this combination yet. That doesn’t mean no classes exist.</p><div className="mt-3 flex flex-wrap gap-3">{countForCity('All Cities')>0&&<Link className="inline-flex min-h-11 items-center underline font-semibold" href={classesHref('All Cities',topic)}>See {countForCity('All Cities')} {countForCity('All Cities')===1?'program':'programs'} across nearby cities</Link>}<Link className="inline-flex min-h-11 items-center underline font-semibold" href={classesHref(city)}>All programs in this city</Link></div></div>}
    </section>
    <aside className="mt-8 rounded-2xl border border-[#dce5d5] bg-[#f6f3eb] p-6"><h2 className="font-bold text-xl text-[#18324f]">Have a program to suggest?</h2><p className="mt-2 text-sm text-slate-700">Help us cover more languages, traditions and creative interests. Submissions are reviewed before publication.</p><Link className="mt-3 inline-flex min-h-11 items-center underline font-semibold text-[#19352d]" href="/submit-business">Suggest a class or school →</Link><Link className="ml-5 inline-flex min-h-11 items-center underline text-[#19352d]" href={`/events?${new URLSearchParams({city})}`}>Local events →</Link></aside>
  </div>
}
