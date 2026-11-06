import {petProgressLabel} from '@/lib/pet-progress'
import {socialDate} from '@/lib/pet-social'
export type ProgressUpdate={status:string;progress?:string|null;observed_at?:string|null;confirmed_at:string;revision:number}
export function PetProgressSummary({progress,status,observedAt}:{progress?:string|null;status:string;observedAt?:string|null}){
 return <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-950"><p className="font-semibold">{petProgressLabel(progress,status)}</p>{progress&&progress!=='unknown'&&observedAt&&<p className="mt-1">Observed {socialDate(observedAt)} Pacific</p>}<p className="mt-1 text-xs">Reporter information; sightings do not confirm an owner or a match.</p></div>
}
export function PetProgressTimeline({updates,error}:{updates:ProgressUpdate[];error?:boolean}){
 return <section className="mt-6 rounded-xl border bg-white p-5" aria-labelledby="pet-progress-heading"><h2 id="pet-progress-heading" className="text-lg font-bold">Reporter updates</h2><p className="mt-2 text-sm text-slate-600">Newest first. Times below are Pacific. Other neighbors can share possible sightings in the discussion; only the reporter confirms this report’s progress.</p>
 {error?<p role="alert" className="mt-3 text-sm text-red-800">Update history could not load. Refresh this page to retry.</p>:!updates.length?<p className="mt-3 text-sm">No reporter updates recorded yet. Check the original report for more information.</p>:<ol className="mt-4 space-y-4">{updates.map(u=><li key={u.revision} className="border-l-2 border-teal-200 pl-4"><p className="font-semibold">{u.status==='lost'?'Still missing':u.status==='found'?'Found / seeking owner':'Reunited'} · {petProgressLabel(u.progress,u.status)}</p>{u.observed_at&&<p className="mt-1 text-sm">Observed {socialDate(u.observed_at)}</p>}<p className="mt-1 text-xs text-slate-600">Reporter confirmed {socialDate(u.confirmed_at)}</p></li>)}</ol>}
 <p className="mt-3 text-xs text-slate-500">Up to 20 recent updates. Reporter updates are not independently verified.</p></section>
}
