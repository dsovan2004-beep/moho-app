'use client'

import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { useState, useEffect, useCallback } from 'react'

// ── Config ─────────────────────────────────────────────────────────────────────

const REACTIONS = [
  { type: 'helpful',   emoji: '👍', label: 'Helpful'   },
  { type: 'love',      emoji: '❤️', label: 'Love'      },
  { type: 'funny',     emoji: '😂', label: 'Funny'     },
  { type: 'thanks',    emoji: '🙏', label: 'Thanks'    },
  { type: 'following', emoji: '👀', label: 'Following' },
] as const

type ReactionType = typeof REACTIONS[number]['type']

interface Props {
  postId: string
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function PostReactions({ postId }: Props) {
  const [counts, setCounts]       = useState<Record<string, number>>({})
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [signInNeeded, setSignInNeeded] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [pending, setPending]     = useState<string | null>(null)  // which type is in-flight

  // Fetch initial state from API
  const loadReactions = useCallback(async () => {
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      const res = await fetch(`/api/reactions?post_id=${encodeURIComponent(postId)}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      })
      if (!res.ok) return
      const json = await res.json()
      setCounts(json.counts ?? {})
      setMyReactions(new Set(json.myReactions ?? []))
    } catch {
      // Non-fatal — reactions are enhancement, not core UX
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => { loadReactions() }, [loadReactions])

  // Only confirmed account writes are accepted. Update from the saved result.
  async function handleReact(type: ReactionType) {
    if (pending) return
    setPending(type); setError(''); setSignInNeeded(false)
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession()
      if (!session?.access_token) { setSignInNeeded(true); return }
      const res = await fetch('/api/reactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ post_id: postId, reaction_type: type }),
      })
      const result = await res.json()
      if (!res.ok) {
        if (res.status === 401) setSignInNeeded(true)
        throw new Error(result.error || 'Reaction could not be saved.')
      }
      setCounts(result.counts ?? {})
      setMyReactions(new Set(result.myReactions ?? []))
    } catch (err) { setError(err instanceof Error ? err.message : 'Reactions unavailable.') }
    finally { setPending(null) }
  }

  if (loading) {
    return (
      <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-gray-100">
        {REACTIONS.map((r) => (
          <div
            key={r.type}
            className="h-9 w-20 bg-gray-100 rounded-full animate-pulse"
          />
        ))}
      </div>
    )
  }

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* Reaction buttons */}
      <div className="flex gap-2 flex-wrap">
        {REACTIONS.map((r) => {
          const count  = counts[r.type] ?? 0
          const active = myReactions.has(r.type)
          const busy   = pending === r.type

          return (
            <button
              key={r.type}
              onClick={() => handleReact(r.type)}
              disabled={!!pending}
              aria-label={`${active ? 'Remove' : 'Add'} ${r.label} reaction`}
              aria-pressed={active}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                'border transition-all select-none',
                // Tap feel on mobile
                'active:scale-95',
                active
                  ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                busy ? 'opacity-70' : '',
              ].join(' ')}
            >
              <span className="text-base leading-none">{r.emoji}</span>
              {/* Label hidden on very small screens, shown on sm+ */}
              <span className="hidden sm:inline text-xs">{r.label}</span>
              {count > 0 && (
                <span className={`text-xs font-semibold ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {signInNeeded && <p className="mt-2 text-sm"><Link className="underline" href={`/login?next=${encodeURIComponent(`/community/${postId}`)}`}>Sign in to react</Link></p>}
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
      {/* Total reactions summary */}
      {totalReactions > 0 && (
        <p className="mt-2 text-xs text-gray-400">
          {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
        </p>
      )}
    </div>
  )
}
