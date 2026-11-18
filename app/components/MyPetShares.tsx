'use client'
import {useCallback,useEffect,useRef,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import PetShareStatus,{type SharedPetRequest} from './PetShareStatus'

export default function MyPetShares({userId,refresh}:{userId:string;refresh:string}) {
 const [rows,setRows]=useState<SharedPetRequest[]>([])
 const [loading,setLoading]=useState(true)
 const [loaded,setLoaded]=useState(false)
 const [error,setError]=useState('')
 const [notice,setNotice]=useState('')
 const [confirmId,setConfirmId]=useState<string|null>(null)
 const [withdrawing,setWithdrawing]=useState<string|null>(null)
 const generation=useRef(0)
 const confirmButton=useRef<HTMLButtonElement>(null)
 const withdrawalButtons=useRef(new Map<string,HTMLButtonElement>())
 const lastConfirmedId=useRef<string|null>(null)
 const load=useCallback(async()=>{
  const request=++generation.current
  setLoading(true);setError('')
  try {
   const {data,error:readError}=await getSupabaseClient().from('pet_report_shares')
    .select('id,title,review_status,published_report_id').eq('submitted_by',userId)
    .order('created_at',{ascending:false}).limit(20)
   if(generation.current!==request)return false
   if(readError)throw readError
   setRows(data??[]);setLoaded(true);return true
  } catch {
   if(generation.current===request)setError('We could not refresh your reports. Any cards below may be out of date. Refresh before taking another action.')
   return false
  } finally {if(generation.current===request)setLoading(false)}
 },[userId])
 useEffect(()=>{void load();return()=>{generation.current++}},[load,refresh])
 useEffect(()=>{
  if(confirmId){lastConfirmedId.current=confirmId;confirmButton.current?.focus()}
  else if(lastConfirmedId.current){withdrawalButtons.current.get(lastConfirmedId.current)?.focus();lastConfirmedId.current=null}
 },[confirmId])
 async function withdraw(id:string) {
  if(withdrawing||confirmId!==id)return
  setWithdrawing(id);setNotice('');setError('')
  try {
   const {error:writeError}=await getSupabaseClient().rpc('withdraw_pet_share',{sid:id})
   if(writeError)throw writeError
   setConfirmId(null)
   if(await load())setNotice('Withdrawal saved. This does not change your Facebook post.')
  } catch {
   setConfirmId(null)
   setError('We could not confirm withdrawal. Your report may still be visible. Refresh its status before retrying.')
  } finally {setWithdrawing(null)}
 }
 const action='min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:opacity-50'
 return <section id="your-shared-reports" tabIndex={-1} aria-labelledby="your-shared-reports-heading" className="mt-8 scroll-mt-48 rounded-lg border-t pt-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700">
  <h2 id="your-shared-reports-heading" className="font-bold text-xl">Your shared reports</h2>
  <a href="#pet-share-start" className="mt-2 inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-semibold underline focus-visible:ring-2 focus-visible:ring-emerald-700">Back to report form ↑</a>
  <p className="text-sm mt-2">Your latest 20 requests. Withdraw publication permission here to hide the MoHoLocal report and photos. This does not change your Facebook post.</p>
  <button type="button" disabled={loading||!!withdrawing} onClick={()=>{setConfirmId(null);void load()}} className={`${action} mt-3`}>{loading?'Refreshing reports…':'Refresh report status'}</button>
  {loading&&<p role="status" className="mt-3 text-sm">Loading your latest report status…</p>}
  {notice&&<p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm">{notice}</p>}
  {error&&<p role="alert" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">{error}</p>}
  {loaded&&!loading&&!error&&rows.length===0&&<p className="mt-3 text-sm text-slate-600">No shared-report requests yet. When you submit one, its reference and review status appear here.</p>}
  <div aria-busy={loading}>{rows.map(s=><article key={s.id} className="mt-3 border rounded-xl p-4">
   <PetShareStatus request={s}/>
   {['pending','approved'].includes(s.review_status)&&(confirmId===s.id?<div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3">
    <p className="font-semibold">Withdraw this report and photo permission?</p><p className="mt-2 text-sm">The MoHoLocal report and photos will be hidden. You can leave them as they are by choosing Keep report.</p>
    <div className="mt-3 flex flex-col gap-2 sm:flex-row"><button ref={confirmButton} type="button" disabled={!!withdrawing||loading||!!error} onClick={()=>void withdraw(s.id)} className={`${action} bg-white`}>{withdrawing===s.id?'Withdrawing…':'Confirm withdrawal'}</button><button type="button" disabled={!!withdrawing} onClick={()=>setConfirmId(null)} className={action}>Keep report</button></div>
   </div>:<button ref={node=>{if(node)withdrawalButtons.current.set(s.id,node);else withdrawalButtons.current.delete(s.id)}} type="button" disabled={loading||!!withdrawing||!!error} onClick={()=>{setNotice('');setConfirmId(s.id)}} className={`${action} mt-3 w-full sm:w-auto`}>Withdraw report and photo permission</button>)}
  </article>)}</div>
 </section>
}
