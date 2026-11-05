import { notFound, redirect } from 'next/navigation'
import { UUID } from '@/lib/directory-requests'
export const runtime = 'nodejs'
export default async function ReportListing({params}:{params:Promise<{id:string}>}) {
 const {id}=await params
 if(!UUID.test(id))notFound()
 redirect(`/submit?${new URLSearchParams({submission_type:'business_update',business_id:id,title:'Listing correction'})}`)
}
