'use client'
import { useEffect, useState } from 'react'
import { shortlistShare } from '@/lib/shortlist-share'

export default function ShortlistShare({city,service}: {city:string;service?:string}) {
  const share=shortlistShare(city,service)
  const [notice,setNotice]=useState('')
  const [canShare,setCanShare]=useState(false)
  useEffect(()=>{setCanShare(typeof navigator.share === 'function')},[])
  useEffect(()=>{setNotice('')},[city,service])
  if(!share)return null
  async function copy(text:string,kind:string) {
    try { await navigator.clipboard.writeText(text); setNotice(`${kind} copied. Paste it wherever you choose.`) }
    catch { setNotice('Copy is unavailable here. Select and copy the link or suggested text below.') }
  }
  async function nativeShare() {
    try { await navigator.share({title:share!.title,text:share!.description,url:share!.url}); setNotice('Share action completed on your device.') }
    catch(error) { setNotice(error instanceof Error && error.name==='AbortError' ? 'Sharing canceled.' : 'Sharing is unavailable here. You can copy the link instead.') }
  }
  return <details className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
    <summary className="min-h-11 cursor-pointer font-semibold text-[#19352d] focus-visible:ring-2 focus-visible:ring-[#19352d]">{service ? 'Share this service shortlist' : 'Share this city directory'}</summary>
    <h2 className="mt-3 text-lg font-bold text-[#19352d]">{share.title}</h2>
    <p className="mt-2 text-sm text-slate-600">This link opens current listings. Search text, sort order and account details are left out. Nothing is posted automatically.</p>
    <label htmlFor="shortlist-share-url" className="mt-4 block text-sm font-semibold">Share link</label>
    <input id="shortlist-share-url" readOnly value={share.url} onFocus={event=>event.currentTarget.select()} className="mt-2 w-full min-h-11 rounded-xl border border-slate-300 px-3 py-2 text-sm" />
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" onClick={()=>void copy(share.url,'Link')} className="min-h-11 rounded-xl bg-[#19352d] px-4 py-2 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-emerald-700">Copy link</button>
      <button type="button" onClick={()=>void copy(share.text,'Suggested text')} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-emerald-700">Copy suggested text</button>
      {canShare && <button type="button" onClick={()=>void nativeShare()} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-emerald-700">Open device share menu</button>}
    </div>
    <label htmlFor="shortlist-share-text" className="mt-4 block text-sm font-semibold">Suggested text — edit before posting</label>
    <textarea id="shortlist-share-text" readOnly value={share.text} onFocus={event=>event.currentTarget.select()} rows={6} className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm" />
    <p role="status" className="mt-2 text-sm text-slate-600">{notice}</p>
  </details>
}
