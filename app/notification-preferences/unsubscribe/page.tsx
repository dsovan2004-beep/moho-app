export const metadata={title:'Turn off message emails | MoHoLocal',robots:{index:false,follow:false},referrer:'no-referrer'}
export default async function Unsubscribe({searchParams}:{searchParams:Promise<{token?:string}>}){
 const {token}=await searchParams
 const valid=typeof token==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
 return <section className="max-w-xl mx-auto px-4 py-12"><h1 className="text-2xl font-bold">Turn off message emails</h1>{valid?<><p className="mt-4">Confirm below to stop optional private-message emails. Your account and inbox remain available.</p><form method="post" action={`/api/notification-unsubscribe?token=${token}`}><button className="mt-5 min-h-11 bg-[#19352d] text-white rounded-lg px-4">Turn off message emails</button></form></>:<p className="mt-4">Use the unsubscribe link in your alert email, or manage notification preferences in your inbox.</p>}</section>
}
