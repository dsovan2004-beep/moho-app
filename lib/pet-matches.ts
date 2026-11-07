import {UUID} from './directory-requests'
export type ContactStage='unknown'|'attempted'|'contacted'|'return_arranged'
export const CONTACT_STAGES:Record<ContactStage,string>={unknown:'Contact not confirmed',attempted:'Contact attempted',contacted:'Owner / finder contacted',return_arranged:'Return arranged — reunion not confirmed'}
export function contactLabel(value?:string|null){return CONTACT_STAGES[value as ContactStage]??CONTACT_STAGES.unknown}
export type PetMatch={id:string;other_pet_id:string;title:string;city:string;status:string;state:'possible'|'confirmed'|'ruled_out';revision:number;updated_at:string;my_decision?:'pending'|'confirmed'|'ruled_out'}
export function matchLabel(state:PetMatch['state']){return state==='confirmed'?'Both reports marked as a match — reunion not confirmed':state==='ruled_out'?'Ruled out by a reporter':'Possible match — not confirmed'}
export function petReportId(value:string){
 const input=value.trim();if(UUID.test(input))return input.toLowerCase()
 try{const url=new URL(input,'https://www.moholocal.com');const id=url.pathname.match(/^\/lost-and-found\/([0-9a-f-]+)\/?$/i)?.[1]
 if(['https:'].includes(url.protocol)&&['www.moholocal.com','moholocal.com'].includes(url.hostname)&&!url.username&&!url.password&&(!url.port||url.port==='443')&&id&&UUID.test(id))return id.toLowerCase()
 }catch{}
 throw new Error('Paste a MoHoLocal pet report link or report ID.')
}
