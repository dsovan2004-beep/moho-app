'use client'
import {useEffect,useState} from 'react'
import {getSupabaseClient} from '@/lib/supabase'
export default function MyPetShares({userId,refresh}:{userId:string;refresh:string}){
 const [rows,setRows]=useState<{id:string;title:string;review_status:string}[]>([]);const [error,setError]=useState('')
 async function load(){const {data,error}=await getSupabaseClient().from('pet_report_shares').select('id,title,review_status').eq('submitted_by',userId).order('created_at',{ascending:false}).limit(20);if(error)setError('Your shared reports could not load.');else setRows(data??[])}
 useEffect(()=>{void load()},[userId,refresh])
 async function withdraw(id:string){const {error}=await getSupabaseClient().rpc('withdraw_pet_share',{sid:id});if(error)setError('Could not withdraw. Refresh before retrying.');else await load()}
 return <section className="mt-8 border-t pt-5"><h2 className="font-bold text-xl">Your shared reports</h2><p className="text-sm mt-2">Withdraw publication permission here. This hides the MoHoLocal report and its photos; it does not change your Facebook post.</p>{error&&<p role="alert">{error}</p>}{rows.map(s=><div key={s.id} className="mt-3 border rounded-xl p-3"><p className="font-semibold">{s.title}</p><p className="text-sm break-all">{s.review_status} · {s.id}</p>{['pending','approved'].includes(s.review_status)&&<button onClick={()=>void withdraw(s.id)} className="min-h-11 underline">Withdraw report and photo permission</button>}</div>)}</section>
}
