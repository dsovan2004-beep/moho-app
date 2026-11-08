import React from 'react'
import { contactPreference, textContact } from '@/lib/business-discovery'

export default function BusinessContactActions({ phone, website, tone = 'light' }: {
  phone?: string; website?: string; tone?: 'light' | 'dark'
}) {
  const preference = contactPreference(website)
  const texting = textContact(website, phone)
  const primary = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-[#19352d] hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
  const secondary = `inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${tone === 'dark' ? 'border-white/40 text-white hover:bg-white/15' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`
  const call = phone && <a key="phone" href={texting?.href ?? `tel:${phone}`} className={preference || !phone ? secondary : primary}>{texting?.label ?? (preference ? 'Call for follow-up' : `Call ${phone}`)}</a>
  const site = website && <a key="website" href={website} target="_blank" rel="noopener noreferrer" className={preference || !phone ? primary : secondary}>{preference?.label ?? 'Visit website'} ↗</a>
  return <div className="mt-3 min-w-0">
    <div className="flex flex-wrap gap-2">{preference ? <>{site}{call}</> : <>{call}{site}</>}</div>
    {texting && <p className={`mt-2 max-w-sm text-xs leading-relaxed ${tone === 'dark' ? 'text-white/90' : 'text-slate-600'}`}>{texting.note}</p>}
    {preference && <p className={`mt-2 max-w-sm text-xs leading-relaxed ${tone === 'dark' ? 'text-white/90' : 'text-slate-600'}`}>{preference.note}</p>}
  </div>
}
