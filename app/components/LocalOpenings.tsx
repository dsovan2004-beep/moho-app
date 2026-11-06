import CardCityPhoto from './CardCityPhoto'
import { localOpeningsFor } from '@/lib/local-openings'

export default function LocalOpenings({city}: {city:string}) {
  const items = localOpeningsFor(city)
  if (!items.length) return null
  return <section aria-labelledby="local-openings-heading">
    <div className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-[#59715d]">Around your neighborhood</p><h2 id="local-openings-heading" className="mt-2 text-2xl sm:text-3xl font-bold text-[#18324f]">Local places & openings in {city}</h2><p className="mt-2 text-sm text-slate-600">Source-checked November 6, 2026. Confirm current hours with the business before visiting.</p></div>
    <div className={items.length > 1 ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "max-w-3xl"}>{items.map(item => <article key={item.id} className="min-w-0 rounded-2xl border border-[#dce5d5] bg-white overflow-hidden">
      <CardCityPhoto city={item.city} />
      <div className="p-5 sm:p-6">
      <p className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-900">{item.status}</p>
      <h3 className="mt-3 text-lg font-bold text-[#19352d]">{item.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.description}</p>
      <a href={item.source} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#19352d] underline underline-offset-4">{item.sourceLabel} ↗</a>
      {'details' in item && <a href={item.details} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center text-sm text-[#19352d] underline underline-offset-4">{item.detailsLabel} ↗</a>}
      </div>
    </article>)}</div>
  </section>
}
