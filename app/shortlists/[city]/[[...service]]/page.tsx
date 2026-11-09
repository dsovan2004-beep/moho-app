import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DirectoryBrowser from '@/app/components/DirectoryBrowser'
import { shortlistFromPath } from '@/lib/shortlist-share'
export const runtime='nodejs'
type Props={params:Promise<{city:string;service?:string[]}>}
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {city,service}=await params
  const share=shortlistFromPath(city,service)
  if(!share)return {title:'Shortlist not found | MoHoLocal',robots:{index:false,follow:true}}
  return {title:`${share.title} | MoHoLocal`,description:share.description,
    alternates:{canonical:share.url},robots:{index:false,follow:true},
    openGraph:{title:share.title,description:share.description,url:share.url,siteName:'MoHoLocal',type:'website',images:[{url:'https://www.moholocal.com/icons/moho-512.png',width:512,height:512,alt:'MoHoLocal logo'}]},
    twitter:{card:'summary',title:share.title,description:share.description,images:['https://www.moholocal.com/icons/moho-512.png']}}
}
export default async function ShortlistPage({params}:Props) {
  const {city,service}=await params
  const share=shortlistFromPath(city,service)
  if(!share)notFound()
  return <DirectoryBrowser initialCity={share.city} initialCategory={share.service?.category ?? 'All'} initialService={share.service?.key} />
}
