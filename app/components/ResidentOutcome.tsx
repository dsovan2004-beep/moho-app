'use client'

import Link from 'next/link'
import React, {useEffect, useRef, useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
import {outcomeReturnTo} from '@/lib/auth-return'
import {RELAUNCH_CITY_NAMES} from '@/lib/cities'

export default function ResidentOutcome({city}:{city:string}) {
  const detailsRef=useRef<HTMLDetailsElement>(null)
  useEffect(()=>{
    const openTarget=()=>{if(window.location.hash==='#resident-outcome' && detailsRef.current) detailsRef.current.open=true}
    openTarget();window.addEventListener('hashchange',openTarget)
    return ()=>window.removeEventListener('hashchange',openTarget)
  },[])
  const [reportCity,setReportCity]=useState('')
  const [outcome,setOutcome]=useState('')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [signIn,setSignIn]=useState(false)
  const [saved,setSaved]=useState(false)
  useEffect(()=>{setReportCity(RELAUNCH_CITY_NAMES.some(c=>c===city)?city:'')},[city])
  async function submit(e:React.FormEvent) {
    e.preventDefault()
    if(busy||saved) return
    setBusy(true);setMessage('');setSignIn(false)
    try {
      const client=getSupabaseClient()
      const {data:{session}}=await client.auth.getSession()
      if(!session) {setSignIn(true);return}
      const {data,error}=await client.rpc('record_resident_outcome',{p_city:reportCity,p_outcome:outcome})
      if(error) {setMessage(error.code==='42501'?'Use an account with a confirmed email to share an update.':'Your update could not be saved. Please try again.');return}
      if(data?.accepted===true) {setSaved(true);setMessage('Thank you. Your optional update was counted.')}
      else if(data?.reason==='already_reported_today') {setSaved(true);setMessage('You already shared an update today. You can share again tomorrow, Pacific Time.')}
      else setMessage('We could not confirm your update was counted. Please try again.')
    } catch {setMessage('Your update could not be saved. Please try again.')}
    finally {setBusy(false)}
  }
  return <details id="resident-outcome" ref={detailsRef} className="scroll-mt-24 mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-slate-700">
    <summary className="min-h-11 cursor-pointer font-semibold text-[#19352d] focus-visible:outline focus-visible:outline-2">Did you find local help? Share an optional update</summary>
    <p className="mt-3 text-sm">Tell us the result of using this directory. Choose the one result that best fits. This is a self-reported update, not a public business review or a verified booking.</p>
    <p className="mt-2 text-xs leading-relaxed">Submitting adds to city-level daily totals, without your search, business, messages or contact details. A separate account record keeps only your latest reporting day to limit repeats. One update per account per Pacific calendar day. <Link href="/privacy" className="underline">Privacy details</Link></p>
    {!saved && <form onSubmit={submit} className="mt-4 max-w-lg">
      <fieldset disabled={busy} className="space-y-4">
        <label className="block text-sm font-semibold">Which city were you looking in?
          <select required value={reportCity} onChange={e=>setReportCity(e.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white p-2">
            <option value="">Choose a city</option>{RELAUNCH_CITY_NAMES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <fieldset><legend className="text-sm font-semibold mb-1">What happened?</legend>
          {[['reached_provider','I reached a provider'],['could_not_reach','I tried but could not reach a provider'],['found_help','I found someone to help through the directory']].map(([value,label])=><label key={value} className="flex min-h-11 items-center gap-3 text-sm"><input required type="radio" name="resident-outcome" value={value} checked={outcome===value} onChange={()=>setOutcome(value)}/>{label}</label>)}
        </fieldset>
        <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center rounded-xl bg-[#19352d] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy?'Saving…':'Share my update'}</button>
      </fieldset>
    </form>}
    {signIn && <p role="status" className="mt-3 text-sm"><Link className="underline font-semibold" href={`/login?next=${encodeURIComponent(outcomeReturnTo(reportCity))}`}>Sign in to share your update</Link>. After sign-in, choose your result and submit it. Browsing and contacting providers remain available without this report.</p>}
    {message && <p role="status" className="mt-3 text-sm">{message}</p>}
  </details>
}
