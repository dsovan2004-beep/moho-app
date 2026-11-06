import {getSupabaseClient} from '@/lib/supabase'
export async function POST(request:Request){
 const token=new URL(request.url).searchParams.get('token')
 if(!token||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token))return new Response('Invalid unsubscribe link.',{status:400})
 const {error}=await getSupabaseClient().rpc('unsubscribe_notification_email',{token})
 return new Response(error?'Could not save. Please retry or manage preferences in your inbox.':'Message emails have been turned off. You can close this page.',{status:error?503:200,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex'}})
}
