import { RELAUNCH_CITY_NAMES } from './cities'

export const ACTIVITY_STREAMS=[
 {key:'all',label:'All activity'},
 {key:'listings',label:'Listing checks & approvals'},
 {key:'discussions',label:'Discussions'},
 {key:'events',label:'Events'},
 {key:'pets',label:'Pet reports'},
] as const
export type ActivityStream=typeof ACTIVITY_STREAMS[number]['key']
export function activityStream(value?:string):ActivityStream {
 return ACTIVITY_STREAMS.find(item=>item.key===value)?.key ?? 'all'
}
export function activityHref(city?:string,stream:ActivityStream='all') {
 const params=new URLSearchParams()
 if(RELAUNCH_CITY_NAMES.some(name=>name===city)) params.set('city',city!)
 if(activityStream(stream)!=='all') params.set('stream',activityStream(stream))
 return `/activity${params.size ? `?${params}` : ''}`
}
