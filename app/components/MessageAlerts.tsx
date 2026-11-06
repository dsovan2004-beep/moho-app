'use client'

import {createContext,useContext,useEffect,useRef,useState} from 'react'
import Link from 'next/link'
import DeliveryNotificationSettings from './DeliveryNotificationSettings'
import {useRequestAccount} from './RequestAccount'
import {petActivity} from '@/lib/pet-social'

type UnreadChat={id:string;pet_id:string;label:string;n:number;latest_at:string;latest_seq:number}
type Alerts={total:number;conversations:UnreadChat[];loaded:boolean;failed:boolean}
const empty:Alerts={total:0,conversations:[],loaded:false,failed:false}
const AlertContext=createContext<Alerts>(empty)
export const useMessageAlerts=()=>useContext(AlertContext)
export const refreshMessageAlerts=()=>window.dispatchEvent(new Event('moho-messages-read'))
export function MessageAlertProvider({children}:{children:React.ReactNode}){
 const {user}=useRequestAccount()
 const [state,setState]=useState<{userId:string;alerts:Alerts}>({userId:'',alerts:empty})
 const prior=useRef<number|null>(null)
 useEffect(()=>{
  setState({userId:'',alerts:empty});prior.current=null
  if(!user)return
  let active=true,running=false
  const uid=user.id
  async function load(){
   if(running||document.visibilityState!=='visible')return
   running=true
   try{
    const data=await petActivity('alerts') as Alerts
    if(!active)return
    setState({userId:uid,alerts:{...data,loaded:true,failed:false}})
    const latest=Math.max(0,...data.conversations.map(c=>c.latest_seq))
    prior.current=latest> (prior.current??0)?latest:prior.current??latest
   }catch{if(active)setState(previous=>({userId:uid,alerts:{...(previous.userId===uid?previous.alerts:empty),failed:true}}))}
   finally{running=false}
  }
  void load()
  const timer=setInterval(()=>void load(),15000)
  const refresh=()=>void load()
  document.addEventListener('visibilitychange',refresh)
  window.addEventListener('moho-messages-read',refresh)
  return()=>{active=false;clearInterval(timer);document.removeEventListener('visibilitychange',refresh);window.removeEventListener('moho-messages-read',refresh)}
 },[user?.id])
 return <AlertContext.Provider value={state.userId===user?.id?state.alerts:empty}>{children}</AlertContext.Provider>
}
export function MessageBadge(){
 const {total}=useMessageAlerts()
 return total>0?<span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-slate-900" aria-label={`${total} unread messages`}>{total>99?'99+':total}</span>:null
}
export function MessageNotificationSettings(){
 const {user}=useRequestAccount(),{total,loaded,failed}=useMessageAlerts()
 return <section className="rounded-xl border border-slate-200 bg-white p-4 mt-5" aria-label="Message notifications">
  <p className="font-semibold" role="status">{failed?'Unread status could not refresh':!loaded?'Checking unread messages…':total?`${total} unread message${total===1?'':'s'}`:'You’re caught up'}</p>
  {failed&&<button className="underline text-sm min-h-11" onClick={refreshMessageAlerts}>Retry unread status</button>}
  <p className="text-sm text-slate-600 mt-2">Unread badges update while MoHoLocal is visible. Read status is saved to your account.</p>
  <details className="mt-3"><summary className="min-h-11 cursor-pointer py-3 font-semibold text-sm">Notification preferences</summary><DeliveryNotificationSettings key={user?.id??'guest'}/></details>
 </section>
}
export function MessageAlertSummary(){
 const {total}=useMessageAlerts()
 return total>0?<div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm" role="status"><Link href="/messages" className="font-semibold underline">{total} unread private message{total===1?'':'s'} — open inbox</Link></div>:null
}
