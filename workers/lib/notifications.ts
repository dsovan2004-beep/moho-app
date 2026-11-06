import {buildPushPayload,type PushSubscription} from '@block65/webcrypto-web-push'
import type {Env} from './types'
export const NOTIFICATION_CRON='*/5 * * * *'
export function allowedPushEndpoint(endpoint:string):boolean{
 try{const u=new URL(endpoint);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash&&endpoint.length<=1800&&u.pathname!=='/'&&(/^(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com)$/.test(u.hostname)||/^[a-z0-9-]+\.notify\.windows\.com$/.test(u.hostname))}catch{return false}
}
type Job={id:string;lease_id:string;channel:'email'|'push';recipient_email:string;unsubscribe_token:string;subscription:PushSubscription}
type Outcome={decision:'sent'|'retry'|'failed'|'retire';code:string;retry_after?:number}
export async function dispatchRpc(env:Env,action:string,payload:Record<string,unknown>):Promise<unknown>{
 const key=env.SUPABASE_SERVICE_ROLE_KEY
 const response=await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/notification_dispatch`,{method:'POST',headers:{apikey:key,...(key.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${key}`}), 'Content-Type':'application/json'},body:JSON.stringify({action,payload}),signal:AbortSignal.timeout(15000)})
 if(!response.ok)throw new Error(`notification_database_${response.status}`)
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
  if(!env.RESEND_API_KEY||env.EMAIL_SENDER_ENABLED!=='true')return {decision:'retry',code:'email_not_configured'}
  // Recipient comes only from the leased database job, never a public HTTP request.
  const unsub=`https://www.moholocal.com/notification-preferences/unsubscribe?token=${job.unsubscribe_token}`
  const response=await fetch('https://api.resend.com/emails',{method:'POST',redirect:'error',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`moho-dm-${job.id}`,'User-Agent':'MoHoLocal-Notifications/1.0'},body:JSON.stringify({from:'MoHoLocal <hello@moholocal.com>',reply_to:'dsovan2004@gmail.com',to:[job.recipient_email],subject:'You have a new MoHoLocal message',text:`A new private message is waiting in your MoHoLocal inbox.\n\nRead it: https://www.moholocal.com/messages\n\nManage alerts: https://www.moholocal.com/messages\nTurn off message emails: ${unsub}\n\nThis alert contains no sender name or message text.`,headers:{'List-Unsubscribe':`<${unsub}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}}),signal:AbortSignal.timeout(20000)})
  const outcome=deliveryOutcome(response.status,'email',response.headers.get('Retry-After'))
  if(outcome.decision==='sent'){
   const body=await response.json() as {id?:string}
   if(!body.id)return {decision:'retry',code:'email_missing_acceptance'}
  }
  return outcome
 }
 if(!env.VAPID_PRIVATE_KEY||!env.VAPID_PUBLIC_KEY)return {decision:'retry',code:'push_not_configured'}
 if(!allowedPushEndpoint(job.subscription.endpoint))return {decision:'retire',code:'push_endpoint_rejected'}
 let payload:RequestInit
 try{payload=await buildPushPayload({data:{version:1,notification_id:job.id},options:{ttl:300,urgency:'normal',topic:'moholocal-dm'}},job.subscription,{subject:'mailto:dsovan2004@gmail.com',publicKey:env.VAPID_PUBLIC_KEY,privateKey:env.VAPID_PRIVATE_KEY})}catch{return {decision:'retire',code:'push_invalid_keys'}}
 const response=await fetch(job.subscription.endpoint,{...payload,redirect:'error',signal:AbortSignal.timeout(20000)})
 return deliveryOutcome(response.status,'push',response.headers.get('Retry-After'))
}
export async function runNotificationDelivery(env:Env):Promise<void>{
 await dispatchRpc(env,'prepare',{email_ready:Boolean(env.RESEND_API_KEY&&env.EMAIL_SENDER_ENABLED==='true'),push_ready:Boolean(env.VAPID_PRIVATE_KEY&&env.VAPID_PUBLIC_KEY)})
 let processed=0
 for(let i=0;i<10;i++){
  const job=await dispatchRpc(env,'claim',{}) as Job|null
  if(!job)break
  let outcome:Outcome
  try{outcome=await deliverNotification(env,job)}catch{outcome={decision:'retry',code:'provider_network_error'}}
  await dispatchRpc(env,'finish',{id:job.id,lease_id:job.lease_id,...outcome});processed++
 }
 console.info('[notifications] delivery pass complete',{processed})
}
