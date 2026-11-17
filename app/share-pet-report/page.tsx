'use client'
import {useRef,useState} from 'react'
import Link from 'next/link'
import MyPetShares from '@/app/components/MyPetShares'
import PetPhotoPicker from '@/app/components/PetPhotoPicker'
import PetShareSendProgress from '@/app/components/PetShareSendProgress'
import PetRequestReference from '@/app/components/PetRequestReference'
import {sendPetSharePhotos,petShareSendMessage,type PetShareSendProgress as SendProgress} from '@/lib/pet-share-send'
import {UUID} from '@/lib/directory-requests'
import {recoverPetShareReference} from '@/lib/pet-share-recovery'
import {getSupabaseClient} from '@/lib/supabase'
import {RELAUNCH_CITY_NAMES} from '@/lib/cities'
import {RequestAccount,useRequestAccount} from '@/app/components/RequestAccount'
import {facebookReportUrl,PET_SHARE_PERMISSION,PET_SHARE_PERMISSION_VERSION,validatePetShare} from '@/lib/pet-share'

// Re-encode pixels so uploaded files do not retain EXIF/GPS metadata or active content.
async function preparePhoto(file:File):Promise<Blob>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('Use JPG, PNG or WebP files, up to 5 MB each.')
 const bitmap=await createImageBitmap(file)
 try{if(bitmap.width*bitmap.height>40000000)throw new Error('This image is too large. Please choose a smaller photo.')
 const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale)
 const context=canvas.getContext('2d');if(!context)throw new Error('Photo preparation unavailable.');context.drawImage(bitmap,0,0,canvas.width,canvas.height)
 return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not prepare this photo.')),'image/jpeg',0.85))
 }finally{bitmap.close()}
}
export default function SharePetReport(){
 const {user,checking}=useRequestAccount();const [city,setCity]=useState('');const [status,setStatus]=useState('lost');const [title,setTitle]=useState('');const [description,setDescription]=useState('');const [sourceUrl,setSourceUrl]=useState('');const [reportDate,setReportDate]=useState('');const [credit,setCredit]=useState('');const [permission,setPermission]=useState(false);const [photos,setPhotos]=useState<File[]>([])
 const requestOwner=useRef<string|null>(null);const inFlight=useRef(false);const [progress,setProgress]=useState<SendProgress|null>(null)
 const [frozen,setFrozen]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [reference,setReference]=useState('');const [requestId]=useState(()=>crypto.randomUUID());const [uncertain,setUncertain]=useState(false);const [canRetry,setCanRetry]=useState(false);const [notice,setNotice]=useState('')
 async function submit(e:React.FormEvent){
  e.preventDefault();if(!user||inFlight.current)return
  if(requestOwner.current&&requestOwner.current!==user.id){setNotice('');setCanRetry(false);setError('This request was started with a different account. Sign back in to that account to check its reference.');return}
  const validation=validatePetShare({city,status,title,description,sourceUrl,reportDate,credit,permission})
  if(!uncertain&&(validation||photos.length<1||photos.length>3)){setError(validation??'Choose one to three photos.');return}
  inFlight.current=true;setBusy(true);setError('');setNotice('')
  let persistenceUncertain=uncertain
  try {
   const supabase=getSupabaseClient()
   if(uncertain){
    setProgress({phase:'checking'})
    const result=await recoverPetShareReference(requestId,()=>supabase.from('pet_report_shares').select('id').eq('id',requestId).eq('submitted_by',user.id).maybeSingle())
    if(result.state==='saved'){setReference(result.id);setUncertain(false);setCanRetry(false);return}
    if(!canRetry){setCanRetry(true);setNotice('No saved request was found for this account at this check. Nothing was resent. You can retry this same request below; we will check again before sending.');return}
   }
   if(validation||photos.length<1||photos.length>3)throw new Error(validation??'Choose one to three photos.')
   requestOwner.current=user.id
   setCanRetry(false)
   const paths:string[]=[]
   await sendPetSharePhotos(photos,{
    prepare:preparePhoto,onPrepared:()=>setFrozen(true),onProgress:setProgress,
    upload:async(blob,index)=>{
     const path=`${user.id}/${requestId}/${index}.jpg`
     const {error:uploadError}=await supabase.storage.from('pet-share-pending').upload(path,blob,{contentType:'image/jpeg',upsert:false})
     if(uploadError&&!uploadError.message.toLowerCase().includes('already exists'))throw uploadError
     paths.push(path)
    },
   })
   setProgress({phase:'saving'});persistenceUncertain=true
   const {data,error:saveError}=await supabase.rpc('submit_pet_share',{p:{id:requestId,city,status,title:title.trim(),description:description.trim(),facebook_url:facebookReportUrl(sourceUrl),report_date:reportDate,credit:credit.trim(),permission,permission_version:PET_SHARE_PERMISSION_VERSION,photo_paths:paths}})
   if(saveError)throw new Error(saveError.code==='P0001'?'Daily submission limit reached. Try tomorrow.':'Could not confirm the saved request. Check this request before retrying.')
   if(typeof data!=='string'||!UUID.test(data))throw new Error('Could not confirm the saved request. Check this request before retrying.')
   setReference(data);setUncertain(false)
  } catch(e){setCanRetry(false);setUncertain(persistenceUncertain);setError(e instanceof Error?e.message:'Submission unavailable. Your details remain here.')}
  finally{inFlight.current=false;setBusy(false);setProgress(null)}
 }

 const input='mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2'
 return <div className="max-w-2xl mx-auto px-4 py-8"><Link href="/lost-and-found" className="inline-flex min-h-11 items-center underline">← Pet reports</Link><h1 className="mt-4 text-3xl font-bold">Share your existing pet report</h1><p className="mt-3 text-slate-600">Already posted on Facebook? Submit your own report and photos here for review. We do not fetch Facebook content, contact anyone or post to Facebook.</p>
 {reference?<section className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-5" role="status"><h2 className="font-bold">Request saved</h2><PetRequestReference reference={reference}/><p className="mt-2">Your photos remain private while pending. Check Your shared reports below for the latest review status; recovering a reference does not mean a report was approved.</p><a href="#your-shared-reports" className="mt-2 flex min-h-11 items-center font-semibold underline">Check this request’s status ↓</a><Link href="/lost-and-found" className="inline-flex min-h-11 items-center underline">Return to pet reports →</Link></section>:<>
 {!user&&!checking&&<div className="mt-5"><RequestAccount returnTo="/share-pet-report"/></div>}
 <form onSubmit={submit} aria-busy={busy} className="mt-6"><fieldset disabled={!user||checking||busy} className="space-y-5">
 <fieldset disabled={frozen} className="space-y-5"><label className="block font-semibold">City<select required className={input} value={city} onChange={e=>setCity(e.target.value)}><option value="">Choose city</option>{RELAUNCH_CITY_NAMES.map(c=><option key={c}>{c}</option>)}</select></label>
 <label className="block font-semibold">Facebook report link<input required type="url" maxLength={2000} className={input} value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)}/><span className="block text-sm font-normal mt-1">The link will be public after approval. Do not share a private-group link without permission.</span></label>
 <label className="block font-semibold">Original report date<input required type="date" className={input} value={reportDate} max={new Date().toISOString().slice(0,10)} onChange={e=>setReportDate(e.target.value)}/></label>
 <label className="block font-semibold">Current recorded status<select className={input} value={status} onChange={e=>setStatus(e.target.value)}><option value="lost">Lost</option><option value="found">Found / sighting</option><option value="reunited">Reunited</option></select></label>
 <label className="block font-semibold">Pet description / title<input required minLength={5} maxLength={200} className={input} value={title} onChange={e=>setTitle(e.target.value)}/></label>
 <label className="block font-semibold">Report details<textarea required maxLength={4000} rows={5} className={input} value={description} onChange={e=>setDescription(e.target.value)}/><span className="block text-sm font-normal mt-1">Include when and where seen using a neighborhood or public landmark. Say whether this is a sighting or the animal is secured. Keep private addresses, phone numbers and sensitive ownership evidence out.</span></label>
 <PetPhotoPicker photos={photos} onChange={setPhotos} locked={frozen}/>
 <label className="block font-semibold">Public photo credit<input required maxLength={120} className={input} placeholder="Photographer name or permitted credit" value={credit} onChange={e=>setCredit(e.target.value)}/></label>
 <label className="flex gap-3 rounded-xl border border-slate-300 p-4 text-sm"><input required type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={permission} onChange={e=>setPermission(e.target.checked)}/><span>{PET_SHARE_PERMISSION}</span></label>
 <p className="text-sm text-slate-600">Permission is for this submitted report and photos only. It does not authorize importing anyone else’s content. No matching or reunion is confirmed by submission.</p>
 </fieldset>
 {frozen&&<p className="text-sm">Details are locked while this request is saved or recovered. Retry with the same request; reload only to start a different report.</p>}
 {notice&&<p role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm">{notice}</p>}
 {uncertain&&<div className="rounded-xl border border-slate-300 p-4 text-sm"><PetRequestReference reference={requestId} unconfirmed/><a href="#your-shared-reports" className="mt-2 inline-flex min-h-11 items-center font-semibold underline">Check Your shared reports ↓</a></div>}
 {error&&<p role="alert" className="rounded-xl bg-amber-50 border border-amber-300 p-4">{error}{uncertain&&' Avoid starting another request. Use Check saved request to recover this one.'}</p>}
 <PetShareSendProgress progress={busy?progress:null}/>
 <p className="text-sm text-slate-600">Photos are prepared one at a time on your device, then uploaded privately. Keep this page open while sending.</p>
 <p className="text-sm text-slate-600">If sending is unconfirmed, Check saved request looks for your existing reference without uploading photos or resending the report. You choose whether to retry if no saved request is found.</p>
 <button type="submit" className="min-h-11 w-full rounded-xl bg-[#1e3a5f] px-4 py-3 font-bold text-white disabled:opacity-50" disabled={busy||!permission}>{busy?(progress?petShareSendMessage(progress):'Starting…'):uncertain?(canRetry?'Retry this same request':'Check saved request'):'Send report for review'}</button>
 </fieldset></form></>}
 {user&&<MyPetShares key={user.id} userId={user.id} refresh={reference}/>}
 </div>
}
