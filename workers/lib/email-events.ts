import {dispatchRpc} from './notifications'
import type {Env} from './types'
export type EmailEventBatch={queue:string;messages:readonly {body:unknown;ack():void;retry(options?:{delaySeconds?:number}):void}[]}
export const EMAIL_EVENT_QUEUE='moho-email-events'
export const EMAIL_EVENT_SUBSCRIPTION='89656ac6fc6947e1943a4442f450b5d3'
const kinds=new Set(['delivered','deferred','bounced','failed','rejected','complained'])
export function emailEventPayload(body:unknown):Record<string,unknown>|null{
 if(!body||typeof body!=='object'||Array.isArray(body))return null
 const e=body as any,p=e.payload,m=e.metadata,source=e.source
 if(source?.type!=='email.sending'||source.zoneId!=='e7be27d26dabc4e883c28c107c4c6f71'||source.domain!=='moholocal.com'||m?.accountId!=='f5915d2f6b28a567c7b7507d652e1145'||m.eventSubscriptionId!==EMAIL_EVENT_SUBSCRIPTION||m.eventSchemaVersion!==1)return null
 const kind=typeof e.type==='string'&&e.type.startsWith('cf.email.sending.message.')?e.type.slice('cf.email.sending.message.'.length):''
 if(!kinds.has(kind)||typeof p?.eventId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.eventId)||typeof p.messageId!=='string'||p.messageId.length>200||typeof p.recipient!=='string'||p.recipient.length>320||typeof p.sender!=='string'||p.sender.toLowerCase()!=='hello@moholocal.com'||p.delivery?.status!==kind||p.terminal!==(kind!=='deferred')||typeof m.eventTimestamp!=='string'||!Number.isFinite(Date.parse(m.eventTimestamp)))return null
 return {event_id:p.eventId,provider_id:p.messageId,recipient_email:p.recipient,event_type:kind,occurred_at:m.eventTimestamp,recipient_rejection:kind==='rejected'&&(p.rejection?.party==='recipient'||p.rejection?.reason==='suppressed')}
}
export async function consumeEmailEvents(batch:EmailEventBatch,env:Env):Promise<void>{
 if(batch.queue!==EMAIL_EVENT_QUEUE)throw new Error('unexpected_email_event_queue')
 for(const message of batch.messages){
  const payload=emailEventPayload(message.body)
  if(!payload){console.warn('[email-events] ignored invalid or unrelated event');message.ack();continue}
  try{await dispatchRpc(env,'email_event',payload);message.ack()}catch{console.error('[email-events] database unavailable; retrying event');message.retry({delaySeconds:60})}
 }
}
