'use client'
import React,{useId,useRef,useState} from 'react'
import {UUID} from '@/lib/directory-requests'
import {copyShareText} from '@/lib/share-links'

export default function PetRequestReference({reference,unconfirmed=false}:{reference:string;unconfirmed?:boolean}){
 if(!UUID.test(reference))return null
 return <ReferenceControl key={`${reference}:${unconfirmed}`} reference={reference} unconfirmed={unconfirmed}/>
}
function ReferenceControl({reference,unconfirmed}:{reference:string;unconfirmed:boolean}){
 const id=useId();const field=useRef<HTMLInputElement>(null);const pending=useRef(false)
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [manual,setManual]=useState(false)
 async function copy(){
  if(pending.current)return
  pending.current=true;setBusy(true);setManual(false);setMessage('Copying reference…')
  let copied=false
  try{copied=await copyShareText(reference,navigator.clipboard)}catch{/* Restricted clipboard access uses manual selection. */}
  setMessage(copied?(unconfirmed?'Recovery ID copied. This is not a confirmed receipt.':'Request reference copied.'):'Could not copy automatically. Choose Select reference, then use your device’s Copy action.')
  setManual(!copied);pending.current=false;setBusy(false)
 }
 return <div className="mt-3 min-w-0">
  <label htmlFor={id} className="block text-sm font-semibold">{unconfirmed?'Recovery request ID · receipt not yet confirmed':'Request reference'}</label>
  <input ref={field} id={id} readOnly value={reference} aria-describedby={`${id}-help ${id}-status`} onFocus={event=>event.currentTarget.select()} className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-base text-slate-900"/>
  <p id={`${id}-help`} className="mt-2 text-xs text-slate-600">Keep this ID for your records. It is not a public report link.</p>
  <div className="mt-2 flex flex-wrap gap-2" aria-busy={busy}>
   <button type="button" disabled={busy} onClick={()=>void copy()} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-700">{busy?'Copying…':'Copy request reference'}</button>
   {manual&&<button type="button" onClick={()=>{field.current?.focus();field.current?.select()}} className="min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-emerald-700">Select reference</button>}
  </div>
  <p id={`${id}-status`} role="status" aria-atomic="true" className="mt-2 text-sm">{message}</p>
 </div>
}
