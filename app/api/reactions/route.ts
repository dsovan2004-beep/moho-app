export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────────

const VALID_TYPES = ['helpful', 'love', 'funny', 'thanks', 'following'] as const
type ReactionType = typeof VALID_TYPES[number]

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Get client IP from Cloudflare or standard proxy headers */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '0.0.0.0'
  )
}

/** One-way hash of IP for privacy-preserving duplicate prevention */
async function hashIp(ip: string): Promise<string> {
  const salt = 'moho-reactions-v1'
  const data = new TextEncoder().encode(ip + salt)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ── GET /api/reactions?post_id=<uuid> ─────────────────────────────────────────
// Returns: { counts: Record<string,number>, myReactions: string[] }

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('post_id')
  if (!postId) {
    return NextResponse.json({ error: 'Missing post_id' }, { status: 400 })
  }

  const supabase = getSupabaseClient()
  const ipHash = await hashIp(getClientIp(req))

  // Fetch all reactions for this post in one query
  const { data, error } = await supabase
    .from('post_reactions')
    .select('reaction_type, ip_hash')
    .eq('post_id', postId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const counts: Record<string, number> = {}
  const myReactions: string[] = []

  for (const row of data ?? []) {
    counts[row.reaction_type] = (counts[row.reaction_type] ?? 0) + 1
    if (row.ip_hash === ipHash) {
      myReactions.push(row.reaction_type)
    }
  }

  return NextResponse.json({ counts, myReactions }, {
    headers: {
      // Short cache — reactions update in near-real-time
      'Cache-Control': 'private, max-age=0, no-store',
    },
  })
}

// ── POST /api/reactions ────────────────────────────────────────────────────────
// Body: { post_id: string, reaction_type: string }
// Returns: { action: 'added'|'removed', counts: Record<string,number> }

export async function POST(req: NextRequest) {
  let body: { post_id?: string; reaction_type?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { post_id, reaction_type } = body

  if (!post_id || !reaction_type) {
    return NextResponse.json({ error: 'Missing post_id or reaction_type' }, { status: 400 })
  }
  if (!VALID_TYPES.includes(reaction_type as ReactionType)) {
    return NextResponse.json({ error: 'Invalid reaction_type' }, { status: 400 })
  }

  const supabase = getSupabaseClient()
  const ipHash = await hashIp(getClientIp(req))

  // Call the toggle_reaction RPC (SECURITY DEFINER — handles insert/delete atomically)
  const { data, error } = await supabase.rpc('toggle_reaction', {
    p_post_id:       post_id,
    p_reaction_type: reaction_type,
    p_ip_hash:       ipHash,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // RPC returns a single row: { action, counts }
  const result = Array.isArray(data) ? data[0] : data
  return NextResponse.json({
    action: result?.action ?? 'error',
    counts: result?.counts ?? {},
  })
}
