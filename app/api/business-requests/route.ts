export const runtime = 'nodejs'

import { createClient } from '@supabase/supabase-js'
import { RequestError, readRequest, validateRequest } from '@/lib/directory-requests'

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')
    if (!token?.startsWith('Bearer ') || token.length < 20) throw new RequestError('Sign in to send a request.', 401)
    const body = validateRequest(await readRequest(req))
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: token } }, auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: { user }, error: authError } = await supabase.auth.getUser(token.slice(7))
    if (authError || !user || !user.email_confirmed_at || user.is_anonymous) throw new RequestError('Sign in with a confirmed email to send a request.', 401)
    const { data: id, error } = await supabase.rpc('create_business_request', {
      p_kind: body.kind, p_business_id: body.businessId, p_payload: body.payload, p_key: body.requestKey,
    })
    if (error) {
      if (error.code === '42501') throw new RequestError('Your account cannot send this request.', 403)
      if (error.code === 'P0001') throw new RequestError('Daily request limit reached. Try again tomorrow.', 429)
      if (error.code === '23505') throw new RequestError('This listing already has an owner or the request was already reviewed.', 409)
      if (error.code === '22023') throw new RequestError('Check your details and confirm the listing is still available.')
      console.error('[business-requests] save failed', error.code)
      throw new RequestError('We could not save your request. Please try again.', 503)
    }
    if (typeof id !== 'string') throw new RequestError('We could not confirm your request was saved. Please retry.', 503)
    const { data: saved, error: receiptError } = await supabase.from('business_requests')
      .select('id,status').eq('id', id).single()
    if (receiptError || saved?.id !== id) throw new RequestError('We could not confirm your saved request. Please retry.', 503)
    if (saved.status !== 'pending') throw new RequestError('This request was already reviewed. Check My business requests for its current status.', 409)
    return Response.json({ id, status: 'pending' }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const known = error instanceof RequestError
    return Response.json({ error: known ? error.message : 'Request unavailable. Please try again.' }, {
      status: known ? error.status : 503, headers: { 'Cache-Control': 'no-store' },
    })
  }
}
