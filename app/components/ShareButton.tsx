'use client'

import { useEffect, useRef, useState } from 'react'
import { businessShareUrl } from '@/lib/share-links'
import { useShareFeedback } from './useShareFeedback'

interface ShareButtonProps {
  businessName: string
  businessId: string
  city?: string
}

export default function ShareButton({ businessName, businessId, city }: ShareButtonProps) {
  const url = businessShareUrl(businessId,city)
  const feedback = useShareFeedback(url ?? '')
  const linkField = useRef<HTMLInputElement>(null)
  const [canShare,setCanShare] = useState(false)
  useEffect(()=>{setCanShare(typeof navigator.share === 'function')},[])
  if (!url) return null
  const inputId=`business-share-${businessId}`
  return <details className="min-w-0 w-full rounded-xl border border-white/30 bg-white/10 p-3 text-white sm:max-w-sm">
    <summary className="min-h-11 cursor-pointer text-center text-sm font-semibold focus-visible:ring-2 focus-visible:ring-white">Share business link</summary>
    <p className="mt-2 text-xs leading-5 text-white/90">Only this listing and the selected city are included. Search and return-navigation details stay out.</p>
    <div className="mt-3 flex flex-wrap gap-2" aria-busy={feedback.busy}>
      <button type="button" disabled={feedback.busy} onClick={()=>void feedback.copy(url,'link')} className="min-h-11 w-full sm:w-auto rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#19352d] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-white">{feedback.action === 'link' ? 'Copying…' : 'Copy business link'}</button>
      {canShare && <button type="button" disabled={feedback.busy} onClick={()=>void feedback.share({title:businessName,url})} className="min-h-11 w-full sm:w-auto rounded-xl border border-white/50 px-3 py-2 text-sm font-semibold disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-white">Open device share menu</button>}
    </div>
    <p id={`${inputId}-status`} role="status" aria-atomic="true" className="mt-3 min-h-5 text-sm leading-5 text-white"><span key={feedback.attempt}>{feedback.message}</span></p>
    <label htmlFor={inputId} className="mt-3 block text-xs font-semibold">Business link</label>
    <input ref={linkField} aria-describedby={`${inputId}-status`} id={inputId} readOnly value={url} onFocus={event=>event.currentTarget.select()} className="mt-2 min-h-11 w-full min-w-0 rounded-lg bg-white px-3 py-2 text-base sm:text-sm text-slate-900" />
    {feedback.manual && <button type="button" onClick={()=>{linkField.current?.focus();linkField.current?.select()}} className="mt-2 min-h-11 w-full rounded-lg border border-white/50 px-3 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-white">Select link</button>}
    <p className="mt-2 text-xs text-white/90">Nothing is posted automatically.</p>
  </details>
}
