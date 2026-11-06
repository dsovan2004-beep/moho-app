'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {useRequestAccount} from '@/app/components/RequestAccount'
import {PetReportControls,type OwnPetReport} from '@/app/components/PetStatusControls'
import {petActivity,socialDate} from '@/lib/pet-social'
export default function MyPetReports(){
 const {user,checking}=useRequestAccount(),[rows,setRows]=useState<OwnPetReport[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true),[refresh,setRefresh]=useState(0)
 useEffect(()=>{setRows([]);setError('');if(!user){setLoading(false);return}let active=true;setLoading(true)
  petActivity('my_reports').then(data=>{if(active)setRows(data as OwnPetReport[])}).catch(()=>{if(active)setError('Your reports could not load.')}).finally(()=>{if(active)setLoading(false)})
  return()=>{active=false}
 },[user?.id,refresh])
 return <div className="max-w-3xl mx-auto px-4 py-10"><h1 className="text-3xl font-bold text-[#19352d]">My pet reports</h1><p className="mt-3 text-slate-600">Manage reports linked to your account after moderation. Imported reports are not assigned to you automatically. Original submissions awaiting moderation may not appear yet.</p>
  {checking||loading?<p className="mt-6">Loading your reports…</p>:!user?<p className="mt-6"><Link className="underline" href="/login?next=%2Fmy-pet-reports">Sign in</Link> to manage your pet reports.</p>:<>
   {error&&<p role="alert" className="mt-5 text-red-800">{error} <button className="underline" onClick={()=>setRefresh(n=>n+1)}>Retry</button></p>}
   {!error&&!rows.length&&<p className="mt-6 rounded-xl border p-5 bg-white">No moderated reports linked to your account yet. <Link href="/submit?submission_type=lost_pet" className="underline">Submit a lost or found pet report</Link>.</p>}
   {rows.map(p=><article key={p.id} className="mt-6"><h2 className="text-xl font-bold break-words">{p.title||p.pet_name||'Pet report'}</h2><p className="text-sm text-slate-600 mt-2">{p.city} · Recorded status: {p.status} · Reported {socialDate(p.created_at)}</p>{!p.under_review&&p.status!=='archived'&&<Link href={`/lost-and-found/${p.id}`} className="underline text-sm inline-block mt-2">View public report</Link>}<PetReportControls key={`${p.id}:${p.status_revision}`} report={p} onSaved={()=>setRefresh(n=>n+1)}/></article>)}
   {rows.length===100&&<p className="mt-4 text-sm">Showing your 100 most recent reports. Contact support for older reports.</p>}
  </>}
 </div>
}
