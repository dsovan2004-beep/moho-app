import React from 'react'
import {petShareSendMessage,type PetShareSendProgress as Progress} from '@/lib/pet-share-send'

export default function PetShareSendProgress({progress}:{progress:Progress|null}) {
 return <div role="status" aria-live="polite" aria-atomic="true">{progress&&<section aria-label="Sending progress" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm">
  <p className="font-semibold">{petShareSendMessage(progress)}</p>
  <p className="mt-2">{progress.phase==='checking'?'This check only looks for your saved request reference. It does not upload photos or resend the report.':'Keep this page open. Uploading photos does not publish a report; a saved request reference is needed to confirm receipt, and an editor reviews it before publication.'}</p>
 </section>}</div>
}
