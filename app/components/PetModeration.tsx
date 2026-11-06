'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {petAction,socialDate} from '@/lib/pet-social'
type Report={id:string;kind:'comment'|'message';pet_id:string;reason:string;evidence:string;created_at:string}
export default function PetModeration(){
 const [rows,setRows]=useState<Report[]>([]),[error,setError]=useState(''),[refresh,setRefresh]=useState(0),[busy,setBusy]=useState(false)
 useEffect(()=>{let active=true;petAction('moderation_queue',{}).then(data=>{if(active){setRows(data as unknown as Report[]);setError('')}}).catch(()=>{if(active)setError('Pet moderation queue could not load.')});return()=>{active=false}},[refresh])
 async function review(id:string,decision:string){setBusy(true);try{await petAction('review_report',{id,decision});setRefresh(n=>n+1)}catch{setError('Review could not be saved.')}finally{setBusy(false)}}
 return <section className="mb-8 rounded-xl border bg-white p-5"><h2 className="text-xl font-bold">Pet discussions & message reports</h2><p className="text-sm text-slate-600 mt-2">Only reported private message text is shown here. Other private conversation content is not available to this queue.</p>{error&&<p role="alert">{error} <button className="underline" onClick={()=>setRefresh(n=>n+1)}>Retry</button></p>}{!error&&!rows.length&&<p className="mt-4 text-sm">No pending pet discussion or message reports.</p>}{rows.map(r=><article key={r.id} className="mt-4 border rounded-lg p-4"><p className="text-sm font-semibold">{r.kind} · {socialDate(r.created_at)}</p><p className="mt-2 whitespace-pre-wrap break-words">{r.evidence}</p><p className="text-sm mt-2">Reason: {r.reason}</p><Link className="underline text-sm" href={`/lost-and-found/${r.pet_id}`}>Related report</Link><div className="flex gap-3 mt-3">{r.kind==='comment'&&<button disabled={busy} onClick={()=>void review(r.id,'hide')} className="min-h-11 border rounded-lg px-4">Hide public reply</button>}<button disabled={busy} onClick={()=>void review(r.id,'reviewed')} className="min-h-11 border rounded-lg px-4">Mark reviewed</button></div></article>)}</section>
}
