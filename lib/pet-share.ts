import { RELAUNCH_CITY_NAMES } from './cities'
export const PET_SHARE_PERMISSION_VERSION = '2026-11-16-v1'
export const PET_SHARE_PERMISSION = 'I am the original reporter or have their permission to share this report. I own these photos or have permission from their creator to publish them. I authorize MoHoLocal to display the submitted report, Facebook source link, photos and photo credit after review. I have checked the current status and removed private addresses, phone numbers and sensitive ownership details.'
export function facebookReportUrl(value: string): string | null {
 try { const u=new URL(value.trim()); if(u.protocol!=='https:'||u.username||u.password||u.port||!['facebook.com','www.facebook.com','m.facebook.com'].includes(u.hostname)||u.pathname==='/'||u.hash) return null
 // Preserve the actual report URL, including Facebook story IDs. Never fetch it.
 return u.href.length<=2000?u.href:null } catch{return null}
}
export function validatePetShare(value: {city:string;title:string;description:string;status:string;sourceUrl:string;reportDate:string;credit:string;permission:boolean}): string | null {
 if(!RELAUNCH_CITY_NAMES.some(c=>c===value.city))return 'Choose one of our four cities.'
 if(value.title.trim().length<5||value.title.length>200)return 'Use a title between 5 and 200 characters.'
 if(!value.description.trim()||value.description.length>4000)return 'Add details, up to 4,000 characters.'
 if(!['lost','found','reunited'].includes(value.status))return 'Choose the current recorded status.'
 if(!facebookReportUrl(value.sourceUrl))return 'Use the HTTPS link to the existing Facebook report.'
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value.reportDate)||(!Number.isFinite(Date.parse(value.reportDate))||new Date(value.reportDate).toISOString().slice(0,10)!==value.reportDate)||value.reportDate>new Date().toISOString().slice(0,10))return 'Choose the original report date, today or earlier.'
 if(!value.credit.trim()||value.credit.length>120)return 'Add a photo credit, up to 120 characters.'
 if(!value.permission)return 'Publication permission is required.'
 return null
}
