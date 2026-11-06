import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { RELAUNCH_CITY_NAMES } from '@/lib/cities'
import LocalOpenings from '@/app/components/LocalOpenings'
import CityPhoto from '@/app/components/CityPhoto'
import { eventDateParts, isUpcomingEvent } from '@/lib/event-dates'

export const runtime = 'nodejs'
const FOCUS: readonly string[] = RELAUNCH_CITY_NAMES
const TASKS = [
  { name: 'Handyman & small repairs', term: 'handyman', icon: '↗', note: 'Assembly, fixes and everyday home projects' },
  { name: 'Plumbing', term: 'plumbing', icon: '⌁', note: 'Leaks, drains and plumbing repairs' },
  { name: 'House cleaning', term: 'house-cleaning', icon: '✧', note: 'Regular cleaning and move-out help' },
  { name: 'Landscaping & yard care', term: 'landscaping', icon: '❋', note: 'Garden care, maintenance and outdoor projects' },
  { name: 'Solar bird exclusion', term: 'solar-bird-exclusion', icon: '⌂', note: 'Find solar mesh and under-panel pigeon cleanup services' },
  { name: 'Holiday light installation', term: 'holiday-light-installation', icon: '✦', note: 'Seasonal setup, maintenance and takedown options' },
]

export default async function Home({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const params = await searchParams
  const city = FOCUS.includes(params.city ?? '') ? params.city! : 'Mountain House'
  const client = getSupabaseClient()
  const counts = await Promise.all(FOCUS.map(async name => {
    const { count, error } = await client.from('businesses').select('id', { count: 'exact', head: true })
      .eq('status', 'approved').eq('verified', true).eq('city', name)
    return { name, count: error ? null : count }
  }))
  const { data: seasonalData, error: seasonalError } = await client.from('events')
    .select('id,title,city,location,start_date,end_date,source_url,description')
    .eq('status', 'approved').eq('source', 'editorial_seasonal_2026').or(`start_date.gte.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()},end_date.gte.${new Date().toISOString()}`).order('start_date', { ascending: true }).limit(40)
  const seasonal = (seasonalData ?? []).filter(event => isUpcomingEvent(event)).slice(0, 6)
  const photoCity = city === 'Mountain House' || city === 'Tracy' ? city : null
  return <div className="bg-[#faf9f6]">
    <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-12">
      <div className="flex flex-wrap items-center gap-2 mb-8" aria-label="Choose your city">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mr-2">Your neighborhood</span>
        {FOCUS.map(name => <Link key={name} href={`/?city=${encodeURIComponent(name)}`} aria-current={city === name ? 'page' : undefined}
          className={`rounded-full min-h-11 inline-flex items-center px-4 py-2 text-sm font-semibold border transition ${city === name ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'}`}>{name}</Link>)}
      </div>
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
        <div>
          <p className="text-sm text-amber-800 font-bold tracking-wide mb-4">YOUR PEOPLE. YOUR PLACES. YOUR NEIGHBORHOOD.</p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#18324f] leading-[1.08] max-w-2xl">A little closer<br />to <span className="text-[#59715d]">home.</span></h1>
          <p className="text-lg text-slate-600 mt-6 max-w-xl leading-relaxed">Find everyday help in {city}, discover local celebrations and stay connected to the people around you.</p>
          <form action="/directory" className="mt-8 bg-white rounded-2xl border border-slate-300 shadow-sm p-2 flex flex-col sm:flex-row gap-2">
            <input type="hidden" name="city" value={city} />
            <label className="flex-1 px-3 py-2 text-xs font-semibold text-slate-500">What do you need?
              <input name="q" type="search" maxLength={100} placeholder="A plumber, house cleaning, a business…" className="block w-full text-base font-normal text-slate-900 mt-1 bg-transparent outline-none focus:ring-2 focus:ring-blue-600 rounded" />
            </label>
            <button className="rounded-xl bg-[#1e3a5f] hover:bg-[#142b48] text-white font-bold px-6 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Find local help →</button>
          </form>
          <p className="mt-3 text-xs text-slate-500">Free to browse · Contact businesses directly</p>
        </div>
        <div className="min-w-0 relative">
          {photoCity ? <CityPhoto city={photoCity} priority className="h-80 sm:h-[27rem] shadow-xl shadow-[#18324f]/10 lg:rounded-tr-[5rem]" /> : <aside className="rounded-3xl bg-[#e9eee5] p-8"><p className="text-xs font-bold uppercase tracking-widest text-[#59715d]">Around our communities</p><h2 className="text-2xl font-bold text-[#18324f] mt-4">Start close to home.</h2><p className="text-slate-600 mt-3 leading-relaxed">Find nearby help, check local pet reports and explore upcoming gatherings.</p><Link className="inline-flex min-h-11 items-center font-bold text-[#1e3a5f] underline mt-5" href={`/events?city=${encodeURIComponent(city)}`}>See {city} events →</Link></aside>}
          <p className="mt-3 text-xs text-slate-500">Local views, with capture dates and credits. <Link href="/photo-credits" className="underline underline-offset-2">Image dates & credits →</Link></p>
        </div>
      </div>
    </section>
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-10"><LocalOpenings city={city} /></div>
    <section className="bg-[#e9eee5] border-y border-[#dce3d6]" aria-labelledby="seasonal-heading">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
          <div><p className="text-xs font-bold tracking-widest uppercase text-[#52654d] mb-2">Make a little time for local</p><h2 id="seasonal-heading" className="text-2xl sm:text-3xl font-bold text-[#18324f]">Gather here. Celebrate together.</h2></div>
          <Link href="/events?season=2026" className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 text-[#18324f]">Explore seasonal events →</Link>
        </div>
        {seasonalError ? <p className="text-slate-700">Seasonal events couldn’t load. <Link className="underline" href="/events">Try the events calendar →</Link></p> : seasonal.length ? <div className="grid md:grid-cols-2 gap-5">{seasonal.map(event => {
          const date = eventDateParts(event.start_date)
          return <article key={event.id} className="rounded-2xl bg-white border border-[#d7dfd1] p-5 sm:p-6 flex gap-4">
            <div className="shrink-0 text-center w-14"><div className="bg-[#8a492d] rounded-t-lg text-white text-xs font-bold py-1">{date.month}</div><div className="bg-[#f5f0e7] rounded-b-lg py-2 text-2xl font-bold text-[#18324f]">{date.day}</div></div>
            <div className="min-w-0"><p className="text-xs font-semibold text-[#59715d]">{event.city} · Holiday season 2026</p><h3 className="text-lg font-bold text-[#18324f] mt-1"><Link className="hover:underline focus-visible:outline focus-visible:outline-2" href={`/events/${event.id}`}>{event.title}</Link></h3><p className="text-sm text-slate-600 mt-2">{date.date} · {date.time} Pacific</p><p className="text-sm text-slate-600 mt-1">{event.location}</p><p className="text-xs text-slate-500 mt-3">Organizer details checked November 6. Recheck the organizer before you go.</p><Link className="inline-flex min-h-11 items-center text-sm font-bold text-[#1e3a5f] underline underline-offset-4 mt-1" href={`/events/${event.id}`}>See details & organizer →</Link></div>
          </article>
        })}</div> : <p className="text-slate-700">We’re checking the next local celebrations. <Link className="underline" href="/events">Browse the events calendar →</Link></p>}
        <p className="text-xs text-[#52654d] mt-4">Details can change. Check the organizer’s page for registration, costs and the latest schedule.</p>
      </div>
    </section>
    <section className="max-w-6xl mx-auto px-5 sm:px-8 py-10 border-t border-slate-200">
      <div className="flex flex-wrap gap-4 justify-between items-end mb-6"><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Start with a task</p><h2 className="text-2xl sm:text-3xl font-bold text-[#18324f]">What needs doing?</h2></div><Link href={`/directory?city=${encodeURIComponent(city)}`} className="text-sm font-semibold text-[#1e3a5f] underline underline-offset-4">Browse all categories →</Link></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{TASKS.map(task => <Link key={task.term} href={`/directory?${new URLSearchParams({ city, category: 'Home Services', service: task.term })}`}
        className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-[#1e3a5f] hover:shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">
        <span aria-hidden="true" className="text-3xl text-[#59715d]">{task.icon}</span><h3 className="text-lg font-bold text-[#18324f] mt-5">{task.name}</h3><p className="text-sm text-slate-600 mt-2 leading-relaxed">{task.note}</p><span className="block mt-5 text-sm font-semibold text-[#1e3a5f]">Explore options →</span>
      </Link>)}</div>
      <p className="text-xs text-slate-500 mt-4">These service shortlists use dated website checks. Coverage is being rebuilt; ask each business to confirm your exact job and address.</p>
    </section>
    <aside className="max-w-6xl mx-auto px-5 sm:px-8 pt-4 pb-3"><div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h2 className="font-bold text-lg text-[#18324f]">Lost or found a pet in {city}?</h2><p className="text-sm text-slate-600 mt-1">Check local reports and reunited updates. Check the report date and source before sharing.</p></div><Link href={`/lost-and-found?city=${encodeURIComponent(city)}`} className="shrink-0 text-sm font-bold text-[#1e3a5f] underline underline-offset-4">View pet reports →</Link></div></aside>
    <section className="max-w-6xl mx-auto px-5 sm:px-8 py-10 grid md:grid-cols-2 gap-8">
      <div><h2 className="text-2xl font-bold text-[#18324f]">Nearby cities. One place to look.</h2><div className="mt-5 space-y-3">{counts.map(item => <Link key={item.name} href={`/directory?city=${encodeURIComponent(item.name)}`} className="flex justify-between items-center gap-3 bg-white p-5 border border-slate-200 rounded-xl"><span className="font-semibold text-[#18324f]">{item.name}</span><span className="text-sm text-slate-500">{item.count === null ? 'Browse listings' : `${item.count} published listings based here`} →</span></Link>)}</div><p className="text-xs text-slate-500 mt-3">Inventory across all categories, based in each city. Search also includes providers with checked service areas; these counts do not represent independently checked providers.</p></div>
      <div className="rounded-2xl bg-white border border-slate-200 p-7"><h2 className="text-xl font-bold text-[#18324f]">Clear information. Clear expectations.</h2><p className="text-slate-600 leading-relaxed mt-4">An approved listing or owner claim is not a recommendation or a guarantee. Confirm pricing, availability and any credentials needed for your job directly with the provider.</p><p className="text-slate-600 leading-relaxed mt-4">Own a business? Submit a listing or request a claim. Every request goes through review before publication or ownership changes.</p><Link href="/my-requests" className="inline-block text-sm font-bold text-[#1e3a5f] underline underline-offset-4 mt-5">Track your submissions and claims →</Link></div>
    </section>
    <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-3 pb-14 grid md:grid-cols-2 gap-6">
      <CityPhoto city={photoCity === 'Mountain House' ? 'Tracy' : 'Mountain House'} className="h-72" />
      <div className="rounded-3xl bg-[#183f3b] text-white p-7 sm:p-9 flex flex-col justify-center"><p className="text-xs font-bold uppercase tracking-widest text-[#d2dfbd]">A community takes all of us</p><h2 className="text-2xl font-bold mt-3">Have something local to share?</h2><p className="text-white/85 leading-relaxed mt-3">Suggest a business, join a neighborhood conversation or help someone find a missing pet.</p><div className="flex flex-wrap gap-x-5 gap-y-2 mt-5"><Link className="inline-flex min-h-11 items-center underline underline-offset-4 font-semibold" href="/submit-business">Suggest a business →</Link><Link className="inline-flex min-h-11 items-center underline underline-offset-4 font-semibold" href="/community">Community board →</Link></div></div>
    </section>
  </div>
}
