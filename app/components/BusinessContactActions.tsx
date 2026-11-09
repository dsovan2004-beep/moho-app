import React from 'react'
import { contactPreference, textContact } from '@/lib/business-discovery'
import { businessPhoneHref, businessWebsiteHref } from '@/lib/contact-links'

export default function BusinessContactActions({ phone, website, businessName, tone = 'light' }: {
  phone?: string; website?: string; businessName?: string; tone?: 'light' | 'dark'
}) {
  const websiteHref=businessWebsiteHref(website)
  const phoneHref=businessPhoneHref(phone)
  const preference = contactPreference(websiteHref ?? undefined)
  const texting = phoneHref ? textContact(websiteHref ?? undefined, phone) : null
  const named=(label:string)=>businessName ? `${label} — ${businessName}` : label
  const primary = 'inline-flex w-full sm:w-auto min-h-11 items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-[#19352d] hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
  const secondary = `inline-flex w-full sm:w-auto min-h-11 items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${tone === 'dark' ? 'border-white/40 text-white hover:bg-white/15' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`
  const callLabel=texting?.label ?? (preference ? 'Call for follow-up' : `Call ${phone}`)
  const siteLabel=preference?.label ?? 'Visit website'
  const call = phoneHref && <a key="phone" href={texting?.href ?? phoneHref} aria-label={named(callLabel)} className={preference ? secondary : primary}>{callLabel}</a>
  const site = websiteHref && <a key="website" href={websiteHref} aria-label={named(siteLabel)} target="_blank" rel="noopener noreferrer" className={preference || !phoneHref ? primary : secondary}>{siteLabel} ↗</a>
  return <div className="mt-3 min-w-0">
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">{preference ? <>{site}{call}</> : <>{call}{site}</>}</div>
    {!phoneHref && !websiteHref && <p className={`text-sm ${tone === 'dark' ? 'text-white/90' : 'text-slate-600'}`}>Contact details are unavailable.</p>}
    {texting && <p className={`mt-2 max-w-sm text-xs leading-relaxed ${tone === 'dark' ? 'text-white/90' : 'text-slate-600'}`}>{texting.note}</p>}
    {preference && <p className={`mt-2 max-w-sm text-xs leading-relaxed ${tone === 'dark' ? 'text-white/90' : 'text-slate-600'}`}>{preference.note}</p>}
  </div>
}
