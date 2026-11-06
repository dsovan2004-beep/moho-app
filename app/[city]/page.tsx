import { getSupabaseClient, PUBLIC_BUSINESS_COLUMNS, type Business } from '@/lib/supabase'
import { CITIES } from '@/lib/cities'
import { SERVICE_CHOICES } from '@/lib/services'
import { CHECK_COLUMNS, type ListingCheck } from '@/lib/listing-evidence'
import ListingEvidence from '@/app/components/ListingEvidence'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const runtime = 'nodejs'
interface PageProps { params: Promise<{ city: string }> }
type CheckedBusiness = Business & { listing_checks: ListingCheck | ListingCheck[] | null }
const CATEGORIES = ['Restaurants', 'Home Services', 'Health & Wellness', 'Automotive', 'Beauty & Spa', 'Pet Services', 'Education', 'Real Estate', 'Retail']

export async function generateMetadata({ params }: PageProps) {
  const { city: slug } = await params
  const city = CITIES.find(c => c.slug === slug)
  if (!city) return { title: 'MoHoLocal' }
  return {
    title: `${city.name} Local Businesses & Services | MoHoLocal`,
    description: `Find services for your home and businesses in ${city.name}, California. Compare dated information checks, service areas and contact details.`,
    alternates: { canonical: `https://www.moholocal.com/${slug}` },
  }
}

export default async function CityPage({ params }: PageProps) {
  const { city: slug } = await params
  const city = CITIES.find(c => c.slug === slug)
  if (!city) notFound()
  const db = getSupabaseClient()
  const [count, local, served] = await Promise.all([
    db.from('businesses').select('id', { count: 'exact', head: true }).eq('city', city.name).eq('status', 'approved').eq('verified', true),
    db.from('businesses').select(`${PUBLIC_BUSINESS_COLUMNS},listing_checks(${CHECK_COLUMNS})`).eq('city', city.name).eq('status', 'approved').eq('verified', true).order('name').limit(6),
    db.from('businesses').select(`${PUBLIC_BUSINESS_COLUMNS},listing_checks!inner(${CHECK_COLUMNS})`).contains('listing_checks.service_areas', [city.name]).eq('category', 'Home Services').eq('status', 'approved').eq('verified', true).order('name').limit(12),
  ])
  const checked = (served.data ?? []) as CheckedBusiness[]
  const directoryUrl = `/directory?city=${encodeURIComponent(city.name)}`
  const loadFailed = Boolean(count.error || local.error || served.error)
  return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600 mb-6"><Link href="/" className="underline underline-offset-4">Home</Link><span className="mx-2" aria-hidden="true">/</span>{city.name}</nav>
    <header className="bg-[#f6f3eb] rounded-3xl p-6 sm:p-10 border border-[#e8e3d7]">
      <p className="text-sm font-semibold text-slate-600 mb-3">{city.county}, California</p>
      <h1 className="text-3xl sm:text-5xl font-bold text-[#19352d] tracking-tight">Find help in {city.name}.</h1>
      <p className="mt-4 text-slate-700 max-w-2xl leading-relaxed">Start with the job you need done. See who serves your city, what information we checked, and how to contact them.</p>
      <form action="/directory" className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
        <input type="hidden" name="city" value={city.name} />
        <label htmlFor="city-search" className="sr-only">Search businesses in {city.name}</label>
        <input id="city-search" name="q" placeholder="Business name or service" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:ring-2 focus:ring-[#19352d]" />
        <button className="rounded-xl bg-[#19352d] text-white px-6 py-3 font-semibold hover:bg-[#294b40]">Search {city.name}</button>
      </form>
      <p className="mt-4 text-sm text-slate-600">{count.error ? 'Listing count temporarily unavailable.' : `${count.count ?? 0} approved listings located in ${city.name}.`} Providers based elsewhere may also serve your city.</p>
    </header>

    {loadFailed && <p role="status" className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">Some listing information could not load. <Link href={`/${slug}`} className="underline font-semibold">Try this page again</Link> or <Link href={directoryUrl} className="underline font-semibold">open the directory</Link>.</p>}

    <section className="mt-10" aria-labelledby="service-heading">
      <h2 id="service-heading" className="text-2xl font-bold text-slate-900">What needs doing?</h2>
      <p className="mt-2 text-sm text-slate-600">These shortlists use website-checked service information. We are still building coverage.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">{SERVICE_CHOICES.map(service => <Link key={service.key} href={`${directoryUrl}&service=${service.key}`} className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-[#19352d] hover:border-[#19352d] focus-visible:ring-2 focus-visible:ring-[#19352d]">{service.label}<span className="block mt-3 text-sm font-normal">See checked options →</span></Link>)}</div>
    </section>

    <section className="mt-10" aria-labelledby="checked-heading">
      <h2 id="checked-heading" className="text-2xl font-bold text-slate-900">Website-checked providers serving {city.name}</h2>
      <p className="mt-2 text-sm text-slate-600">An information check confirms the fields described below. Confirm pricing, availability and suitability directly with each provider.</p>
      {checked.length ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">{checked.map(biz => <article key={biz.id} className="rounded-2xl border border-slate-200 bg-white p-5 min-w-0">
        <h3 className="font-bold text-lg"><Link href={`/business/${biz.id}`} className="text-[#19352d] underline underline-offset-4 break-words">{biz.name}</Link></h3>
        <p className="mt-2 text-sm text-slate-600">{biz.city === 'Service area only' ? 'Office location not listed' : `Based in ${biz.city}`} </p>
        <ListingEvidence check={biz.listing_checks} />
        {biz.phone && <a href={`tel:${biz.phone.replace(/[^+\d]/g, '')}`} className="inline-block mt-4 rounded-lg bg-[#19352d] px-4 py-2 text-white font-semibold text-sm">Call {biz.phone}</a>}
      </article>)}</div> : <div className="mt-5 border border-dashed border-slate-300 rounded-2xl p-6 text-slate-700">{served.error ? 'Checked providers could not load right now.' : 'No website-checked providers are ready for this city yet.'} <Link href={directoryUrl} className="underline font-semibold">Browse existing listings</Link> and check details directly.</div>}
    </section>

    <section className="mt-10 rounded-2xl bg-[#f6f3eb] border border-[#e8e3d7] p-6" aria-labelledby="pet-heading">
      <h2 id="pet-heading" className="text-xl font-bold text-[#19352d]">Lost or found a pet?</h2>
      <p className="mt-2 text-slate-700 text-sm">Browse dated reports for {city.name}, or submit a report for moderation. A past report does not confirm a pet is still missing.</p>
      <div className="flex flex-wrap gap-4 mt-4 text-sm font-semibold"><Link href={`/lost-and-found?city=${encodeURIComponent(city.name)}`} className="underline underline-offset-4">View local pet reports →</Link><Link href={`/submit?submission_type=lost_pet&city=${encodeURIComponent(city.name)}`} className="underline underline-offset-4">Report a lost or found pet →</Link></div>
    </section>

    <section className="mt-10" aria-labelledby="browse-heading">
      <h2 id="browse-heading" className="text-2xl font-bold text-slate-900">Browse the wider directory</h2>
      <p className="mt-2 text-sm text-slate-600">Older approved listings may still need a fresh information check.</p>
      <div className="flex flex-wrap gap-2 mt-4">{CATEGORIES.map(category => <Link key={category} href={`${directoryUrl}&category=${encodeURIComponent(category)}`} className="rounded-full px-4 py-2 border border-slate-300 bg-white text-sm text-slate-700 hover:border-[#19352d]">{category}</Link>)}</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">{((local.data ?? []) as CheckedBusiness[]).map(biz => <article key={biz.id} className="p-5 border border-slate-200 rounded-xl bg-white min-w-0"><h3 className="font-semibold break-words"><Link href={`/business/${biz.id}`} className="underline underline-offset-4">{biz.name}</Link></h3><p className="text-sm text-slate-600 mt-2">{biz.category} · {biz.city}</p><ListingEvidence check={biz.listing_checks} /></article>)}</div>
      <Link href={directoryUrl} className="inline-block mt-5 font-semibold text-[#19352d] underline underline-offset-4">Browse all {city.name} listings →</Link>
    </section>
    <footer className="mt-10 pt-6 border-t border-slate-200 text-sm text-slate-600"><Link href="/submit-business" className="underline">Suggest or add a business</Link><span className="mx-3">·</span><Link href="/discover" className="underline">Explore nearby cities</Link></footer>
  </div>
}
