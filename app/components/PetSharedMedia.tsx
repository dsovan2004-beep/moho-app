import {getSupabaseClient} from '@/lib/supabase'
export default async function PetSharedMedia({imageUrl}:{imageUrl?:string}){
 const match=imageUrl?.match(/^https:\/\/www\.moholocal\.com\/api\/pet-share-photo\/([0-9a-f-]{36})\/0$/)
 if(!match)return null
 const {data,error}=await getSupabaseClient().rpc('pet_share_media',{sid:match[1]})
 if(error||!Array.isArray(data?.paths))return null
 return <section className="mt-6" aria-label="Reporter-submitted photos"><div className="grid gap-3 sm:grid-cols-2">{data.paths.map((_:string,i:number)=><img key={i} src={`/api/pet-share-photo/${match[1]}/${i}`} alt={`Reporter-submitted pet photo ${i+1}`} className="w-full max-h-96 rounded-xl object-contain"/>)}</div><p className="text-sm text-slate-600 mt-2">Photos: {data.credit} · Published with reporter-submitted permission. Original report date: {data.reportDate}. A photo similarity does not confirm ownership.</p></section>
}
