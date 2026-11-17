import {UUID} from './directory-requests'

export type PetShareRecovery = {state:'saved';id:string}|{state:'missing'}

// A failed or malformed read is never evidence that a request is absent.
// Callers must use their authenticated owner-scoped query, not a service key.
export async function recoverPetShareReference(id:string,lookup:()=>PromiseLike<{data:unknown;error:unknown}>):Promise<PetShareRecovery> {
 if(!UUID.test(id))throw new Error('The recovery reference is invalid. Check Your shared reports for saved requests.')
 try {
  const {data,error}=await lookup()
  if(error)throw error
  if(data===null)return {state:'missing'}
  if(data&&typeof data==='object'&&!Array.isArray(data)&&'id' in data&&data.id===id)return {state:'saved',id}
  throw new Error('Unexpected recovery response')
 } catch {
  throw new Error('We could not check whether this request was saved. Nothing was resent. Keep this request and check again, or refresh Your shared reports below.')
 }
}
