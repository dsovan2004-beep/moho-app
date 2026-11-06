'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {getSupabaseClient} from '@/lib/supabase'
import {petAction,socialDate} from '@/lib/pet-social'
import {useRequestAccount} from './RequestAccount'
type Comment={id:string;display_name:string;body:string;created_at:string}
const button='min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50'
export default function PetDiscussion({petId}:{petId:string}){
 const {user,checking}=useRequestAccount();const router=useRouter()
 const [comments,setComments]=useState<Comment[]>([]),[own,setOwn]=useState<string[]>([]),[canReporter,setCanReporter]=useState(false)
 const [name,setName]=useState('Neighbor'),[body,setBody]=useState(''),[limit,setLimit]=useState(100),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false)
 const [chat,setChat]=useState<{commentId?:string;label:string}|null>(null),[message,setMessage]=useState(''),[report,setReport]=useState<string|null>(null),[reason,setReason]=useState('')
 const [refresh,setRefresh]=useState(0)
 useEffect(()=>{
  let active=true;setOwn([]);setCanReporter(false)
  getSupabaseClient().from('pet_comments').select('id,display_name,body,created_at').eq('pet_id',petId).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(limit).then(({data,error})=>{if(active){if(error)setError('Discussion could not load. Please retry.');else{setComments((data??[]).reverse());setError('')}}})
  if(user)petAction('context',{pet_id:petId}).then(data=>{if(active){setOwn((data.own_comment_ids??[]) as string[]);setCanReporter(data.can_message_reporter===true)}}).catch(()=>{})
  return()=>{active=false}
 },[petId,user?.id,limit,refresh])
 useEffect(()=>{setChat(null);setMessage('');setBody('');setReport(null);setNotice('')},[user?.id])
 async function act(work:()=>Promise<void>){if(busy)return;setBusy(true);setError('');setNotice('');try{await work();setRefresh(x=>x+1)}catch(e){setError(e instanceof Error?e.message:'Action unavailable')}finally{setBusy(false)}}
 return <section className="mt-8 border-t border-slate-200 pt-8" aria-labelledby="pet-discussion">
  <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="pet-discussion" className="text-2xl font-bold">Discussion & sightings</h2><Link href="/messages" className="underline font-semibold text-sm">Private messages →</Link></div>
  <p className="mt-3 text-sm text-slate-600">Replies here are public. Keep phone numbers and exact home addresses private. Use Message for details, and confirm sightings before resharing.</p>
  {error&&<p role="alert" className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg">{error} <button className="underline" onClick={()=>setRefresh(x=>x+1)}>Retry loading</button></p>}
  {notice&&<p role="status" className="mt-4 p-3 bg-green-50 rounded-lg">{notice}</p>}
  {!user&&!checking&&<p className="my-5 rounded-xl bg-slate-100 p-4"><Link href={`/login?next=${encodeURIComponent(`/lost-and-found/${petId}`)}`} className="underline font-semibold">Sign in</Link> to join this discussion or send a private message.</p>}
  {user&&<>
   <label className="block mt-5 text-sm font-semibold" htmlFor="pet-display-name">Public display name</label><input id="pet-display-name" maxLength={40} minLength={2} value={name} onChange={e=>setName(e.target.value)} className="mt-2 border rounded-lg p-3 w-full max-w-sm"/>
   <form className="mt-4" onSubmit={e=>{e.preventDefault();void act(async()=>{await petAction('comment',{pet_id:petId,body,display_name:name});setBody('');setNotice('Reply posted publicly.')})}}>
    <label htmlFor="pet-reply" className="block font-semibold">Add a sighting or update</label><textarea id="pet-reply" maxLength={2000} required value={body} onChange={e=>setBody(e.target.value)} className="border rounded-lg p-3 w-full mt-2" rows={3}/>
    <button disabled={busy||!body.trim()||name.trim().length<2} className={`${button} bg-[#19352d] text-white`}>Post public reply</button>
   </form>
   <div className="mt-5">{canReporter?<button className={button} onClick={()=>{setChat({label:'reporter'});setMessage('')}}>Message reporter privately</button>:<p className="text-sm text-slate-600">Direct reporter messaging is available when this report is linked to its signed-in reporter. For imported reports, use the original-report contact. You can message signed-in discussion participants below.</p>}</div>
  </>}
  <div className="mt-6 space-y-4">{comments.map(c=><article key={c.id} className="rounded-xl border border-slate-200 p-4 bg-white">
   <div className="flex flex-wrap gap-2 items-baseline"><h3 className="font-semibold break-words">{c.display_name}</h3><time className="text-xs text-slate-500" dateTime={c.created_at}>{socialDate(c.created_at)}</time></div>
   <p className="mt-3 whitespace-pre-wrap break-words">{c.body}</p>
   {user&&<div className="flex flex-wrap gap-2 mt-3">{!own.includes(c.id)&&<button className={button} onClick={()=>{setChat({commentId:c.id,label:c.display_name});setMessage('')}}>Message privately</button>}{own.includes(c.id)&&<button disabled={busy} className={button} onClick={()=>void act(async()=>{await petAction('hide_own_comment',{id:c.id});setNotice('Your reply is hidden.')})}>Hide my reply</button>}<button className={button} onClick={()=>{setReport(c.id);setReason('')}}>Report</button></div>}
   {report===c.id&&<form className="mt-3" onSubmit={e=>{e.preventDefault();void act(async()=>{await petAction('report_comment',{id:c.id,reason});setReport(null);setNotice('Report saved for moderation.')})}}><label className="block text-sm font-semibold" htmlFor={`report-${c.id}`}>Reason for report (private)</label><textarea id={`report-${c.id}`} required minLength={5} maxLength={1000} value={reason} onChange={e=>setReason(e.target.value)} className="w-full border rounded-lg p-3 mt-2"/><button disabled={busy} className={button}>Send report</button> <button type="button" className={button} onClick={()=>setReport(null)}>Cancel</button></form>}
  </article>)}</div>
  {!comments.length&&!error&&<p className="mt-6 p-5 rounded-xl bg-slate-100 text-slate-600">No replies yet. Share a useful sighting or question to start the discussion.</p>}
  {comments.length>=limit&&<button className={`${button} mt-4`} onClick={()=>setLimit(n=>n+100)}>Load older replies</button>}
  {chat&&<form className="mt-6 rounded-xl border-2 border-[#19352d] p-5 bg-white" onSubmit={e=>{e.preventDefault();void act(async()=>{const data=await petAction('start_chat',{pet_id:petId,comment_id:chat.commentId,body:message,display_name:name});router.push(`/messages?conversation=${encodeURIComponent(String(data.conversation_id))}`)})}}>
   <h3 className="text-lg font-bold">Private message to {chat.label}</h3><p className="text-sm text-slate-600 mt-2">Only conversation participants can read it. A participant can report a message to moderators. Messages are not end-to-end encrypted.</p><label htmlFor="first-pet-message" className="block font-semibold mt-3">Message</label><textarea id="first-pet-message" required maxLength={3000} rows={3} value={message} onChange={e=>setMessage(e.target.value)} className="w-full border rounded-lg p-3 mt-2"/>
   <button disabled={busy||!message.trim()||name.trim().length<2} className={`${button} bg-[#19352d] text-white`}>Send private message</button> <button type="button" className={button} onClick={()=>setChat(null)}>Cancel</button>
  </form>}
 </section>
}
