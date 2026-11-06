'use client'

import {createContext,useContext,useEffect,useRef,useState} from 'react'
import Link from 'next/link'
import {useRequestAccount} from './RequestAccount'
import {petActivity} from '@/lib/pet-social'

type UnreadChat={id:string;pet_id:string;label:string;n:number;latest_at:string;latest_seq:number}
type Alerts={total:number;conversations:UnreadChat[];loaded:boolean;failed:boolean}
const empty:Alerts={total:0,conversations:[],loaded:false,failed:false}
const AlertContext=createContext<Alerts>(empty)
export const useMessageAlerts=()=>useContext(AlertContext)
export const refreshMessageAlerts=()=>window.dispatchEvent(new Event('moho-messages-read'))
const preference=(id:string)=>`moho-dm-browser-alerts:${id}`
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
    // Initial load shows badges but never replays old messages as browser alerts.
    if(latest&&prior.current!==null&&latest>prior.current&&typeof Notification!=='undefined'&&Notification.permission==='granted'){
     try{
      const key=`moho-dm-alert-watermark:${uid}`
      if(localStorage.getItem(preference(uid))==='on'&&latest>Number(localStorage.getItem(key)??0)){
       localStorage.setItem(key,String(latest))
       const alert=new Notification('New MoHoLocal message',{body:'Open your private inbox to read it.',tag:'moholocal-private-message'})
       alert.onclick=()=>{window.focus();window.location.assign('/messages');alert.close()}
      }
     }catch{/* Browser alerts are optional; inbox badges remain available. */}
    }
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
 const [enabled,setEnabled]=useState(false),[supported,setSupported]=useState(false),[notice,setNotice]=useState('')
 useEffect(()=>{
  setNotice('');setSupported(typeof Notification!=='undefined')
  try{setEnabled(Boolean(user&&typeof Notification!=='undefined'&&Notification.permission==='granted'&&localStorage.getItem(preference(user.id))==='on'))}catch{setEnabled(false)}
 },[user?.id])
 async function toggle(){
  if(!user)return
  try{
   if(enabled){localStorage.removeItem(preference(user.id));setEnabled(false);setNotice('Browser alerts turned off on this device.');return}
   const permission=await Notification.requestPermission()
   if(permission!=='granted'){setNotice('Browser alerts are unavailable or blocked. Your unread inbox alerts still work.');return}
   localStorage.setItem(preference(user.id),'on');setEnabled(true);setNotice('Browser alerts enabled while MoHoLocal is open and visible on this device.')
  }catch{setNotice('This browser could not enable alerts. Your unread inbox alerts still work.')}
 }
 return <section className="rounded-xl border border-slate-200 bg-white p-4 mt-5" aria-label="Message notifications">
  <p className="font-semibold" role="status">{failed?'Unread status could not refresh':!loaded?'Checking unread messages…':total?`${total} unread message${total===1?'':'s'}`:'You’re caught up'}</p>
  {failed&&<button className="underline text-sm min-h-11" onClick={refreshMessageAlerts}>Retry unread status</button>}
  <p className="text-sm text-slate-600 mt-2">Unread badges update while MoHoLocal is visible. Read status is saved to your account. Optional browser alerts contain no sender name or message text. Closed-app push and email alerts are not enabled.</p>
  {supported&&user&&<button type="button" className="min-h-11 border rounded-lg px-4 py-2 mt-3 text-sm font-semibold" onClick={()=>void toggle()}>{enabled?'Turn off browser alerts':'Enable browser alerts on this device'}</button>}
  {!supported&&<p className="text-sm mt-2">This browser does not support desktop alerts. Use the unread badges here.</p>}
  {notice&&<p className="text-sm mt-2" role="status">{notice}</p>}
 </section>
}
export function MessageAlertSummary(){
 const {total}=useMessageAlerts()
 return total>0?<div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm" role="status"><Link href="/messages" className="font-semibold underline">{total} unread private message{total===1?'':'s'} — open inbox</Link></div>:null
}
