'use client'
import {useEffect,useState} from 'react'
import {useSearchParams} from 'next/navigation'
import Link from 'next/link'
import {getSupabaseClient} from '@/lib/supabase'
import {UUID} from '@/lib/directory-requests'
import {petAction,petActivity,socialDate} from '@/lib/pet-social'
import {MessageNotificationSettings,useMessageAlerts,refreshMessageAlerts} from '@/app/components/MessageAlerts'
import {useRequestAccount} from '@/app/components/RequestAccount'
type Chat={id:string;pet_id:string;member_a:string;member_b:string;label_a:string;label_b:string;updated_at:string}
type Message={delivery_seq:number;id:string;sender_id:string;body:string;created_at:string}
const button='min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50'
export default function MessagesPage(){
 const params=useSearchParams(),{user,checking}=useRequestAccount()
 const [chats,setChats]=useState<Chat[]>([]),[selected,setSelected]=useState(''),[messages,setMessages]=useState<Message[]>([]),[blocked,setBlocked]=useState(false)
 const [body,setBody]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[refresh,setRefresh]=useState(0),[limit,setLimit]=useState(100),[chatLimit,setChatLimit]=useState(50)
 const alerts=useMessageAlerts()
 const [report,setReport]=useState<string|null>(null),[reason,setReason]=useState('')
 useEffect(()=>{setChats([]);setMessages([]);setSelected('');setBody('');setReport(null);setError('');setNotice('')},[user?.id])
 useEffect(()=>{
  if(!user)return;let active=true
  async function load(){
   const {data,error}=await getSupabaseClient().from('pet_conversations').select('*').order('updated_at',{ascending:false}).limit(chatLimit)
   if(!active)return
   if(error){setError('Messages could not load. Please retry.');return}
   const rows=(data??[]) as Chat[];setChats(rows)
   const requested=params.get('conversation')
   setSelected(previous=>previous&&rows.some(c=>c.id===previous)?previous:requested&&UUID.test(requested)&&rows.some(c=>c.id===requested)?requested:rows[0]?.id??'')
  }
  void load();const timer=setInterval(()=>{if(document.visibilityState==='visible')void load()},15000)
  return()=>{active=false;clearInterval(timer)}
 },[user?.id,refresh,chatLimit,params])
 useEffect(()=>{
  setMessages([]);setBlocked(false);setBody('');setReport(null);setLimit(100)
 },[selected])
 useEffect(()=>{
  if(!user||!selected)return;let active=true
  const chat=chats.find(c=>c.id===selected);if(!chat)return
  const other=chat.member_a===user.id?chat.member_b:chat.member_a
  async function load(){
   const [msg,block]=await Promise.all([
    getSupabaseClient().from('pet_messages').select('id,sender_id,body,created_at,delivery_seq').eq('conversation_id',selected).order('delivery_seq',{ascending:false}).limit(limit),
    getSupabaseClient().from('pet_message_blocks').select('blocked_id').eq('blocked_id',other).limit(1),
   ])
   if(!active)return
   if(msg.error||block.error){setError('This conversation could not load. Please retry.');return}
   const rows=((msg.data??[]) as Message[]).reverse()
   setMessages(rows);setBlocked(Boolean(block.data?.length))
   if(rows.length&&document.visibilityState==='visible'){
    try{await petActivity('mark_read',{conversation_id:selected,last_message_id:rows[rows.length-1].id});if(active)refreshMessageAlerts()}catch{if(active)setError('Messages loaded, but read status could not save. Retry loading.')}
   }
  }
  void load();const timer=setInterval(()=>{if(document.visibilityState==='visible')void load()},10000)
  return()=>{active=false;clearInterval(timer)}
 },[user?.id,selected,refresh,limit,chats.some(c=>c.id===selected)])
 async function act(work:()=>Promise<void>){if(busy)return;setBusy(true);setError('');setNotice('');try{await work();setRefresh(n=>n+1)}catch(e){setError(e instanceof Error?e.message:'Action unavailable')}finally{setBusy(false)}}
 const current=chats.find(c=>c.id===selected),otherName=current?(current.member_a===user?.id?current.label_b:current.label_a):''
 return <div className="max-w-6xl mx-auto px-4 py-10"><h1 className="text-3xl font-bold text-[#19352d]">Private messages</h1><p className="mt-3 text-sm text-slate-600 max-w-3xl">Conversations start from a pet report or one of its discussion replies. Only participants can read them. Reporting a message sends that message to moderators. Not end-to-end encrypted. Your unread badge follows you across devices. Open notification preferences below for optional email and device push alerts.</p>
  {checking?<p className="mt-6">Checking your account…</p>:!user?<p className="mt-6"><Link href="/login?next=%2Fmessages" className="underline font-semibold">Sign in</Link> to read your private messages.</p>:<>
   <MessageNotificationSettings/>
   {error&&<p role="alert" className="mt-5 rounded-lg bg-red-50 text-red-800 p-4">{error} <button className="underline" onClick={()=>setRefresh(n=>n+1)}>Retry loading</button></p>}{notice&&<p role="status" className="mt-4 p-3 bg-green-50 rounded-lg">{notice}</p>}
   <div className="grid md:grid-cols-[260px_minmax(0,1fr)] gap-5 mt-6"><aside aria-label="Conversations" className="space-y-2">{chats.map(c=><button key={c.id} onClick={()=>setSelected(c.id)} aria-pressed={selected===c.id} className={`block w-full text-left border rounded-xl p-4 ${selected===c.id?'border-[#19352d] bg-[#f0f4ec]':'bg-white border-slate-200'}`}><span className="block font-semibold break-words">{c.member_a===user.id?c.label_b:c.label_a}{Boolean(alerts.conversations.find(a=>a.id===c.id))&&<span className="ml-2 rounded bg-amber-100 px-2 text-xs">{alerts.conversations.find(a=>a.id===c.id)?.n} unread</span>}</span><time className="text-xs text-slate-500">{socialDate(c.updated_at)}</time></button>)}{chats.length>=chatLimit&&<button className={button} onClick={()=>setChatLimit(n=>n+50)}>More conversations</button>}{!chats.length&&!error&&<p className="rounded-xl border p-5 text-sm text-slate-600">No conversations yet. Open a <Link href="/lost-and-found" className="underline">pet report</Link> to message its reporter or a discussion participant.</p>}</aside>
   {current&&<section className="min-w-0 rounded-2xl bg-white border border-slate-200 p-4 sm:p-6" aria-label="Selected conversation">
    <div className="flex flex-wrap gap-3 items-center justify-between"><h2 className="text-xl font-bold break-words">{otherName}</h2><Link className="text-sm underline" href={`/lost-and-found/${current.pet_id}`}>Related pet report →</Link></div>
    <button disabled={busy} className={`${button} mt-4`} onClick={()=>void act(async()=>{await petAction('block',{conversation_id:current.id,blocked:!blocked});setBlocked(!blocked);setNotice(blocked?'Messages unblocked.':'Messages from this person are blocked. Existing history remains visible.')})}>{blocked?'Unblock messages from this person':'Block messages from this person'}</button>
    {messages.length>=limit&&<button className={`${button} mt-4 ml-2`} onClick={()=>setLimit(n=>n+100)}>Load older messages</button>}
    <div className="space-y-3 mt-5" aria-live="polite">{messages.map(m=><article key={m.id} className={`rounded-xl p-4 ${m.sender_id===user.id?'bg-[#f0f4ec]':'bg-slate-100'}`}><p className="text-xs font-semibold">{m.sender_id===user.id?'You':otherName}</p><p className="mt-2 whitespace-pre-wrap break-words">{m.body}</p><time className="text-xs text-slate-500 block mt-2">{socialDate(m.created_at)}</time><button className="underline min-h-11 text-xs" onClick={()=>{setReport(m.id);setReason('')}}>Report message</button>
     {report===m.id&&<form onSubmit={e=>{e.preventDefault();void act(async()=>{await petAction('report_message',{id:m.id,reason});setReport(null);setNotice('This message was sent to moderation with your reason. You can also block this person.')})}}><label htmlFor={`message-report-${m.id}`} className="block font-semibold text-sm">Reason (shared with moderators)</label><textarea id={`message-report-${m.id}`} minLength={5} maxLength={1000} required value={reason} onChange={e=>setReason(e.target.value)} className="w-full border rounded-lg p-3 mt-2"/><button disabled={busy} className={button}>Send report</button> <button type="button" className={button} onClick={()=>setReport(null)}>Cancel</button></form>}
    </article>)}</div>
    <form className="mt-6" onSubmit={e=>{e.preventDefault();void act(async()=>{await petAction('message',{conversation_id:current.id,body});setBody('');setNotice('Message sent.')})}}><label htmlFor="message-body" className="block font-semibold">Private reply</label><textarea id="message-body" maxLength={3000} required disabled={blocked} value={body} onChange={e=>setBody(e.target.value)} rows={3} className="w-full border rounded-lg mt-2 p-3"/><button disabled={busy||blocked||!body.trim()} className={`${button} bg-[#19352d] text-white mt-2`}>Send private reply</button>{blocked&&<p className="text-sm mt-2">Unblock this person to send new messages.</p>}</form>
   </section>}
   </div>
  </>}
 </div>
}
