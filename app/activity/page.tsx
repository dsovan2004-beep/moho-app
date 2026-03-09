export const runtime = 'edge'

import { getSupabaseClient } from '@/lib/supabase'
import type { CommunityPost, Event, LostAndFound } from '@/lib/supabase'
import Link from 'next/link'
import { ActivityCard, type ActivityItem } from '@/app/components/ActivityCard'

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchActivityFeed(): Promise<ActivityItem[]> {
  const supabase = getSupabaseClient()

  // Fetch all three tables in parallel — never sequential
  const [postsResult, eventsResult, lostResult] = await Promise.all([
    supabase
      .from('community_posts')
      .select('id, title, content, city, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('events')
      .select('id, title, description, city, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('lost_and_found')
      .select('id, title, description, city, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  if (postsResult.error) console.error('activity/posts error:', postsResult.error)
  if (eventsResult.error) console.error('activity/events error:', eventsResult.error)
  if (lostResult.error) console.error('activity/lost_and_found error:', lostResult.error)

  const posts: ActivityItem[] = (postsResult.data ?? []).map((p: any) => ({
    id: p.id,
    type: 'community',
    title: p.title ?? '',
    description: p.content ?? '',
    city: p.city ?? '',
    created_at: p.created_at,
  }))

  const events: ActivityItem[] = (eventsResult.data ?? []).map((e: any) => ({
    id: e.id,
    type: 'event',
    title: e.title ?? '',
    description: e.description ?? '',
    city: e.city ?? '',
    created_at: e.created_at,
  }))

  const lostPets: ActivityItem[] = (lostResult.data ?? []).map((l: any) => ({
    id: l.id,
    type: 'lost_pet',
    title: l.title ?? '',
    description: l.description ?? '',
    city: l.city ?? '',
    created_at: l.created_at,
  }))

  // Merge and sort chronologically descending
  const merged = [...posts, ...events, ...lostPets]
  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return merged
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ActivityPage() {
  let feed: ActivityItem[] = []
  let fetchError = false

  try {
    feed = await fetchActivityFeed()
  } catch (err) {
    console.error('ActivityPage fetch failed:', err)
    fetchError = true
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Neighborhood Activity</h1>
        <p className="text-gray-500 mt-1">
          What&apos;s happening across Mountain House, Tracy, Lathrop &amp; Manteca — right now.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">
          💬 Community Posts
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
          📅 Events
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-3 py-1.5 rounded-full">
          🐾 Lost Pets
        </span>
      </div>

      {/* Error state */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 text-center">
          <p className="text-red-700 font-medium">Unable to load activity right now.</p>
          <p className="text-red-500 text-sm mt-1">Please try refreshing the page.</p>
        </div>
      )}

      {/* Empty state */}
      {!fetchError && feed.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🏘️</p>
          <p className="text-lg font-semibold text-gray-600 mb-1">
            No recent activity yet.
          </p>
          <p className="text-sm mb-6">
            Be the first to post in your community.
          </p>
          <Link
            href="/community"
            className="inline-block bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-blue-800 transition"
          >
            Go to Community Board
          </Link>
        </div>
      )}

      {/* Feed */}
      {!fetchError && feed.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-4 font-medium">
            {feed.length} recent item{feed.length !== 1 ? 's' : ''} across the 209
          </p>
          <div className="space-y-3">
            {feed.map((item) => (
              <ActivityCard key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Want to contribute to the neighborhood conversation?
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/community"
                className="text-sm font-semibold px-5 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition"
              >
                Post to Community
              </Link>
              <Link
                href="/post-lost-found"
                className="text-sm font-semibold px-5 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
              >
                Report Lost Pet
              </Link>
              <Link
                href="/events"
                className="text-sm font-semibold px-5 py-2 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
