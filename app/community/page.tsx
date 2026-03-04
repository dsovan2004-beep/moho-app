export const runtime = 'edge'

import { supabase, type CommunityPost } from '@/lib/supabase'
import Link from 'next/link'
import CommunityNewPost from '@/app/components/CommunityNewPost'

const CITIES = ['All Cities', 'Mountain House', 'Tracy', 'Lathrop', 'Manteca']

const CATEGORIES = [
  'All', 'General', 'Recommendations', 'For Sale', 'Free Items',
  'Jobs', 'Services', 'Safety', 'Neighbors', 'Question',
]

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

interface PageProps {
  searchParams: Promise<{ city?: string; category?: string }>
}

async function getPosts(city?: string, category?: string) {
  let req = supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (city && city !== 'All Cities') {
    req = req.eq('city', city)
  }
  if (category && category !== 'All') {
    req = req.eq('category', category)
  }

  const { data, error } = await req
  if (error) console.error(error)
  return (data ?? []) as CommunityPost[]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function PostCard({ post }: { post: CommunityPost }) {
  const catColor = CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-700'
  const cityColor = CITY_COLORS[post.city] ?? 'bg-gray-50 text-gray-600'

  return (
    <Link href={`/community/${post.id}`} className="block">
    <article className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
          {post.author_name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-gray-800 text-sm">{post.author_name}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cityColor}`}>
              {post.city}
            </span>
            <span className="text-gray-400 text-xs">{timeAgo(post.created_at)}</span>
          </div>

          {/* Category badge */}
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${catColor}`}>
            {post.category}
          </span>

          {/* Title + Content */}
          <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>

          {/* Photo */}
          {(post as any).image_url && (
            <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
              <img
                src={(post as any).image_url}
                alt={post.title}
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            {post.reply_count !== undefined && (
              <span className="flex items-center gap-1">
                💬 <span>{post.reply_count} replies</span>
              </span>
            )}
            {post.likes !== undefined && (
              <span className="flex items-center gap-1">
                👍 <span>{post.likes}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
    </Link>
  )
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const params = await searchParams
  const city = params.city ?? 'All Cities'
  const category = params.category ?? 'All'
  const posts = await getPosts(city, category)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Community Board</h1>
          <p className="text-gray-500 mt-1">
            Conversations, recommendations & local news
          </p>
        </div>
        <CommunityNewPost currentCity={city} />
      </div>

      {/* City Filter */}
      <div className="flex gap-2 flex-wrap mb-3">
        {CITIES.map((c) => (
          <Link
            key={c}
            href={`/community?city=${encodeURIComponent(c)}&category=${encodeURIComponent(category)}`}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${
              city === c
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-6 pb-6 border-b border-gray-100">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/community?city=${encodeURIComponent(city)}&category=${encodeURIComponent(cat)}`}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
              category === cat
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium">No posts yet</p>
          <p className="text-sm mt-1">Be the first to post in this community!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
