import { createClient } from '@supabase/supabase-js'
import { RequestError } from './directory-requests'

export function publicServerClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function confirmedServerClient(req: Request) {
  const bearer = req.headers.get('authorization')
  if (!bearer?.startsWith('Bearer ') || bearer.length < 20) throw new RequestError('Sign in with a confirmed email to continue.', 401)
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: bearer } }, auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user }, error } = await client.auth.getUser(bearer.slice(7))
  if (error || !user?.email_confirmed_at || user.is_anonymous) throw new RequestError('Sign in with a confirmed email to continue.', 401)
  return client
}
