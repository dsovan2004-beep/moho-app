import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { RELAUNCH_CITY_NAMES } from '@/lib/cities'

export const runtime = 'nodejs'
const FOCUS: readonly string[] = RELAUNCH_CITY_NAMES
const TASKS = [
  { name: 'Handyman & small repairs', term: 'handyman', icon: '↗', note: 'Assembly, fixes and everyday home projects' },
  { name: 'Plumbing', term: 'plumbing', icon: '⌁', note: 'Leaks, drains and plumbing repairs' },
  { name: 'House cleaning', term: 'house-cleaning', icon: '✧', note: 'Regular cleaning and move-out help' },
  { name: 'Landscaping & yard care', term: 'landscaping', icon: '❋', note: 'Garden care, maintenance and outdoor projects' },
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
  return <div className="bg-[#faf9f6]">
    <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-12">
      <div className="flex flex-wrap items-center gap-2 mb-8" aria-label="Choose your city">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mr-2">Your neighborhood</span>
        {FOCUS.map(name => <Link key={name} href={`/?city=${encodeURIComponent(name)}`} aria-current={city === name ? 'page' : undefined}
          className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${city === name ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'}`}>{name}</Link>)}
      </div>
      <div className="grid lg:grid-cols-[1.35fr_0.8fr] gap-10 lg:gap-16 items-center">
        <div>
          <p className="text-sm text-amber-800 font-bold tracking-wide mb-4">LOCAL HELP. LESS SEARCHING.</p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#18324f] leading-[1.08] max-w-2xl">Find the right help.<br /><span className="text-slate-500">Right around here.</span></h1>
          <p className="text-lg text-slate-600 mt-6 max-w-xl leading-relaxed">Explore businesses in {city}. Find contact details, compare options and get in touch directly.</p>
          <form action="/directory" className="mt-8 bg-white rounded-2xl border border-slate-300 shadow-sm p-2 flex flex-col sm:flex-row gap-2">
            <input type="hidden" name="city" value={city} />
            <label className="flex-1 px-3 py-2 text-xs font-semibold text-slate-500">What do you need?
              <input name="q" type="search" maxLength={100} placeholder="A plumber, house cleaning, a business…" className="block w-full text-base font-normal text-slate-900 mt-1 bg-transparent outline-none focus:ring-2 focus:ring-blue-600 rounded" />
            </label>
            <button className="rounded-xl bg-[#1e3a5f] hover:bg-[#142b48] text-white font-bold px-6 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Find local help →</button>
          </form>
          <p className="mt-3 text-xs text-slate-500">Free to browse · Contact businesses directly</p>
        </div>
        <aside className="bg-[#eaeedf] rounded-[2rem] p-7 sm:p-9 relative overflow-hidden border border-[#dce2ce]">
          <span className="text-5xl text-[#4d6652]" aria-hidden="true">⌂</span>
          <p className="text-xs font-bold tracking-widest text-[#4d6652] mt-7 uppercase">Built for nearby</p>
          <h2 className="text-2xl font-bold text-[#243d30] mt-3">A useful place to start.</h2>
          <p className="text-[#47584c] leading-relaxed mt-3">We’re improving MoHoLocal for Mountain House and Tracy, starting with everyday help around the home.</p>
          <Link href="/submit-business" className="inline-flex text-sm font-bold text-[#243d30] underline underline-offset-4 mt-6">Know a local business? Suggest it →</Link>
        </aside>
      </div>
    </section>
    <section className="max-w-6xl mx-auto px-5 sm:px-8 py-10 border-t border-slate-200">
      <div className="flex flex-wrap gap-4 justify-between items-end mb-6"><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Start with a task</p><h2 className="text-2xl sm:text-3xl font-bold text-[#18324f]">What needs doing?</h2></div><Link href={`/directory?city=${encodeURIComponent(city)}`} className="text-sm font-semibold text-[#1e3a5f] underline underline-offset-4">Browse all categories →</Link></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{TASKS.map(task => <Link key={task.term} href={`/directory?${new URLSearchParams({ city, category: 'Home Services', service: task.term })}`}
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
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-3 pb-14 flex flex-wrap gap-5 text-sm text-slate-600"><Link href="/events">Local events →</Link><Link href="/community">Community board →</Link><Link href="/discover">More cities →</Link></div>
  </div>
}
