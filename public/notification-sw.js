// Notification-only worker: never cache private pages, API responses or messages.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()))
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()))
const isReceiptToken=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
async function confirm(token,stage){
 if(!isReceiptToken(token))return
 try{await fetch('/api/push-receipt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,stage}),signal:AbortSignal.timeout(10000)})}catch{/* Notification display does not depend on the optional receipt. */}
}
self.addEventListener('push',event=>{
 event.waitUntil((async()=>{
  let data={};try{data=event.data?.json()??{}}catch{/* Always show only fixed, generic text. */}
  const test=data.version===1&&data.kind==='push_test'&&isReceiptToken(data.receipt_token)
  const receipt=test?data.receipt_token:null
  const received=confirm(receipt,'received')
  await self.registration.showNotification(test?'MoHoLocal push test':'New MoHoLocal message',{
   body:test?'Push reached this browser. Open your inbox to check the test result.':'Open your private inbox to read it.',
   icon:'/icons/moho-192.png',badge:'/icons/moho-192.png',tag:test?'moholocal-push-test':'moholocal-dm',renotify:false,data:{receipt_token:receipt}
  })
  await Promise.all([received,confirm(receipt,'displayed')])
 })())
})
self.addEventListener('notificationclick',event=>{
 event.notification.close()
 event.waitUntil((async()=>{
  await confirm(event.notification.data?.receipt_token,'opened')
  const url=new URL('/messages',self.location.origin).href
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true})
  const target=windows.find(client=>client.url===url)
  if(target)return target.focus()
  return self.clients.openWindow(url)
 })())
})
