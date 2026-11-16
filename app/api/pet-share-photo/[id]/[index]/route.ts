import {createClient} from '@supabase/supabase-js'
import {UUID} from '@/lib/directory-requests'
export const runtime='nodejs'
export async function GET(_req:Request,{params}:{params:Promise<{id:string;index:string}>}){
 const {id,index}=await params
 if(!UUID.test(id)||!['0','1','2'].includes(index))return new Response(null,{status:404})
 const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data,error}=await client.rpc('pet_share_media',{sid:id})
 const path=data?.paths?.[Number(index)]
 if(error||typeof path!=='string')return new Response(null,{status:error?503:404})
 const photo=await client.storage.from('pet-share-pending').download(path)
 if(photo.error||!photo.data)return new Response(null,{status:404})
 return new Response(photo.data,{headers:{'Content-Type':'image/jpeg','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}})
}
