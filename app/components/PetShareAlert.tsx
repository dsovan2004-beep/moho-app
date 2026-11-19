'use client'
import {useEffect,useRef} from 'react'

export default function PetShareAlert({message,attempt,uncertain=false}:{message:string;attempt:number;uncertain?:boolean}){
 const alert=useRef<HTMLDivElement>(null)
 useEffect(()=>{alert.current?.focus()},[message,attempt])
 return <div ref={alert} tabIndex={-1} role="alert" className="scroll-mt-48 rounded-xl border border-amber-300 bg-amber-50 p-4 focus:outline focus:outline-2 focus:outline-amber-700">
  <h2 className="font-semibold">Request needs attention</h2>
  <p className="mt-2 break-words">{message}</p>
  {uncertain&&<p className="mt-2 text-sm">Avoid starting another request. Use Check saved request to recover this one.</p>}
 </div>
}
