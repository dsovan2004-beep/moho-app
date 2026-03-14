'use client'

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
  const [loading, setLoading]     = useState(true)
  const [pending, setPending]     = useState<string | null>(null)  // which type is in-flight

  // Fetch initial state from API
  const loadReactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/reactions?post_id=${encodeURIComponent(postId)}`)
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

  // Toggle a reaction with optimistic UI
  async function handleReact(type: ReactionType) {
    if (pending) return  // debounce concurrent taps

    const alreadyReacted = myReactions.has(type)

    // Optimistic update
    setPending(type)
    setCounts((prev) => ({
      ...prev,
      [type]: Math.max(0, (prev[type] ?? 0) + (alreadyReacted ? -1 : 1)),
    }))
    setMyReactions((prev) => {
      const next = new Set(prev)
      alreadyReacted ? next.delete(type) : next.add(type)
      return next
    })

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, reaction_type: type }),
      })
      if (res.ok) {
        const json = await res.json()
        // Sync with authoritative server counts
        if (json.counts) {
          setCounts(json.counts)
        }
      } else {
        // Roll back optimistic update on error
        await loadReactions()
      }
    } catch {
      await loadReactions()
    } finally {
      setPending(null)
    }
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

      {/* Total reactions summary */}
      {totalReactions > 0 && (
        <p className="mt-2 text-xs text-gray-400">
          {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
        </p>
      )}
    </div>
  )
}
