'use client'
import {useEffect,useRef,useState} from 'react'
import {appendPetPhotos,promotePetPhoto} from '@/lib/pet-share-photos'

export default function PetPhotoPicker({photos,onChange,locked=false}:{photos:File[];onChange:(files:File[])=>void;locked?:boolean}) {
 const [previews,setPreviews]=useState<{file:File;url:string}[]>([])
 const [error,setError]=useState('')
 const [selectionNote,setSelectionNote]=useState('')
 const [unreadable,setUnreadable]=useState<File[]>([])
 const [reviewFile,setReviewFile]=useState<File|null>(null)
 const reviewDialog=useRef<HTMLDialogElement>(null)
 const reviewTrigger=useRef<HTMLButtonElement|null>(null)
 const input=useRef<HTMLInputElement>(null)
 useEffect(()=>{
  const urls=photos.map(file=>({file,url:URL.createObjectURL(file)}))
  setPreviews(urls);setUnreadable([])
  return()=>urls.forEach(item=>URL.revokeObjectURL(item.url))
 },[photos])
 useEffect(()=>{
  const dialog=reviewDialog.current
  if(!dialog)return
  if(reviewFile&&!locked&&photos.includes(reviewFile)&&previews.some(item=>item.file===reviewFile)&&!unreadable.includes(reviewFile)){
   if(!dialog.open)dialog.showModal()
  }else if(dialog.open)dialog.close()
 },[reviewFile,locked,photos,previews,unreadable])
 function closeReview(){
  setReviewFile(null)
  const trigger=reviewTrigger.current
  if(trigger?.isConnected&&!trigger.disabled)trigger.focus()
  else input.current?.focus()
 }
 function choose(files:File[]) {
  if(locked)return
  setSelectionNote('')
  const result=appendPetPhotos(photos,files)
  setError(result.error??'')
  if(!result.error&&files.length)onChange(result.files)
 }
 function remove(index:number) {
  if(locked)return
  setSelectionNote('Photo removed. Review the remaining previews before sending.')
  onChange(photos.filter((_,i)=>i!==index));setError('');input.current?.focus()
 }
 function useAsCover(index:number) {
  if(locked)return
  onChange(promotePetPhoto(photos,index));setError('');setSelectionNote('Cover photo changed. Review the first preview before sending.');input.current?.focus()
 }
 return <section aria-labelledby="pet-photos-heading" className="rounded-2xl border border-slate-300 bg-white p-4">
  <h2 id="pet-photos-heading" className="font-semibold">Photos (1–3)</h2>
  <p id="pet-photos-help" className="mt-2 text-sm text-slate-600">Preview your own photos before sending. JPG, PNG or WebP, up to 5 MB each. The first photo is the cover. Choose Use as cover photo on another preview to change it; other photos appear in the gallery after approval.</p>
  <label htmlFor="pet-photo-files" className="mt-3 block font-semibold text-sm">{photos.length?'Add photos':'Choose photos'}</label>
  <input ref={input} id="pet-photo-files" disabled={locked} type="file" multiple accept="image/jpeg,image/png,image/webp" aria-describedby="pet-photos-help pet-photos-selection" className="mt-1 min-h-11 w-full min-w-0 rounded-xl border border-slate-300 p-2 text-sm" onChange={event=>{choose(Array.from(event.target.files??[]));event.target.value=''}}/>
  <p id="pet-photos-selection" role="status" aria-atomic="true" className="mt-3 text-sm font-semibold">{photos.length} of 3 selected · {locked?'Selection locked for this request':'Not uploaded yet'}{!locked&&selectionNote&&<span className="mt-1 block font-normal">{selectionNote}</span>}</p>
  {error&&<p role="alert" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">{error}</p>}
  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{photos.map((file,index)=><figure key={`${index}-${file.name}-${file.lastModified}`} className="min-w-0 rounded-xl border border-slate-200 p-3">
   {previews.find(item=>item.file===file)&&!unreadable.includes(file)&&<img src={previews.find(item=>item.file===file)?.url} alt={`Selected photo ${index+1}`} className="h-40 w-full rounded-lg bg-slate-50 object-contain" onError={()=>setUnreadable(previous=>previous.includes(file)?previous:[...previous,file])}/>}
   {unreadable.includes(file)&&<p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm">This photo could not be previewed. Remove it and choose a readable JPG, PNG or WebP before sending.</p>}
   <figcaption className="mt-2 break-words text-sm"><span className="font-semibold">{index===0?'Cover photo':'Gallery photo'}</span><span className="mt-1 block break-all text-slate-600">{file.name}</span></figcaption>
   <button type="button" disabled={locked||unreadable.includes(file)||!previews.some(item=>item.file===file)} onClick={event=>{reviewTrigger.current=event.currentTarget;setReviewFile(file)}} aria-label={`Review photo ${index+1}`} aria-haspopup="dialog" className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-700">Review photo</button>
   {index>0&&<button type="button" disabled={locked} onClick={()=>useAsCover(index)} aria-label={`Use as cover photo: photo ${index+1}`} className="mt-3 min-h-11 w-full rounded-xl bg-[#1e3a5f] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-700">Use as cover photo</button>}
   <button type="button" disabled={locked} onClick={()=>remove(index)} aria-label={`Remove photo ${index+1}`} className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-700">Remove photo</button>
  </figure>)}</div>
  <dialog ref={reviewDialog} aria-labelledby="pet-photo-review-heading" aria-describedby="pet-photo-review-help" onClose={closeReview} className="max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-slate-300 bg-white p-4 text-slate-900 shadow-xl backdrop:bg-slate-950/60">
   <div className="sticky top-0 flex flex-wrap items-center justify-between gap-3 bg-white pb-3"><h2 id="pet-photo-review-heading" className="font-bold">Review selected photo</h2><button type="button" autoFocus onClick={()=>reviewDialog.current?.close()} className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 font-semibold focus-visible:ring-2 focus-visible:ring-emerald-700">Close preview</button></div>
   <p id="pet-photo-review-help" className="text-sm text-slate-600">Check for private addresses, phone numbers or other people’s details before sending. Close this preview and remove the photo if needed. This preview does not upload or publish it.</p>
   {reviewFile&&<><p className="mt-3 break-all text-sm font-semibold">{photos[0]===reviewFile?'Cover photo':'Gallery photo'} · {reviewFile.name}</p>{previews.find(item=>item.file===reviewFile)&&<img src={previews.find(item=>item.file===reviewFile)?.url} alt="Selected photo for review" className="mt-3 max-h-[55dvh] w-full rounded-lg bg-slate-50 object-contain"/>}</>}
  </dialog>
  <p className="mt-3 text-sm text-slate-600">Selecting photos only creates previews on this device. Upload starts when you send the report with publication permission. Avoid screenshots containing other people’s details. Original photo metadata is removed during preparation before upload.</p>
 </section>
}
