'use client'

import { useEffect, useState } from 'react'
import { businessShareUrl, copyShareText } from '@/lib/share-links'

interface ShareButtonProps {
  businessName: string
  businessId: string
  city?: string
}

export default function ShareButton({ businessName, businessId, city }: ShareButtonProps) {
  const url = businessShareUrl(businessId,city)
  const [notice,setNotice] = useState('')
  const [busy,setBusy] = useState(false)
  const [canShare,setCanShare] = useState(false)
  useEffect(()=>{setCanShare(typeof navigator.share === 'function')},[])
  useEffect(()=>{setNotice('')},[url])
  if (!url) return null
  async function copy() {
    setBusy(true)
    const copied = await copyShareText(url!,navigator.clipboard)
    setNotice(copied ? 'Link copied. Paste it wherever you choose.' : 'Could not copy automatically. Select and copy the link below.')
    setBusy(false)
  }
  async function share() {
    setBusy(true)
    try { await navigator.share({title:businessName,url:url!}); setNotice('Share action completed on your device.') }
    catch(error) { setNotice(error instanceof Error && error.name==='AbortError' ? 'Sharing canceled.' : 'Could not open sharing. Copy the link below instead.') }
    finally { setBusy(false) }
  }
  const inputId=`business-share-${businessId}`
  return <details className="min-w-0 w-full rounded-xl border border-white/30 bg-white/10 p-3 text-white sm:max-w-sm">
    <summary className="min-h-11 cursor-pointer text-center text-sm font-semibold focus-visible:ring-2 focus-visible:ring-white">Share business link</summary>
    <p className="mt-2 text-xs leading-5 text-white/90">Only this listing and the selected city are included. Search and return-navigation details stay out.</p>
    <div className="mt-3 flex flex-wrap gap-2" aria-busy={busy}>
      <button type="button" disabled={busy} onClick={()=>void copy()} className="min-h-11 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#19352d] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-white">Copy business link</button>
      {canShare && <button type="button" disabled={busy} onClick={()=>void share()} className="min-h-11 rounded-xl border border-white/50 px-3 py-2 text-sm font-semibold disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-white">Open device share menu</button>}
    </div>
    <p role="status" className="mt-2 text-xs leading-5 text-white/90">{notice}</p>
    <label htmlFor={inputId} className="mt-3 block text-xs font-semibold">Business link</label>
    <input id={inputId} readOnly value={url} onFocus={event=>event.currentTarget.select()} className="mt-2 min-h-11 w-full min-w-0 rounded-lg bg-white px-3 py-2 text-sm text-slate-900" />
    <p className="mt-2 text-xs text-white/90">Nothing is posted automatically.</p>
  </details>
}
