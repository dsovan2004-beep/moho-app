'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {petActivity,socialDate} from '@/lib/pet-social'
import {useRequestAccount} from './RequestAccount'
export type OwnPetReport={id:string;title:string;pet_name:string;city:string;status:string;status_revision:number;status_confirmed_at:string|null;created_at:string;under_review:boolean;expires_at:string;expired:boolean}
export function PetReportControls({report,onSaved}:{report:OwnPetReport;onSaved:(status?:string)=>void}){
 const [status,setStatus]=useState(report.status),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('')
 async function save(){
  if(busy)return;setBusy(true);setError('');setNotice('')
  try{await petActivity('report_status',{pet_id:report.id,status,revision:report.status_revision});setNotice(status==='archived'?'Report archived. Restore it here when needed.':'Status confirmed. Your report is renewed for 30 days.');onSaved(status)}
  catch(e){setError(e instanceof Error?e.message:'Status could not save.')}
  finally{setBusy(false)}
 }
 return <div className="border border-slate-200 rounded-xl p-4 mt-4 bg-white">
  <h3 className="font-semibold">Update your report</h3>
  <p className="text-sm text-slate-600 mt-2">Public reports expire after 30 days without confirmation. Choose the current status to renew for another 30 days, mark a reunion, or archive it. Archiving hides the public report; you can restore it here unless it is under moderation review.</p>
  {report.expires_at&&<p className="text-sm mt-2 font-medium">{report.expired?'Expired — confirm the current status to publish again.':`Public until ${socialDate(report.expires_at)}`}</p>}
  {report.status_confirmed_at&&<p className="text-xs mt-2">Last confirmed by you: {socialDate(report.status_confirmed_at)}</p>}
  {report.under_review?<p className="mt-3 text-sm">Under review. Status changes are paused until moderation is complete.</p>:<form className="flex flex-wrap gap-3 items-end mt-4" onSubmit={e=>{e.preventDefault();void save()}}>
   <label className="text-sm font-semibold">Current status<select value={status} onChange={e=>setStatus(e.target.value)} className="block border rounded-lg min-h-11 mt-1 px-3 bg-white">{!['lost','found','reunited','archived'].includes(status)&&<option value={status} disabled>Choose current status</option>}<option value="lost">Lost / still missing</option><option value="found">Found / seeking owner</option><option value="reunited">Reunited</option><option value="archived">Archived / hide report</option></select></label>
   <button disabled={busy||!['lost','found','reunited','archived'].includes(status)} className="min-h-11 rounded-lg bg-[#19352d] text-white px-4 py-2 font-semibold disabled:opacity-50">{busy?'Saving…':'Confirm status and renew 30 days'}</button>
  </form>}
  {error&&<p role="alert" className="text-red-800 text-sm mt-3">{error} <button className="underline" onClick={()=>onSaved()}>Refresh report</button></p>}
  {notice&&<p role="status" className="text-sm mt-3 text-green-800">{notice}</p>}
 </div>
}
export default function PetStatusControls({petId}:{petId:string}){
 const router=useRouter()
 const {user}=useRequestAccount(),[own,setOwn]=useState<OwnPetReport|null>(null),[refresh,setRefresh]=useState(0)
 useEffect(()=>{setOwn(null);if(!user)return;let active=true
  petActivity('my_reports').then((rows:OwnPetReport[])=>{if(active)setOwn(rows.find(p=>p.id===petId)??null)}).catch(()=>{})
  return()=>{active=false}
 },[user?.id,petId,refresh])
 return own?<><PetReportControls key={`${own.id}:${own.status_revision}`} report={own} onSaved={status=>{if(status==='archived')router.push('/my-pet-reports');else{setRefresh(n=>n+1);router.refresh()}}}/><Link className="inline-block underline text-sm mt-3" href="/my-pet-reports">Manage all your pet reports →</Link></>:null
}
