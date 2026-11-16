import type {Metadata} from 'next'
import {RELAUNCH_CITY_NAMES} from './cities'
export type PetBoardSearch=Record<string,string|string[]|undefined>
export function petBoardMetadata(params:PetBoardSearch):Metadata {
 const scalar=(key:string)=>typeof params[key]==='string'?params[key] as string:undefined
 const city=scalar('city')??'All Cities'
 const status=scalar('status')??'All'
 const history=scalar('history')
 const validCity=city==='All Cities'||RELAUNCH_CITY_NAMES.some(name=>name===city)
 const labels:Record<string,string>={All:'Lost & found pets',lost:'Lost pet reports',found:'Found pet reports',reunited:'Recorded reunited pet reports',active:'Pet reports with unconfirmed status'}
 const validStatus=Object.prototype.hasOwnProperty.call(labels,status)
 const valid=validCity&&validStatus&&(!history||history==='1')&&!Object.values(params).some(Array.isArray)
 const area=validCity&&city!=='All Cities'?city:'Mountain House, Tracy, Lathrop & Manteca'
 const title=`${history==='1'?'Pet report history':validStatus?labels[status]:labels.All} in ${area} | MoHoLocal`
 const description=history==='1'?'Browse older local pet reports. Check dates and the latest reporter update; report history does not confirm an animal is still missing.':`Browse local pet reports for ${area}. Check sightings, recorded status and reporter updates before sharing. A sighting does not establish custody.`
 const query=new URLSearchParams()
 if(validCity&&city!=='All Cities') query.set('city',city)
 if(status!=='All'&&validStatus) query.set('status',status)
 if(history==='1') query.set('history','1')
 return {title,description,...(valid?{alternates:{canonical:`https://www.moholocal.com/lost-and-found${query.size?'?'+query:''}`}}:{robots:{index:false,follow:true}})}
}
