import {test} from 'node:test'
import assert from 'node:assert/strict'
import {emailEventPayload,consumeEmailEvents,EMAIL_EVENT_QUEUE,EMAIL_EVENT_SUBSCRIPTION} from '../workers/lib/email-events'
const event=()=>({type:'cf.email.sending.message.bounced',source:{type:'email.sending',zoneId:'e7be27d26dabc4e883c28c107c4c6f71',domain:'moholocal.com'},payload:{eventId:'00000000-0000-4000-8000-000000000555',messageId:'<fixture-id>',sender:'hello@moholocal.com',recipient:'alice@example.test',subject:'Do not persist',terminal:true,delivery:{status:'bounced',smtpResponse:'Do not persist'}},metadata:{accountId:'f5915d2f6b28a567c7b7507d652e1145',eventSubscriptionId:EMAIL_EVENT_SUBSCRIPTION,eventSchemaVersion:1,eventTimestamp:new Date().toISOString()}})
test('email events require exact queue subscription, account, zone, domain, sender and schema',()=>{
 const good=event();assert.equal(emailEventPayload(good)?.event_type,'bounced')
 for(const bad of [{...good,type:'bounced'},{...good,source:{...good.source,domain:'other.example'}},{...good,metadata:{...good.metadata,accountId:'other'}},{...good,metadata:{...good.metadata,eventSubscriptionId:'other'}},{...good,payload:{...good.payload,sender:'other@moholocal.com'}},{...good,payload:{...good.payload,sender:{}}},{...good,payload:{...good.payload,delivery:{status:'delivered'}}},{...good,payload:{...good.payload,eventId:'-'.repeat(36)}}])assert.equal(emailEventPayload(bad),null)
})
test('minimal email persistence excludes subject, SMTP response and raw provider details',()=>{
 const saved=emailEventPayload(event())!;assert.equal(saved.recipient_email,'alice@example.test');assert.equal(JSON.stringify(saved).includes('Do not persist'),false);assert.equal(Object.hasOwn(saved,'subject'),false)
})
test('email queue acknowledges saved/unrelated events and retries database failure without logging recipients',async()=>{
 const original=globalThis.fetch;let mode='success',acked=0,retried=0;const calls:any[]=[]
 globalThis.fetch=async(_url,init)=>{calls.push(JSON.parse(init?.body as string));return mode==='success'?Response.json({saved:true}):Response.json({code:'XX000'},{status:503})}
 const message={body:event(),ack(){acked++},retry(){retried++}}
 const env={SUPABASE_URL:'https://fixture.supabase.test',SUPABASE_SERVICE_ROLE_KEY:'sb_secret_fixture',APP_ENV:'test'}
 try{
  await consumeEmailEvents({queue:EMAIL_EVENT_QUEUE,messages:[message,{...message,body:{}}]},env);assert.equal(acked,2);assert.equal(calls[0].action,'email_event')
  mode='error';await consumeEmailEvents({queue:EMAIL_EVENT_QUEUE,messages:[message]},env);assert.equal(retried,1);assert.equal(acked,2)
  await assert.rejects(consumeEmailEvents({queue:'other',messages:[message]},env),/unexpected/)
 }finally{globalThis.fetch=original}
})
