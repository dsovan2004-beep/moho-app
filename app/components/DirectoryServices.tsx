'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SERVICE_CHOICES } from '@/lib/services'

export default function DirectoryServices({city, selected}: {city: string; selected?: string}) {
  const [expanded, setExpanded] = useState(false)
  const active = SERVICE_CHOICES.find(item => item.key === selected)
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 mb-5" aria-labelledby="service-shortcuts-heading">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id="service-shortcuts-heading" className="text-lg font-bold text-[#19352d]">Find a service</h2>
      <button type="button" aria-expanded={expanded} aria-controls="directory-service-options" onClick={() => setExpanded(value => !value)} className="lg:hidden inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#19352d] px-3 py-2 text-sm font-semibold text-[#19352d] focus-visible:ring-2 focus-visible:ring-[#19352d]">
        {expanded ? 'Hide services' : active ? 'Change service' : 'Browse services'} <span aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>
    </div>
    <p className={`${expanded ? 'block' : 'hidden lg:block'} mt-1 text-sm text-slate-600`}>Choose a service to see providers with dated website checks for your city.</p>
    <div id="directory-service-options" className={`${expanded ? 'grid' : 'hidden lg:grid'} md:grid-cols-2 gap-5 mt-4`}>
      {(['Home Services','Pet Services'] as const).map(group => <div key={group}>
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">{group === 'Home Services' ? 'Home & yard' : 'Pets & everyday care'}</h3>
        <div className="flex flex-wrap gap-2">{SERVICE_CHOICES.filter(item => item.category === group).map(item => <Link key={item.key} aria-current={selected === item.key ? 'page' : undefined} onClick={() => setExpanded(false)} className={`inline-flex min-h-11 items-center px-3 py-2 rounded-xl text-sm border focus-visible:ring-2 focus-visible:ring-[#19352d] ${selected === item.key ? 'bg-[#19352d] text-white border-[#19352d]' : 'border-slate-200 bg-[#f7f8f5] text-slate-700 hover:border-[#19352d]'}`} href={`/directory?${new URLSearchParams({city,category:item.category,service:item.key})}`}>{item.label}</Link>)}</div>
      </div>)}
    </div>
  </section>
}
