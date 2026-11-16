'use client'
import {useEffect,useRef,useState} from 'react'
import {appendPetPhotos} from '@/lib/pet-share-photos'

export default function PetPhotoPicker({photos,onChange,locked=false}:{photos:File[];onChange:(files:File[])=>void;locked?:boolean}) {
 const [previews,setPreviews]=useState<{file:File;url:string}[]>([])
 const [error,setError]=useState('')
 const [unreadable,setUnreadable]=useState<File[]>([])
 const input=useRef<HTMLInputElement>(null)
 useEffect(()=>{
  const urls=photos.map(file=>({file,url:URL.createObjectURL(file)}))
  setPreviews(urls);setUnreadable([])
  return()=>urls.forEach(item=>URL.revokeObjectURL(item.url))
 },[photos])
 function choose(files:File[]) {
  const result=appendPetPhotos(photos,files)
  setError(result.error??'')
  if(!result.error&&files.length)onChange(result.files)
 }
 function remove(index:number) {
  onChange(photos.filter((_,i)=>i!==index));setError('');input.current?.focus()
 }
 return <section aria-labelledby="pet-photos-heading" className="rounded-2xl border border-slate-300 bg-white p-4">
  <h2 id="pet-photos-heading" className="font-semibold">Photos (1–3)</h2>
  <p id="pet-photos-help" className="mt-2 text-sm text-slate-600">Preview your own photos before sending. JPG, PNG or WebP, up to 5 MB each. The first photo is the cover; other photos appear in the gallery after approval.</p>
  <label htmlFor="pet-photo-files" className="mt-3 block font-semibold text-sm">{photos.length?'Add photos':'Choose photos'}</label>
  <input ref={input} id="pet-photo-files" type="file" multiple accept="image/jpeg,image/png,image/webp" aria-describedby="pet-photos-help pet-photos-selection" className="mt-1 min-h-11 w-full min-w-0 rounded-xl border border-slate-300 p-2 text-sm" onChange={event=>{choose(Array.from(event.target.files??[]));event.target.value=''}}/>
  <p id="pet-photos-selection" role="status" aria-atomic="true" className="mt-3 text-sm font-semibold">{photos.length} of 3 selected · {locked?'Selection locked for this request':'Not uploaded yet'}</p>
  {error&&<p role="alert" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">{error}</p>}
  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">{photos.map((file,index)=><figure key={`${index}-${file.name}-${file.lastModified}`} className="min-w-0 rounded-xl border border-slate-200 p-3">
   {previews.find(item=>item.file===file)&&!unreadable.includes(file)&&<img src={previews.find(item=>item.file===file)?.url} alt={`Selected photo ${index+1}`} className="h-40 w-full rounded-lg bg-slate-50 object-contain" onError={()=>setUnreadable(previous=>previous.includes(file)?previous:[...previous,file])}/>}
   {unreadable.includes(file)&&<p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm">This photo could not be previewed. Remove it and choose a readable JPG, PNG or WebP before sending.</p>}
   <figcaption className="mt-2 break-words text-sm"><span className="font-semibold">{index===0?'Cover photo':'Gallery photo'}</span><span className="mt-1 block break-all text-slate-600">{file.name}</span></figcaption>
   <button type="button" onClick={()=>remove(index)} aria-label={`Remove photo ${index+1}`} className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-emerald-700">Remove photo</button>
  </figure>)}</div>
  <p className="mt-3 text-sm text-slate-600">Selecting photos only creates previews on this device. Upload starts when you send the report with publication permission. Avoid screenshots containing other people’s details. Original photo metadata is removed during preparation before upload.</p>
 </section>
}
