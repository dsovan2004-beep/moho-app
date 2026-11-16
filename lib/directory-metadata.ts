import type {Metadata} from 'next'
import {RELAUNCH_CITY_NAMES} from './cities'
import {serviceForCategory} from './services'
export type DirectorySearch = Record<string,string|string[]|undefined>
const categories=['All','Restaurants','Health & Wellness','Home Services','Pet Services','Beauty & Spa','Automotive','Education','Real Estate','Retail']
export function directoryMetadata(params:DirectorySearch):Metadata {
  const scalar=(key:string)=>typeof params[key]==='string' ? params[key] as string : undefined
  const city=scalar('city')??'All Cities'
  const category=scalar('category')??'All'
  const service=serviceForCategory(scalar('service'),category)
  const validCity=city==='All Cities'||RELAUNCH_CITY_NAMES.some(name=>name===city)
  const valid=validCity&&categories.includes(category)&&!Object.values(params).some(Array.isArray)&&(!scalar('service')||Boolean(service))
  const searching=Boolean(scalar('q')?.trim())
  const area=validCity&&city!=='All Cities' ? city : 'Mountain House, Tracy, Lathrop & Manteca'
  const subject=searching ? 'Search local businesses' : service?.label??(categories.includes(category)&&category!=='All' ? category : 'Local businesses & services')
  const title=`${subject} in ${area} | MoHoLocal`
  const description=service ? `Find ${service.label.toLowerCase()} serving ${area}. Compare dated website checks, explicit service areas and contact options. Confirm availability directly.` : `Browse local businesses and services for ${area}. Check service areas and contact details, and suggest corrections.`
  const canonicalParams=new URLSearchParams()
  if(city!=='All Cities'&&validCity) canonicalParams.set('city',city)
  if(category!=='All'&&categories.includes(category)) canonicalParams.set('category',category)
  if(service) canonicalParams.set('service',service.key)
  const canonical=`https://www.moholocal.com/directory${canonicalParams.size?'?'+canonicalParams:''}`
  return {title,description,...(valid&&!searching?{alternates:{canonical}}:{}),...(!valid||searching?{robots:{index:false,follow:true}}:{}),openGraph:{title,description,type:'website',siteName:'MoHoLocal'}}
}
