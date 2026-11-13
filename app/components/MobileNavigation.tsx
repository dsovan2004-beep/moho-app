import React from 'react'
import Link from 'next/link'

export function MobileNavigation({city,signedIn,messageBadge}:{city:string;signedIn:boolean;messageBadge?:React.ReactNode}) {
  const query=new URLSearchParams({city}).toString()
  const items=[
    {href:`/directory?${query}`,label:'Find help'},
    {href:`/discover?${query}`,label:'Explore'},
    {href:`/events?${query}`,label:'Events'},
    {href:`/lost-and-found?${query}`,label:'Pets'},
    {href:`/community?${query}`,label:'Community'},
    {href:signedIn?'/messages':'/login',label:signedIn?'Messages':'Sign in'},
  ]
  return <div className="xl:hidden grid grid-cols-3 sm:grid-cols-6 gap-1 border-t border-white/15 p-1" aria-label="Mobile navigation">
    {items.map(item=><Link key={item.label} href={item.href} className="min-h-12 min-w-0 flex flex-wrap items-center justify-center gap-1 rounded-md px-2 py-2 text-center text-xs leading-4 font-semibold text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300"><span>{item.label}</span>{item.href==='/messages'&&messageBadge}</Link>)}
  </div>
}
