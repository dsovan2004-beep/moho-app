import {test} from 'node:test'
import assert from 'node:assert/strict'
import {createECDH} from 'node:crypto'
import {allowedPushEndpoint,deliveryOutcome,deliverNotification,runNotificationDelivery} from '../workers/lib/notifications'
import type {Env} from '../workers/lib/types'
const env:Env={SUPABASE_URL:'https://fixture.supabase.test',SUPABASE_SERVICE_ROLE_KEY:'sb_secret_fixture',APP_ENV:'test'}
test('push delivery rejects private hosts, userinfo, lookalike domains and redirects',()=>{
 for(const url of ['http://fcm.googleapis.com/a','https://127.0.0.1/a','https://fcm.googleapis.com.evil.test/a','https://fcm.googleapis.com@127.0.0.1/a','https://fcm.googleapis.com:444/a','https://fcm.googleapis.com/a#fragment'])assert.equal(allowedPushEndpoint(url),false)
 for(const url of ['https://fcm.googleapis.com/fcm/send/a','https://updates.push.services.mozilla.com/wpush/v2/a','https://web.push.apple.com/a','https://wns1.notify.windows.com/a'])assert.equal(allowedPushEndpoint(url),true)
 assert.equal(deliveryOutcome(302,'push',null).decision,'failed')
 assert.equal(deliveryOutcome(410,'push',null).decision,'retire')
 assert.equal(deliveryOutcome(429,'email','50000').retry_after,3600)
 assert.equal(deliveryOutcome(503,'email',null).decision,'retry')
})
test('native mail uses only the leased recipient, generic text and one-click unsubscribe',async()=>{
 const sent:any[]=[];const mail={send:async(message:any)=>{sent.push(message);return {messageId:'fixture-provider-id'}}}
 const job={id:'fixture-job',lease_id:'fixture-lease',channel:'email' as const,recipient_email:'alice@example.test',unsubscribe_token:'fixture-token',subscription:null!}
 assert.equal((await deliverNotification(env,job)).decision,'retry');assert.equal(sent.length,0)
 const result=await deliverNotification({...env,EMAIL:mail,EMAIL_SENDER_ENABLED:'true'},job)
 assert.equal(result.decision,'sent');assert.equal(result.provider_id,'fixture-provider-id')
 assert.equal(sent[0].to,'alice@example.test');assert.match(sent[0].text,/notification-preferences\/unsubscribe\?token=fixture-token/)
 assert.equal(sent[0].headers['List-Unsubscribe-Post'],'List-Unsubscribe=One-Click')
})
test('native email distinguishes suppression from retryable setup and quota errors',async()=>{
 const job={id:'fixture-job',lease_id:'fixture-lease',channel:'email' as const,recipient_email:'alice@example.test',unsubscribe_token:'fixture-token',subscription:null!}
 for(const [code,decision] of [['E_RECIPIENT_SUPPRESSED','failed'],['E_RATE_LIMIT_EXCEEDED','retry'],['E_EMAIL_SENDING_NOT_READY','retry']]){
  const result=await deliverNotification({...env,EMAIL:{send:async()=>{throw Object.assign(new Error('fixture'),{code})}},EMAIL_SENDER_ENABLED:'true'},job)
  assert.equal(result.decision,decision);assert.equal(result.code,code)
 }
})
test('Web Push produces an encrypted payload and VAPID authorization without sending message content',async()=>{
 const recipient=createECDH('prime256v1');recipient.generateKeys();const server=createECDH('prime256v1');server.generateKeys()
 const original=globalThis.fetch;let request:RequestInit|undefined
 globalThis.fetch=async(_url,init)=>{request=init;return new Response(null,{status:201})}
 try{
  const result=await deliverNotification({...env,VAPID_PUBLIC_KEY:server.getPublicKey().toString('base64url'),VAPID_PRIVATE_KEY:server.getPrivateKey().toString('base64url')},{id:'fixture-push',lease_id:'fixture-lease',channel:'push',recipient_email:'',unsubscribe_token:'',subscription:{endpoint:'https://fcm.googleapis.com/fcm/send/fixture',expirationTime:null,keys:{p256dh:recipient.getPublicKey().toString('base64url'),auth:Buffer.alloc(16,1).toString('base64url')}}})
  assert.equal(result.decision,'sent');assert.equal(request?.redirect,'error');const headers=new Headers(request?.headers);assert.equal(headers.get('Content-Encoding'),'aes128gcm');assert.match(headers.get('Authorization')??'',/^vapid /);assert.equal(headers.get('TTL'),'300')
 }finally{globalThis.fetch=original}
})
test('dispatcher never acknowledges a provider network failure as sent and keeps modern secret out of JWT header',async()=>{
 const original=globalThis.fetch;const calls:{action:string;payload:Record<string,unknown>}[]=[];let claimed=false
 globalThis.fetch=async(url,init)=>{
  if(String(url).startsWith('https://api.resend.com'))throw Error('Fixture provider outage')
  assert.equal(new Headers(init?.headers).get('Authorization'),null)
  const call=JSON.parse(init?.body as string);calls.push(call)
  if(call.action==='claim'&&!claimed){claimed=true;return Response.json({id:'fixture-job',lease_id:'fixture-lease',channel:'email',recipient_email:'alice@example.test',unsubscribe_token:'fixture-token'})}
  return Response.json(call.action==='claim'?null:{saved:true})
 }
 try{await runNotificationDelivery({...env,EMAIL:{send:async()=>{throw Error('Fixture provider outage')}},EMAIL_SENDER_ENABLED:'true'});assert.equal(calls.find(c=>c.action==='finish')?.payload.decision,'retry')}finally{globalThis.fetch=original}
})
