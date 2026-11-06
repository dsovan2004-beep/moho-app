import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
import {POST} from '../app/api/push-receipt/route'
function worker(){
 const handlers:Record<string,(e:any)=>void>={},notifications:{title:string;options:any}[]=[],receipts:string[]=[],opened:string[]=[]
 const self={addEventListener:(name:string,fn:(e:any)=>void)=>{handlers[name]=fn},skipWaiting:async()=>{},registration:{showNotification:async(title:string,options:any)=>{notifications.push({title,options})}},clients:{claim:async()=>{},matchAll:async()=>[],openWindow:async(url:string)=>{opened.push(url)}},location:{origin:'https://www.moholocal.com'}}
 runInNewContext(readFileSync('public/notification-sw.js','utf8'),{self,URL,AbortSignal,fetch:async(_url:string,init:RequestInit)=>{receipts.push(JSON.parse(init.body as string).stage);return new Response(null,{status:204})}})
 async function event(kind:string,payload:any){let promise:Promise<unknown>|undefined;handlers[kind]({...payload,waitUntil:(p:Promise<unknown>)=>{promise=p}});await promise}
 return {event,notifications,receipts,opened}
}
test('normal message pushes reveal no supplied message text and send no display tracking',async()=>{
 const w=worker();await w.event('push',{data:{json:()=>({version:1,kind:'message',body:'Private fixture content',url:'https://evil.test/'})}})
 assert.equal(w.notifications[0].title,'New MoHoLocal message');assert.equal(w.notifications[0].options.body,'Open your private inbox to read it.');assert.deepEqual(w.receipts,[])
})
test('real push tests use fixed content, receipt stages and a fixed same-origin click destination',async()=>{
 const w=worker(),token='00000000-0000-4000-8000-000000000099'
 await w.event('push',{data:{json:()=>({version:1,kind:'push_test',receipt_token:token,title:'Injected title',url:'https://evil.test/'})}})
 assert.equal(w.notifications[0].title,'MoHoLocal push test');assert.deepEqual(w.receipts,['received','displayed'])
 await w.event('notificationclick',{notification:{close(){},data:w.notifications[0].options.data}})
 assert.equal(w.receipts.at(-1),'opened');assert.deepEqual(w.opened,['https://www.moholocal.com/messages'])
})
test('receipt HTTP input rejects malformed capabilities and streamed oversized bodies',async()=>{
 assert.equal((await POST(new Request('https://www.moholocal.com/api/push-receipt',{method:'POST',body:JSON.stringify({token:'invalid',stage:'displayed'})}))).status,400)
 assert.equal((await POST(new Request('https://www.moholocal.com/api/push-receipt',{method:'POST',body:'x'.repeat(1025)}))).status,413)
})
