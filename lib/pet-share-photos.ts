export const PET_PHOTO_LIMIT=3
export const PET_PHOTO_MAX_BYTES=5*1024*1024
export const PET_PHOTO_TYPES=['image/jpeg','image/png','image/webp'] as const

type PhotoFile=Pick<File,'name'|'size'|'type'>
// A failed selection preserves the current set; nothing is uploaded here.
export function appendPetPhotos<T extends PhotoFile>(current:readonly T[],incoming:readonly T[]):{files:T[];error:string|null} {
 if(incoming.length===0)return {files:[...current],error:null}
 if(current.length+incoming.length>PET_PHOTO_LIMIT)return {files:[...current],error:'Choose up to 3 photos total. Remove a selected photo before adding another.'}
 if(incoming.some(file=>!(PET_PHOTO_TYPES as readonly string[]).includes(file.type)))return {files:[...current],error:'Use JPG, PNG or WebP photos. This selection was not added; your earlier photos are unchanged.'}
 if(incoming.some(file=>file.size<=0||file.size>PET_PHOTO_MAX_BYTES))return {files:[...current],error:'Each photo must be a nonempty file up to 5 MB. This selection was not added; your earlier photos are unchanged.'}
 return {files:[...current,...incoming],error:null}
}
