import React from 'react'
import Link from 'next/link'
import { receiptListingHref } from '@/lib/submission-receipt'

export default function SubmissionReceipt({reference, listingId, city, onAnother}: {reference: string; listingId?: string; city?: string; onAnother: () => void}) {
  const listingHref = receiptListingHref(listingId,city)
  return <section aria-labelledby="submission-receipt-heading" className="mx-auto my-10 max-w-xl rounded-3xl border border-emerald-200 bg-white p-6 sm:p-9 shadow-sm">
    <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Received · pending review</p>
    <h1 id="submission-receipt-heading" className="mt-3 text-3xl font-black text-[#19352d]">{listingHref ? 'Correction received' : 'Submission received'}</h1>
    <p className="mt-4 text-sm leading-6 text-slate-600">{listingHref ? 'An editor will review your suggested change before updating the listing.' : 'Our team will review your submission before it can be published.'}</p>
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-sm font-bold text-slate-800">Request reference</h2>
      <code className="mt-2 block select-all break-all text-sm text-[#19352d]">{reference}</code>
      <p className="mt-2 text-xs text-slate-500">Keep this reference for follow-up.</p>
    </div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Link href={listingHref ?? '/'} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#19352d] px-5 py-3 text-sm font-bold text-white focus-visible:ring-2 focus-visible:ring-emerald-700">{listingHref ? 'Return to listing' : 'Back to MoHoLocal'}</Link>
      <button type="button" onClick={onAnother} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 focus-visible:ring-2 focus-visible:ring-emerald-700">{listingHref ? 'Suggest another change' : 'Submit another'}</button>
    </div>
  </section>
}
