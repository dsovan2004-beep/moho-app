import {getSupabaseClient} from '@/lib/supabase'
export async function POST(request:Request){
 const reply=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}})
 const reader=request.body?.getReader();if(!reader)return reply(400)
 let text='',size=0;const decoder=new TextDecoder()
 try{
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024){await reader.cancel();return reply(413)}text+=decoder.decode(value,{stream:true})}
  text+=decoder.decode()
  const p=JSON.parse(text)
  if(typeof p.token!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.token)||!['received','displayed','opened'].includes(p.stage))return reply(400)
  const {error}=await getSupabaseClient().rpc('confirm_push_test',{token:p.token,stage:p.stage})
  return reply(error?503:204)
 }catch{return reply(400)}
}
