'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Review {
  id: string
  rating: number
  comment: string
  reviewer_name: string
  created_at: string
}

interface Props {
  businessId: string
  businessName: string
  initialRating?: number
  initialCount?: number
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl leading-none focus:outline-none transition"
          aria-label={`${n} star`}
        >
          <span className={(hover || value) >= n ? 'text-amber-400' : 'text-gray-300'}>★</span>
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500 self-center">
        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hover || value]}
      </span>
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ago`
}

export default function ReviewSection({ businessId, businessName, initialRating, initialCount }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setAuthChecked(true)
    })
    loadReviews()
  }, [])

  async function loadReviews() {
    setLoading(true)
    const { data } = await supabase
      .from('reviews')
      .select('id, rating, comment, reviewer_name, created_at')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
    setReviews(data ?? [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    setSubmitError('')

    const reviewerName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Anonymous'

    const { error } = await supabase.from('reviews').insert({
      business_id: businessId,
      user_id: user.id,
      rating,
      comment: comment.trim(),
      reviewer_name: reviewerName,
    })

    if (error) {
      setSubmitError(error.message)
      setSubmitting(false)
    } else {
      setSubmitted(true)
      setShowForm(false)
      setComment('')
      setRating(5)
      setSubmitting(false)
      loadReviews()
    }
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : initialRating ?? 0
  const reviewCount = reviews.length || initialCount || 0

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Reviews</h2>
        {avgRating > 0 && (
          <span className="text-amber-500 text-sm font-semibold">
            ★ {avgRating.toFixed(1)} · {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Success banner */}
      {submitted && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          ✅ Thanks! Your review has been posted.
        </div>
      )}

      {/* Write a Review button */}
      {!showForm && (
        <div className="mb-5">
          {authChecked && !user ? (
            <p className="text-sm text-gray-500">
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                Sign in
              </Link>{' '}
              to write a review for {businessName}.
            </p>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700 transition"
            >
              ✍️ Write a Review
            </button>
          )}
        </div>
      )}

      {/* Review form */}
      {showForm && user && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">Your rating</p>
          <StarPicker value={rating} onChange={setRating} />

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Share your experience with ${businessName}…`}
            rows={4}
            className="mt-4 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          {submitError && (
            <p className="text-xs text-red-600 mt-2">{submitError}</p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={submitting}
              className="text-sm font-bold px-5 py-2 rounded-xl text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              {submitting ? 'Posting…' : 'Post Review'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setSubmitError('') }}
              className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-sm text-gray-400 italic">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400 italic">
          No reviews yet — be the first to share your experience!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-t border-gray-100 pt-4 first:border-0 first:pt-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                    {r.reviewer_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{r.reviewer_name}</span>
                </div>
                <span className="text-xs text-gray-400">{timeAgo(r.created_at)}</span>
              </div>
              <div className="flex text-amber-400 text-sm mb-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n}>{n <= r.rating ? '★' : '☆'}</span>
                ))}
              </div>
              {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
