export const runtime = 'edge'

import { supabase, type CommunityPost } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CommunityReplySection from '@/app/components/CommunityReplySection'

interface PageProps {
  params: Promise<{ id: string }>
}

const CATEGORY_COLORS: Record<string, string> = {
  General: 'bg-gray-100 text-gray-700',
  Recommendations: 'bg-blue-100 text-blue-700',
  'For Sale': 'bg-green-100 text-green-700',
  'Free Items': 'bg-teal-100 text-teal-700',
  Jobs: 'bg-purple-100 text-purple-700',
  Services: 'bg-indigo-100 text-indigo-700',
  Safety: 'bg-red-100 text-red-700',
  Neighbors: 'bg-amber-100 text-amber-700',
  Question: 'bg-orange-100 text-orange-700',
}

const CITY_COLORS: Record<string, string> = {
  'Mountain House': 'bg-blue-50 text-blue-700',
  Tracy: 'bg-green-50 text-green-700',
  Lathrop: 'bg-purple-50 text-purple-700',
  Manteca: 'bg-orange-50 text-orange-700',
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

async function getPost(id: string) {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as CommunityPost
}

export default async function CommunityPostPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPost(id)
  if (!post) notFound()

  const catColor = CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-700'
  const cityColor = CITY_COLORS[post.city] ?? 'bg-gray-50 text-gray-600'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-5 flex items-center gap-2">
        <Link href="/community" className="hover:text-blue-600 transition">Community Board</Link>
        <span>›</span>
        <span className="text-gray-600 truncate">{post.title}</span>
      </nav>

      {/* Post card */}
      <article className="bg-white rounded-2xl border border-gray-200 p-6 mb-2">

        {/* Author row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold">
            {post.author_name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-800">{post.author_name}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cityColor}`}>
                {post.city}
              </span>
              <span className="text-gray-400 text-xs">{timeAgo(post.created_at)}</span>
            </div>
            <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${catColor}`}>
              {post.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-extrabold text-gray-900 mb-3">{post.title}</h1>

        {/* Body */}
        {post.content && (
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>
        )}

        {/* Photo */}
        {post.image_url && (
          <div className="rounded-xl overflow-hidden border border-gray-100 mb-4">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            💬 <span>{post.reply_count ?? 0} replies</span>
          </span>
          <span className="flex items-center gap-1">
            👍 <span>{post.likes ?? 0}</span>
          </span>
        </div>
      </article>

      {/* Replies */}
      <CommunityReplySection
        postId={post.id}
        initialReplyCount={post.reply_count}
      />

      {/* Back link */}
      <div className="mt-8">
        <Link
          href={`/community?city=${encodeURIComponent(post.city)}`}
          className="text-sm text-gray-400 hover:text-blue-600 transition"
        >
          ← Back to Community Board
        </Link>
      </div>
    </div>
  )
}
