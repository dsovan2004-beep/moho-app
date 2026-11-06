import { latestCheck } from '@/lib/business-discovery'
import { checkDate, type ListingCheck } from '@/lib/listing-evidence'

export default function ListingEvidence({ check: incoming }: { check?: ListingCheck | ListingCheck[] | null }) {
  const check = latestCheck(incoming)
  if (!check) return <p className="mt-3 text-xs text-slate-500">Current contact and service details have not been independently rechecked.</p>
  return <div className="mt-3 rounded-xl bg-[#f0f4ec] border border-[#dce5d5] p-3 text-sm text-slate-700">
    <p className="font-semibold">Website information checked · {checkDate(check.checked_at)}</p>
    {check.service_areas.length > 0 && <p className="mt-1">Serves {check.service_areas.join(' & ')}</p>}
    {check.service_tags.length > 0 && <p className="mt-1 text-xs">{check.service_tags.join(' · ')}</p>}
    <details className="mt-2 text-xs"><summary className="min-h-11 cursor-pointer content-center underline underline-offset-2">What was checked?</summary><p className="mt-2 leading-relaxed">{check.scope_note}</p><a href={check.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center mt-2 underline">Official source ↗</a></details>
  </div>
}
