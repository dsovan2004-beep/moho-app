import {getSupabaseClient} from './supabase'
export type NotificationSettings={email_enabled:boolean;email_paused?:boolean;email_delivery_status?:string|null;email_ready:boolean;push_ready:boolean;devices:{id:string;label:string;created_at:string}[];tests:{id:string;subscription_id:string;status:string;created_at:string;received_at:string|null;displayed_at:string|null;opened_at:string|null;error_code:string|null}[]}
export async function notificationSettings(action='settings',payload:Record<string,unknown>={}):Promise<NotificationSettings>{
 const {data,error}=await getSupabaseClient().rpc('notification_settings_action',{action,payload})
 if(error)throw new Error(['22023','42501','P0001'].includes(error.code)?error.message:'Notification preferences could not load or save. Please retry.')
 return data as NotificationSettings
}
export async function removeThisPushDevice(){
 if(typeof navigator==='undefined'||!('serviceWorker'in navigator))return
 const registration=await navigator.serviceWorker.getRegistration('/notification-sw.js')
 const subscription=await registration?.pushManager?.getSubscription()
 if(!subscription)return
 try{await notificationSettings('unsubscribe',{endpoint:subscription.endpoint})}finally{await subscription.unsubscribe()}
}
