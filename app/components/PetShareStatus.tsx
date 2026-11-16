import React from 'react'
import Link from 'next/link'
import {UUID} from '@/lib/directory-requests'

export type SharedPetRequest = {id:string; title:string; review_status:string; published_report_id:string|null}
const labels:Record<string,string> = {
 pending:'Pending review · photos private',
 approved:'Approved · check report for current visibility and status',
 rejected:'Not approved · photos private',
 withdrawn:'Permission withdrawn · report hidden',
}
export default function PetShareStatus({request}:{request:SharedPetRequest}) {
 const label=Object.prototype.hasOwnProperty.call(labels,request.review_status)?labels[request.review_status]:'Status unavailable · refresh to check'
 const reportId=request.review_status==='approved'&&request.published_report_id&&UUID.test(request.published_report_id)?request.published_report_id:null
 return <>
  <h3 className="font-semibold break-words">{request.title}</h3>
  <p className="mt-1 text-sm">{label}</p>
  <p className="mt-2 text-xs text-slate-600">Request reference</p>
  <code className="block select-all break-all text-sm">{request.id}</code>
  {reportId&&<Link href={`/lost-and-found/${reportId}`} className="mt-2 inline-flex min-h-11 items-center font-semibold underline focus-visible:ring-2 focus-visible:ring-emerald-700">View pet report →</Link>}
 </>
}
