import React from 'react'
import type {LostAndFound} from '@/lib/supabase'
type Identification=Pick<LostAndFound,'breed'|'coat_description'|'age'|'gender'|'last_seen'|'location_detail'|'location_last_seen'>
export function PetIdentification({pet}:{pet:Identification}){
 const detail=pet.location_detail?.trim(),other=pet.location_last_seen?.trim()
 const fields=[['Breed / description',pet.breed],['Coat & distinguishing markings',pet.coat_description],['Reported age',pet.age],['Reported sex',pet.gender],['Last seen — report text',pet.last_seen],['Reported sighting area',detail||other]]
 if(detail&&other&&detail!==other)fields.push(['Additional recorded area',other])
 return <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="pet-identification-heading"><h2 id="pet-identification-heading" className="text-lg font-bold">Details to compare</h2><p className="mt-2 text-sm text-slate-600">Reporter-provided details may be incomplete or older than the latest status. Compare leads and confirm identifying proof privately. A sighting area is not a pickup address.</p><dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">{fields.map(([label,value])=><div key={label} className="min-w-0"><dt className="text-sm font-semibold text-slate-700">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-900">{typeof value==='string'&&value.trim() ? value : 'Not provided'}</dd></div>)}</dl><p className="mt-4 text-xs text-slate-600">These details do not confirm a match, ownership or current custody. Check the latest reporter status above.</p></section>
}
