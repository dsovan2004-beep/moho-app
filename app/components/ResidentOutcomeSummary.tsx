'use client'
import React,{useEffect,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import {outcomeReportTotal,parseOutcomeSummary,type OutcomeSummary} from '@/lib/outcome-summary'

export default function ResidentOutcomeSummary() {
  const [report,setReport]=useState<OutcomeSummary|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState(false)
  async function load() {
    setLoading(true);setError(false);setReport(null)
    try {
      const {data,error}=await getSupabaseClient().rpc('admin_resident_outcome_summary')
      const parsed=error?null:parseOutcomeSummary(data)
      if(!parsed) setError(true)
      else setReport(parsed)
    } catch {setError(true)} finally {setLoading(false)}
  }
  useEffect(()=>{void load()},[])
  return <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="outcome-summary-heading">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="outcome-summary-heading" className="text-lg font-bold text-[#19352d]">Resident outcome reports</h2>
      <button onClick={load} disabled={loading} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold disabled:opacity-50">Refresh outcomes</button>
    </div>
    <p className="mt-2 text-sm text-slate-600">Private operator view · past 30 Pacific calendar days. One voluntary choice per account per day. These are self-reports, not unique residents, provider inquiries, verified bookings or a conversion rate.</p>
    {loading && <p role="status" className="mt-4 text-sm">Loading outcome totals…</p>}
    {error && <p role="alert" className="mt-4 text-sm text-amber-800">Outcome totals are unavailable. Check admin access and try Refresh outcomes. No zero totals have been assumed.</p>}
    {report && <>
      <p className="mt-3 text-sm font-semibold">{report.start_day} through {report.end_day} · {outcomeReportTotal(report)} reported updates</p>
      {outcomeReportTotal(report)===0 && <p className="mt-2 text-sm text-slate-600">No resident updates were received in this reporting window. Real participation remains unvalidated.</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{report.cities.map(row=><article key={row.city} className="rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold text-[#19352d]">{row.city}</h3>
        <dl className="mt-3 space-y-2 text-sm">{[['Reached a provider',row.reached_provider],['Could not reach',row.could_not_reach],['Found help',row.found_help]].map(([label,n])=><div key={label} className="flex items-start justify-between gap-3"><dt>{label}</dt><dd className="font-bold tabular-nums">{n}</dd></div>)}</dl>
      </article>)}</div>
    </>}
  </section>
}
