import { notFound, redirect } from 'next/navigation'
import { UUID } from '@/lib/directory-requests'
import { listingCorrectionParams } from '@/lib/listing-correction'
import { getSupabaseClient } from '@/lib/supabase'
export const runtime = 'nodejs'
export default async function ReportListing({params, searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{city?:string|string[]}>}) {
  const {id}=await params
  if(!UUID.test(id))notFound()
  // Public approved records only; never use privileged keys to prefill a report.
  const {data, error}=await getSupabaseClient().from('businesses').select('id,name,city,listing_checks(service_areas)').eq('id',id).eq('status','approved').eq('verified',true).maybeSingle()
  if(error)throw new Error('Listing could not be loaded. Please try again.')
  if(!data)notFound()
  const checks=Array.isArray(data.listing_checks)?data.listing_checks:[]
  const areas=checks.flatMap(check=>check.service_areas??[])
  redirect(`/submit?${listingCorrectionParams(id,data.name,data.city,(await searchParams).city,areas)}`)
}
