import {PET_PHOTO_LIMIT} from './pet-share-photos'

export type PetShareSendProgress =
 | {phase:'preparing'|'uploading';photo:number;total:number}
 | {phase:'saving'}
 | {phase:'checking'}

export function petShareSendMessage(progress:PetShareSendProgress):string {
 if(progress.phase==='checking')return 'Checking for your saved request…'
 if(progress.phase==='saving')return 'Saving your request for review…'
 return progress.phase==='preparing'
  ? `Preparing photo ${progress.photo} of ${progress.total} on this device…`
  : `Uploading photo ${progress.photo} of ${progress.total} privately…`
}

// Decode/re-encode only one source image at a time. Finish ALL preparation before
// uploading anything, so an unreadable later image cannot leave partial uploads.
export async function sendPetSharePhotos<FileType,Prepared>(files:readonly FileType[],operations:{
 prepare:(file:FileType)=>Promise<Prepared>
 upload:(prepared:Prepared,index:number)=>Promise<void>
 onPrepared:()=>void
 onProgress:(progress:PetShareSendProgress)=>void
}):Promise<void> {
 if(files.length<1||files.length>PET_PHOTO_LIMIT)throw new Error('Choose one to three photos before sending.')
 const prepared:Prepared[]=[]
 for(let i=0;i<files.length;i++) {
  operations.onProgress({phase:'preparing',photo:i+1,total:files.length})
  try {prepared.push(await operations.prepare(files[i]))}
  catch {throw new Error(`Photo ${i+1} could not be prepared. No uploads started in this attempt. Your selected photos remain here; use readable JPG, PNG or WebP files up to 5 MB each.`)}
 }
 operations.onPrepared()
 for(let i=0;i<prepared.length;i++) {
  operations.onProgress({phase:'uploading',photo:i+1,total:prepared.length})
  try {await operations.upload(prepared[i],i)}
  catch {throw new Error(`Photo ${i+1} upload could not be confirmed. Report saving did not start in this attempt. Retry this same request with the same photos.`)}
 }
}
