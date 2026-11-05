import { getSupabaseClient } from './supabase'

export async function reviewBusiness(id: string, action: 'approve' | 'reject' | 'unpublish') {
  const note = window.prompt('Record what you checked or the reason for this decision (at least 10 characters).')
  if (!note || note.trim().length < 10) return false
  const evidence = action === 'approve'
    ? window.prompt('Public business website or official registry URL used to check these details:') : null
  if (action === 'approve' && !evidence) return false
  const { data, error } = await getSupabaseClient().rpc('review_existing_business', {
    p_id: id, p_action: action, p_note: note.trim(), p_evidence_url: evidence,
  })
  if (error || data !== id) throw new Error(error?.message || 'No saved moderation decision was returned.')
  return true
}
