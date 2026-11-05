export const runtime = 'nodejs'

import { RequestError, readRequest, UUID } from '@/lib/directory-requests'
import { confirmedServerClient, publicServerClient } from '@/lib/server-session'

const TYPES = ['helpful', 'love', 'funny', 'thanks', 'following']
const headers = { 'Cache-Control': 'private, no-store' }
function failure(error: unknown) {
  return Response.json({ error: error instanceof RequestError ? error.message : 'Reactions are temporarily unavailable.' },
    { status: error instanceof RequestError ? error.status : 503, headers })
}

export async function GET(req: Request) {
  try {
    const postId = new URL(req.url).searchParams.get('post_id')
    if (!postId || !UUID.test(postId)) throw new RequestError('A valid post ID is required.')
    if (req.headers.has('authorization')) {
      const client = await confirmedServerClient(req)
      const { data, error } = await client.rpc('my_reaction_state', { p_post_id: postId })
      if (error) throw new RequestError('This published post is unavailable.', error.code === '22023' ? 404 : 503)
      return Response.json(data, { headers })
    }
    const { data, error } = await publicServerClient().from('reaction_counts').select('reaction_type,count').eq('post_id', postId)
    if (error) throw new RequestError('Reaction counts could not be loaded.', 503)
    const counts = Object.fromEntries((data ?? []).map(row => [row.reaction_type, row.count]))
    return Response.json({ counts, myReactions: [] }, { headers })
  } catch (error) { return failure(error) }
}

export async function POST(req: Request) {
  try {
    const client = await confirmedServerClient(req)
    const body = await readRequest(req) as Record<string, unknown>
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !['post_id', 'reaction_type'].includes(key)) ||
        typeof body.post_id !== 'string' || !UUID.test(body.post_id) || typeof body.reaction_type !== 'string' || !TYPES.includes(body.reaction_type)) {
      throw new RequestError('A valid post and reaction are required.')
    }
    const { data, error } = await client.rpc('toggle_account_reaction', { p_post_id: body.post_id, p_type: body.reaction_type })
    if (error) throw new RequestError(error.code === 'P0001' ? 'Reaction limit reached. Please try again later.' : 'This reaction could not be saved.',
      error.code === 'P0001' ? 429 : error.code === '42501' ? 403 : error.code === '22023' ? 404 : 503)
    return Response.json(data, { headers })
  } catch (error) { return failure(error) }
}
