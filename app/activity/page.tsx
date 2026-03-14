export const runtime = 'edge'

import { getSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { ActivityCard, type ActivityItem } from '@/app/components/ActivityCard'

const CITIES = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca', 'Brentwood']

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchActivityFeed(city?: string): Promise<ActivityItem[]> {
  const supabase = getSupabaseClient()

  // Build each query — apply city filter when a specific city is selected
  const postsQuery = supabase
    .from('community_posts')
    .select('id, title, content, city, created_at')
    .not('title', 'ilike', '%facebook%')
    .not('title', 'ilike', '%facebook.com%')
    .not('content', 'ilike', '%facebook.com/groups%')
    .order('created_at', { ascending: false })
    .limit(20)

  const eventsQuery = supabase
    .from('events')
    .select('id, title, description, city, created_at, image_url')
    .not('title', 'ilike', '%stabbing%')
    .not('title', 'ilike', '%shooting%')
    .not('title', 'ilike', '%killed%')
    .not('title', 'ilike', '%murder%')
    .not('title', 'ilike', '%arrested%')
    .not('title', 'ilike', '%sentenced%')
    .not('title', 'ilike', '%convicted%')
    .not('title', 'ilike', '%bomb%')
    .not('title', 'ilike', '%arson%')
    .not('title', 'ilike', '%ghost gun%')
    .not('title', 'ilike', '%stockton%')
    .not('title', 'ilike', '%trial%')
    .not('title', 'ilike', '%investigation%')
    .not('title', 'ilike', '%racist%')
    .not('title', 'ilike', '%crooked%')
    .order('created_at', { ascending: false })
    .limit(20)

  const lostQuery = supabase
    .from('lost_and_found')
    .select('id, title, description, city, created_at')
    .not('title', 'ilike', '%stabbing%')
    .not('title', 'ilike', '%shooting%')
    .not('title', 'ilike', '%killed%')
    .not('title', 'ilike', '%murder%')
    .not('title', 'ilike', '%arrested%')
    .not('title', 'ilike', '%bomb%')
    .not('title', 'ilike', '%arson%')
    .order('created_at', { ascending: false })
    .limit(20)

  // Recently verified businesses — trust filter required on all public queries
  const bizQuery = supabase
    .from('businesses')
    .select('id, name, description, city, category, created_at, image_url')
    .eq('status', 'approved')
    .eq('verified', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Apply city filter when a valid city is selected
  const isFiltered = city && CITIES.includes(city)

  const [postsResult, eventsResult, lostResult, bizResult] = await Promise.all([
    isFiltered ? postsQuery.eq('city', city) : postsQuery,
    isFiltered ? eventsQuery.eq('city', city) : eventsQuery,
    isFiltered ? lostQuery.eq('city', city) : lostQuery,
    isFiltered ? bizQuery.eq('city', city) : bizQuery,
  ])

  if (postsResult.error) console.error('activity/posts error:', postsResult.error)
  if (eventsResult.error) console.error('activity/events error:', eventsResult.error)
  if (lostResult.error) console.error('activity/lost_and_found error:', lostResult.error)
  if (bizResult.error) console.error('activity/businesses error:', bizResult.error)

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
    image_url: e.image_url ?? undefined,
  }))

  const lostPets: ActivityItem[] = (lostResult.data ?? []).map((l: any) => ({
    id: l.id,
    type: 'lost_pet',
    title: l.title ?? '',
    description: l.description ?? '',
    city: l.city ?? '',
    created_at: l.created_at,
  }))

  const businesses: ActivityItem[] = (bizResult.data ?? []).map((b: any) => ({
    id: b.id,
    type: 'business',
    title: b.name ?? '',
    description: b.description ?? '',
    city: b.city ?? '',
    category: b.category ?? '',
    created_at: b.created_at,
    image_url: b.image_url ?? undefined,
  }))

  // Merge all streams, sort chronologically descending, cap at 20 items
  const merged = [...posts, ...events, ...lostPets, ...businesses]
  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return merged.slice(0, 20)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ city?: string }>
}

export default async function ActivityPage({ searchParams }: PageProps) {
  const params = await searchParams
  // Only treat as a city filter if it's one of the 4 canonical cities
  const selectedCity = CITIES.includes(params.city ?? '') ? params.city : undefined

  let feed: ActivityItem[] = []
  let fetchError = false

  try {
    feed = await fetchActivityFeed(selectedCity)
  } catch (err) {
    console.error('ActivityPage fetch failed:', err)
    fetchError = true
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Neighborhood Activity</h1>
        <p className="text-gray-500 mt-1">
          {selectedCity
            ? `What's happening in ${selectedCity} — right now.`
            : "What's happening across Mountain House, Tracy, Lathrop, Manteca & Brentwood — right now."}
        </p>
      </div>

      {/* City filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/activity"
          className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${
            !selectedCity
              ? 'bg-gray-800 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800'
          }`}
        >
          All Cities
        </Link>
        {CITIES.map((c) => {
          const isActive = selectedCity === c
          const cityStyles: Record<string, string> = {
            'Mountain House': isActive ? 'bg-blue-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700',
            Tracy:           isActive ? 'bg-green-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700',
            Lathrop:         isActive ? 'bg-purple-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700',
            Manteca:         isActive ? 'bg-orange-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-700',
            Brentwood:       isActive ? 'bg-teal-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700',
          }
          return (
            <Link
              key={c}
              href={`/activity?city=${encodeURIComponent(c)}`}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${cityStyles[c]}`}
            >
              {c}
            </Link>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
          🏢 New Businesses
        </span>
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
            {selectedCity
              ? `No recent activity in ${selectedCity} yet.`
              : 'No recent activity yet.'}
          </p>
          <p className="text-sm mb-6">Be the first to post in your community.</p>
          <Link
            href={selectedCity ? `/community?city=${encodeURIComponent(selectedCity)}` : '/community'}
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
            {feed.length} recent item{feed.length !== 1 ? 's' : ''}
            {selectedCity ? ` in ${selectedCity}` : ' across the 209'}
          </p>
          <div className="space-y-3">
            {feed.map((item) => (
              <ActivityCard
                key={`${item.type}-${item.id}`}
                item={item}
                currentCity={selectedCity}
              />
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Want to contribute to the neighborhood conversation?
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href={selectedCity ? `/community?city=${encodeURIComponent(selectedCity)}` : '/community'}
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
                href={selectedCity ? `/events?city=${encodeURIComponent(selectedCity)}` : '/events'}
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
