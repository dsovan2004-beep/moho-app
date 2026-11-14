"use client"
import React,{useId,useState} from 'react'

export default function BusinessSummary({description}:{description:string}) {
 const [expanded,setExpanded]=useState(false)
 const id=useId()
 return <div className="mb-3">
   <p id={id} className={`text-white/90 text-sm leading-relaxed break-words ${expanded?'':'line-clamp-2'}`}>{description}</p>
   <button type="button" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(value=>!value)} className="mt-1 min-h-11 rounded-md py-2 text-left text-sm font-semibold text-white underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">{expanded?'Show less':'Read full description'}</button>
 </div>
}
