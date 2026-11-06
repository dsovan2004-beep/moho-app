// Feature-based setup guidance. User agent is used only for local instructions,
// never persisted or treated as proof that a real phone received a notification.
export type PushEnvironment={userAgent:string;platform:string;maxTouchPoints:number;standalone:boolean;secure:boolean;serviceWorker:boolean;pushManager:boolean;notification:boolean;permission:string}
export function pushSetup(env:PushEnvironment){
 const ios=/iPad|iPhone|iPod/i.test(env.userAgent)||(env.platform==='MacIntel'&&env.maxTouchPoints>1)
 const android=/Android/i.test(env.userAgent)
 const label=ios?'iPhone or iPad':android?'Android phone':'My browser'
 if(ios&&!env.standalone)return {state:'install' as const,label}
 if(!env.secure||!env.serviceWorker||!env.pushManager||!env.notification)return {state:'unsupported' as const,label}
 if(env.permission==='denied')return {state:'denied' as const,label}
 return {state:'ready' as const,label}
}
