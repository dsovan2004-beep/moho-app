import Link from 'next/link'
import {notFound} from 'next/navigation'
import {getSupabaseClient,PUBLIC_PET_COLUMNS,type LostAndFound} from '@/lib/supabase'
import {UUID} from '@/lib/directory-requests'
import PetStatusControls from '@/app/components/PetStatusControls'
import {PetProgressSummary,PetProgressTimeline,type ProgressUpdate} from '@/app/components/PetProgress'
import PetDiscussion from '@/app/components/PetDiscussion'
export const runtime='nodejs'
export const metadata={title:'Pet report & discussion | MoHoLocal',robots:{index:false,follow:true}}
export default async function PetReportPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!UUID.test(id))notFound()
 const {data,error}=await getSupabaseClient().from('lost_and_found').select(PUBLIC_PET_COLUMNS).eq('id',id).maybeSingle()
 if(error)throw new Error('Pet report could not load. Please retry.')
 if(!data)notFound();const pet=data as unknown as LostAndFound
 const history=await getSupabaseClient().rpc('pet_progress_timeline',{pet_id:id})
 return <div className="max-w-3xl mx-auto px-4 py-10"><Link href={`/lost-and-found?city=${encodeURIComponent(pet.city)}`} className="underline text-sm">← Pet reports in {pet.city}</Link>
  <header className="mt-6 rounded-2xl bg-[#f6f3eb] border border-[#e8e3d7] p-6"><p className="text-sm text-slate-600">{pet.city} · Recorded status: {pet.status}</p><h1 className="mt-3 text-3xl font-bold text-[#19352d]">{pet.title||pet.pet_name||'Pet report'}</h1><p className="mt-3 text-sm">Reported {new Date(pet.created_at).toLocaleDateString('en-US',{dateStyle:'medium',timeZone:'America/Los_Angeles'})}. Confirm current status with the reporter.</p></header>
  <p className="mt-6 whitespace-pre-wrap break-words">{pet.description}</p>
  {pet.source_url&&/^https?:\/\//i.test(pet.source_url)&&<a className="inline-block mt-4 underline font-semibold" href={pet.source_url} target="_blank" rel="noopener noreferrer">Original report / contact ↗</a>}
  {pet.status_confirmed_at&&<p className="mt-4 text-sm text-slate-600">Reporter confirmed this status on {new Date(pet.status_confirmed_at).toLocaleDateString('en-US',{dateStyle:'medium',timeZone:'America/Los_Angeles'})}. This is a reporter update, not an independent outcome check.</p>}
  <PetProgressSummary progress={pet.progress} status={pet.status} observedAt={pet.progress_observed_at}/>
  <PetProgressTimeline updates={(history.data??[]) as ProgressUpdate[]} error={Boolean(history.error)}/>
  <PetStatusControls petId={pet.id}/>
  <PetDiscussion petId={pet.id}/>
 </div>
}
