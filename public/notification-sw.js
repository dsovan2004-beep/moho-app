// Notification-only worker: never cache private pages, API responses or messages.
self.addEventListener('push', event => {
 event.waitUntil(self.registration.showNotification('New MoHoLocal message',{
  body:'Open your private inbox to read it.',icon:'/icons/moho-192.png',badge:'/icons/moho-192.png',tag:'moholocal-dm',renotify:false,
  data:{url:'/messages'}
 }))
})
self.addEventListener('notificationclick',event=>{
 event.notification.close()
 event.waitUntil((async()=>{
  const url=new URL('/messages',self.location.origin).href
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true})
  const target=windows.find(client=>client.url===url)
  if(target)return target.focus()
  return self.clients.openWindow(url)
 })())
})
