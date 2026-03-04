'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  'General', 'Recommendations', 'For Sale', 'Free Items',
  'Jobs', 'Services', 'Safety', 'Neighbors', 'Question',
]

const CITIES = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca']

interface Props {
  currentCity?: string
}

export default function CommunityNewPost({ currentCity }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('General')
  const [city, setCity] = useState(
    currentCity && currentCity !== 'All Cities' ? currentCity : 'Mountain House'
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleOpen() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
    setTitle('')
    setContent('')
    setCategory('General')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const authorName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Anonymous'

    const { error } = await supabase.from('community_posts').insert({
      title: title.trim(),
      content: content.trim(),
      category,
      city,
      author_name: authorName,
      user_id: user.id,
      likes: 0,
      reply_count: 0,
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      handleClose()
      setSubmitting(false)
      router.refresh()
    }
  }

  return (
    <>
      {/* + New Post button */}
      <button
        onClick={handleOpen}
        className="shrink-0 text-sm font-bold px-5 py-2 rounded-full transition hover:opacity-90"
        style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
      >
        + New Post
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create a Post</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-700 text-2xl leading-none transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

              {/* City + Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  >
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  required
                  maxLength={120}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Body <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add more details, links, or context…"
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="flex-1 text-sm font-bold py-2.5 rounded-xl text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#1e3a5f' }}
                >
                  {submitting ? 'Posting…' : 'Post to Community'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-sm px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
