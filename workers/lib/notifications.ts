import {buildPushPayload,type PushSubscription} from '@block65/webcrypto-web-push'
import type {Env} from './types'
export const NOTIFICATION_CRON='*/5 * * * *'
export function allowedPushEndpoint(endpoint:string):boolean{
 try{const u=new URL(endpoint);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&endpoint.length<=1800&&u.pathname!=='/'&&(/^(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com)$/.test(u.hostname)||/^[a-z0-9-]+\.notify\.windows\.com$/.test(u.hostname))}catch{return false}
}
type Job={kind?:'message'|'push_test';receipt_token?:string;id:string;lease_id:string;channel:'email'|'push';recipient_email:string;unsubscribe_token:string;subscription:PushSubscription}
type Outcome={decision:'sent'|'retry'|'failed'|'retire';code:string;retry_after?:number;provider_id?:string}
export async function dispatchRpc(env:Env,action:string,payload:Record<string,unknown>):Promise<unknown>{
 const key=env.SUPABASE_SERVICE_ROLE_KEY
 const response=await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/notification_dispatch`,{method:'POST',headers:{apikey:key,...(key.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${key}`}), 'Content-Type':'application/json'},body:JSON.stringify({action,payload}),signal:AbortSignal.timeout(15000)})
 if(!response.ok){const error=await response.json().catch(()=>({})) as {code?:string};throw new Error(`notification_database_${action}_${response.status}_${/^[A-Z0-9_]+$/.test(error.code??'')?error.code:'unknown'}`)}
 return response.json()
}
export function deliveryOutcome(status:number,channel:'email'|'push',retryAfter:string|null):Outcome{
 if(status>=200&&status<300)return {decision:'sent',code:'provider_accepted'}
 if(channel==='push'&&[404,410].includes(status))return {decision:'retire',code:`push_${status}`}
 if(status===429||status>=500)return {decision:'retry',code:`provider_${status}`,retry_after:Math.min(3600,Math.max(60,Number(retryAfter)||120))}
 return {decision:'failed',code:`provider_${status}`}
}
export async function deliverNotification(env:Env,job:Job):Promise<Outcome>{
 if(job.channel==='email'){
  if(!env.EMAIL||env.EMAIL_SENDER_ENABLED!=='true')return {decision:'retry',code:'email_not_configured'}
  // Recipient is the confirmed, opted-in account address from the leased DB job.
  const unsub=`https://www.moholocal.com/notification-preferences/unsubscribe?token=${job.unsubscribe_token}`
  try{
   const result=await env.EMAIL.send({from:{email:'hello@moholocal.com',name:'MoHoLocal'},replyTo:'dsovan2004@gmail.com',to:job.recipient_email,subject:'You have a new MoHoLocal message',text:`A new private message is waiting in your MoHoLocal inbox.\n\nRead it: https://www.moholocal.com/messages\n\nManage alerts: https://www.moholocal.com/messages\nTurn off message emails: ${unsub}\n\nThis alert contains no sender name or message text.`,headers:{'List-Unsubscribe':`<${unsub}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}})
   return result.messageId?{decision:'sent',code:'provider_accepted',provider_id:result.messageId}:{decision:'retry',code:'email_missing_acceptance'}
  }catch(error){
   const code=(error as {code?:string}).code??'E_NETWORK'
   if(['E_RECIPIENT_SUPPRESSED','E_INVALID_RECIPIENT','E_INVALID_SENDER','E_SENDER_NOT_VERIFIED'].includes(code))return {decision:'failed',code}
   return {decision:'retry',code:/^E_[A-Z_]+$/.test(code)?code:'email_provider_error',retry_after:300}
  }
 }
 if(!env.VAPID_PRIVATE_KEY||!env.VAPID_PUBLIC_KEY)return {decision:'retry',code:'push_not_configured'}
 if(!allowedPushEndpoint(job.subscription.endpoint))return {decision:'retire',code:'push_endpoint_rejected'}
 let payload:RequestInit
 try{payload=await buildPushPayload({data:{version:1,notification_id:job.id,kind:job.kind==='push_test'?'push_test':'message',receipt_token:job.kind==='push_test'?job.receipt_token??null:null},options:{ttl:300,urgency:'normal',topic:job.kind==='push_test'?'moholocal-push-test':'moholocal-dm'}},job.subscription,{subject:'mailto:dsovan2004@gmail.com',publicKey:env.VAPID_PUBLIC_KEY,privateKey:env.VAPID_PRIVATE_KEY})}catch{return {decision:'retire',code:'push_invalid_keys'}}
 const response=await fetch(job.subscription.endpoint,{...payload,redirect:'manual',signal:AbortSignal.timeout(20000)})
 return deliveryOutcome(response.status,'push',response.headers.get('Retry-After'))
}
export async function runNotificationDelivery(env:Env):Promise<void>{
 await dispatchRpc(env,'prepare',{email_ready:Boolean(env.EMAIL&&env.EMAIL_SENDER_ENABLED==='true'),push_ready:Boolean(env.VAPID_PRIVATE_KEY&&env.VAPID_PUBLIC_KEY)})
 let processed=0
 for(let i=0;i<10;i++){
  const job=await dispatchRpc(env,'claim',{}) as Job|null
  if(!job)break
  let outcome:Outcome
  try{outcome=await deliverNotification(env,job)}catch(error){console.error('[notifications] transport failure',{channel:job.channel,error:String(error).replace(/https?:\/\/[^\s]+/g,'[endpoint]').slice(0,180)});outcome={decision:'retry',code:'provider_network_error'}}
  await dispatchRpc(env,'finish',{id:job.id,lease_id:job.lease_id,...outcome});processed++
 }
 console.info('[notifications] delivery pass complete',{processed})
}
