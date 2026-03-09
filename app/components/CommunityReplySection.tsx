'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'

interface Reply {
  id: string
  author_name: string
  content: string
  created_at: string
}

interface Props {
  postId: string
  initialReplyCount?: number
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function CommunityReplySection({ postId, initialReplyCount }: Props) {
  const router = useRouter()
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setAuthChecked(true)
    })
    loadReplies()
  }, [])

  async function loadReplies() {
    const supabase = getSupabaseClient()
    setLoading(true)
    const { data } = await supabase
      .from('community_replies')
      .select('id, author_name, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setReplies(data ?? [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    const supabase = getSupabaseClient()
    e.preventDefault()
    if (!content.trim() || !user) return
    setSubmitting(true)
    setError('')

    const authorName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Anonymous'

    const { error } = await supabase.from('community_replies').insert({
      post_id: postId,
      user_id: user.id,
      author_name: authorName,
      content: content.trim(),
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      setContent('')
      setSubmitted(true)
      setSubmitting(false)
      loadReplies()
      router.refresh()
    }
  }

  const replyCount = replies.length || initialReplyCount || 0

  return (
    <div className="mt-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        💬 {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
      </h2>

      {/* Success banner */}
      {submitted && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          ✅ Reply posted!
        </div>
      )}

      {/* Reply form */}
      {authChecked && (
        user ? (
          <form onSubmit={handleSubmit} className="mb-6 bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-xs">
                {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write a reply…"
                  rows={3}
                  required
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="text-sm font-bold px-5 py-2 rounded-xl text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#1e3a5f' }}
                  >
                    {submitting ? 'Posting…' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-6 bg-gray-50 rounded-2xl border border-gray-200 px-5 py-4 text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
            {' '}to join the conversation.
          </div>
        )
      )}

      {/* Replies list */}
      {loading ? (
        <p className="text-sm text-gray-400 italic">Loading replies…</p>
      ) : replies.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No replies yet — be the first to comment!</p>
      ) : (
        <div className="space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-xs">
                {reply.author_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800">{reply.author_name}</span>
                  <span className="text-xs text-gray-400">{timeAgo(reply.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
