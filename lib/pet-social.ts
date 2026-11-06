import { getSupabaseClient } from './supabase'
export async function petAction(action:string,payload:Record<string,unknown>) {
  const {data,error}=await getSupabaseClient().rpc('pet_social_action',{action,payload})
  if(error) throw new Error(['22023','42501','P0001'].includes(error.code) ? error.message : 'We could not save this action. Please retry.')
  return data as Record<string,unknown>
}
export function socialDate(value:string){return new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Los_Angeles'}).format(new Date(value))}
