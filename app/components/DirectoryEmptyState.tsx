import Link from 'next/link'
import { type DirectoryFilters } from '@/lib/directory-filters'
import { directoryRecovery } from '@/lib/directory-recovery'
import { serviceForCategory } from '@/lib/services'

export default function DirectoryEmptyState({filters}: {filters: DirectoryFilters}) {
  const service=serviceForCategory(filters.service,filters.category)
  const actions=directoryRecovery(filters)
  return <section aria-labelledby="directory-empty-heading" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
    <p aria-hidden="true" className="text-3xl">🔎</p>
    <h2 id="directory-empty-heading" className="mt-3 text-lg font-bold text-[#19352d]">{filters.query ? 'No matches for this search' : service ? 'No providers in this service shortlist yet' : 'No listings match these filters'}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{filters.city === 'All Cities' ? 'Try a broader service or another business name.' : filters.query || service || filters.category !== 'All' ? `You’re searching ${filters.city}. Broaden your search here before changing cities.` : 'Suggest a local business, or check other cities.'} An empty shortlist does not mean the service is unavailable locally.</p>
    <div className="mt-4 flex flex-col gap-2 sm:items-start">
      {actions.map((action,index)=><Link key={action.href} href={action.href} className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 py-3 text-center text-sm font-semibold sm:w-auto focus-visible:ring-2 focus-visible:ring-[#19352d] ${index === 0 ? 'border-[#19352d] bg-[#19352d] text-white' : 'border-slate-300 text-[#19352d]'}`}>{action.label}</Link>)}
    </div>
    {filters.city !== 'All Cities' && <p className="mt-3 text-xs leading-5 text-slate-600">Other-city results may not serve your address. Confirm coverage with the business.</p>}
    <Link href="/suggest-business" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#19352d] underline underline-offset-4">Know a missing business? Suggest it</Link>
  </section>
}
