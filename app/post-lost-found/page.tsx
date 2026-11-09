import { redirect } from 'next/navigation'
import { RELAUNCH_CITY_NAMES } from '@/lib/cities'
export const runtime = 'nodejs'
export default async function PostLostFound({searchParams}:{searchParams:Promise<{city?:string|string[]}>}) {
  const {city}=await searchParams
  const params=new URLSearchParams({submission_type:'lost_pet'})
  if(typeof city==='string' && (RELAUNCH_CITY_NAMES as readonly string[]).includes(city)) params.set('city',city)
  redirect(`/submit?${params}`)
}
