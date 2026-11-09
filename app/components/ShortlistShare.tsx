'use client'
import { useEffect, useRef, useState } from 'react'
import { shortlistShare } from '@/lib/shortlist-share'
import { useShareFeedback } from './useShareFeedback'

export default function ShortlistShare({city,service}: {city:string;service?:string}) {
  const share=shortlistShare(city,service)
  const feedback=useShareFeedback(share?.url ?? '')
  const linkField=useRef<HTMLInputElement>(null)
  const textField=useRef<HTMLTextAreaElement>(null)
  const [canShare,setCanShare]=useState(false)
  useEffect(()=>{setCanShare(typeof navigator.share === 'function')},[])
  if(!share)return null
  return <details className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
    <summary className="min-h-11 cursor-pointer font-semibold text-[#19352d] focus-visible:ring-2 focus-visible:ring-[#19352d]">{service ? 'Share this service shortlist' : 'Share this city directory'}</summary>
    <h2 className="mt-3 text-lg font-bold text-[#19352d]">{share.title}</h2>
    <p className="mt-2 text-sm text-slate-600">This link opens current listings. Search text, sort order and account details are left out. Nothing is posted automatically.</p>
    <label htmlFor="shortlist-share-url" className="mt-4 block text-sm font-semibold">Share link</label>
    <input ref={linkField} aria-describedby="shortlist-share-status" id="shortlist-share-url" readOnly value={share.url} onFocus={event=>event.currentTarget.select()} className="mt-2 w-full min-h-11 rounded-xl border border-slate-300 px-3 py-2 text-base sm:text-sm" />
    <div className="mt-3 flex flex-wrap gap-2" aria-busy={feedback.busy}>
      <button type="button" disabled={feedback.busy} onClick={()=>void feedback.copy(share.url,'link')} className="min-h-11 w-full sm:w-auto disabled:opacity-60 rounded-xl bg-[#19352d] px-4 py-2 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-emerald-700">{feedback.action === 'link' ? 'Copying…' : 'Copy link'}</button>
      <button type="button" disabled={feedback.busy} onClick={()=>void feedback.copy(share.text,'text')} className="min-h-11 w-full sm:w-auto disabled:opacity-60 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-emerald-700">{feedback.action === 'text' ? 'Copying…' : 'Copy suggested text'}</button>
      {canShare && <button type="button" disabled={feedback.busy} onClick={()=>void feedback.share({title:share.title,text:share.description,url:share.url})} className="min-h-11 w-full sm:w-auto disabled:opacity-60 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-emerald-700">Open device share menu</button>}
    </div>
    <p id="shortlist-share-status" role="status" aria-atomic="true" className="mt-3 min-h-5 text-sm text-slate-700"><span key={feedback.attempt}>{feedback.message}</span></p>
    {feedback.manual && <button type="button" onClick={()=>{const field=feedback.manual === 'text' ? textField.current : linkField.current;field?.focus();field?.select()}} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-emerald-700">Select {feedback.manual === 'text' ? 'text' : 'link'}</button>}
    <label htmlFor="shortlist-share-text" className="mt-4 block text-sm font-semibold">Suggested text — edit before posting</label>
    <textarea ref={textField} aria-describedby="shortlist-share-status" id="shortlist-share-text" readOnly value={share.text} onFocus={event=>event.currentTarget.select()} rows={6} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-base sm:text-sm" />
  </details>
}
