export const runtime = 'nodejs'

import { getSupabaseClient } from '@/lib/supabase'
import Link from 'next/link'
import { ActivityCard, type ActivityItem } from '@/app/components/ActivityCard'

import { RELAUNCH_CITY_NAMES } from '@/lib/cities'
import { regionalDirectoryFilter } from '@/lib/directory-scope'
import { mergeActivity } from '@/lib/activity-feed'
import { isUpcomingEvent } from '@/lib/event-dates'
import { ACTIVITY_STREAMS, activityStream, activityHref, type ActivityStream } from '@/lib/activity-filters'

export const dynamic = 'force-dynamic'
const CITIES: string[] = [...RELAUNCH_CITY_NAMES]

async function fetchActivityFeed(city: string | undefined, stream: ActivityStream): Promise<ActivityItem[]> {
  const db = getSupabaseClient()
  const isFiltered = city && CITIES.includes(city)
  // Coverage must be looked up before the regional business predicate is built.
  const wantsListings=stream==='all' || stream==='listings'
  const empty={data:[],error:null}
  const coverage = wantsListings ? await db.from('listing_checks').select('business_id').overlaps('service_areas',isFiltered ? [city] : CITIES) : empty
  if (coverage.error) throw coverage.error
  const ids = (coverage.data ?? []).map(row=>row.business_id)
  let businesses = db.from('businesses').select('id,name,description,city,category,created_at,verified_at').eq('status','approved').eq('verified',true).order('verified_at',{ascending:false,nullsFirst:false}).order('created_at',{ascending:false,nullsFirst:false}).order('id',{ascending:true}).limit(40)
  businesses = isFiltered
    ? businesses.or(`city.eq.${city}${ids.length ? `,id.in.(${ids.join(',')})` : ''}`)
    : businesses.or(regionalDirectoryFilter(ids))
  let checks = db.from('listing_checks').select('business_id,checked_at,scope_note,service_areas,businesses!inner(id,name,description,city,category,status,verified)').eq('businesses.status','approved').eq('businesses.verified',true).order('checked_at',{ascending:false}).limit(40)
  checks = isFiltered ? checks.contains('service_areas',[city]) : checks.overlaps('service_areas',CITIES)
  const cities = isFiltered ? [city] : CITIES
  const now = new Date()
  const earliestUnknown = new Date(now.getTime()-86400000).toISOString()
  const [posts, events, pets, listed, checked] = await Promise.all([
    stream==='all' || stream==='discussions' ? db.from('community_posts').select('id,title,content,city,created_at').in('city',cities).neq('status','flagged').neq('status','removed').not('title','ilike','%facebook%').not('content','ilike','%facebook.com/groups%').order('created_at',{ascending:false}).limit(40) : empty,
    stream==='all' || stream==='events' ? db.from('events').select('id,title,description,city,created_at,start_date,end_date').eq('status','approved').in('city',cities).or(`end_date.gte.${now.toISOString()},and(end_date.is.null,start_date.gte.${earliestUnknown})`).order('created_at',{ascending:false}).limit(40) : empty,
    stream==='all' || stream==='pets' ? db.from('lost_and_found').select('id,title,description,city,created_at').in('city',cities).in('status',['lost','found']).order('created_at',{ascending:false}).limit(40) : empty,
    wantsListings ? businesses : empty, wantsListings ? checks : empty,
  ])
  for (const result of [posts,events,pets,listed,checked]) if (result.error) throw result.error
  const additions: ActivityItem[] = (listed.data ?? []).map(b=>({id:b.id,type:'business',title:b.name,description:b.description ?? '',city:b.city,category:b.category,created_at:b.verified_at ?? b.created_at,approval_recorded:!!b.verified_at}))
  const refreshes: ActivityItem[] = (checked.data ?? []).map((check:any)=>({id:check.business_id,type:'business_check',title:check.businesses.name,description:check.businesses.description ?? 'Website information checked; confirm your service needs and current availability directly.',city:check.businesses.city,category:check.businesses.category,created_at:check.checked_at,service_areas:check.service_areas}))
  return mergeActivity([
    ...(posts.data ?? []).map(p=>({id:p.id,type:'community' as const,title:p.title ?? '',description:p.content ?? '',city:p.city ?? '',created_at:p.created_at})),
    ...(events.data ?? []).filter(e=>isUpcomingEvent(e,now)).map(e=>({id:e.id,type:'event' as const,title:e.title ?? '',description:e.description ?? '',city:e.city ?? '',created_at:e.created_at})),
    ...(pets.data ?? []).map(p=>({id:p.id,type:'lost_pet' as const,title:p.title ?? '',description:p.description ?? '',city:p.city ?? '',created_at:p.created_at})),
    ...additions,...refreshes,
  ])
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ city?: string; stream?: string }>
}

export default async function ActivityPage({ searchParams }: PageProps) {
  const params = await searchParams
  // Only treat as a city filter if it's one of the 4 canonical cities
  const selectedCity = CITIES.includes(params.city ?? '') ? params.city : undefined
  const selectedStream=activityStream(params.stream)
  const streamLabel=ACTIVITY_STREAMS.find(item=>item.key===selectedStream)!.label

  let feed: ActivityItem[] = []
  let fetchError = false

  try {
    feed = await fetchActivityFeed(selectedCity,selectedStream)
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
            ? `Listing checks, additions and community updates serving ${selectedCity}.`
            : "Listing checks, additions and community updates across Mountain House, Tracy, Lathrop and Manteca."}
        </p>
      </div>

      {/* City filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={activityHref(undefined,selectedStream)}
          aria-current={!selectedCity ? 'page' : undefined}
          className={`inline-flex min-h-11 items-center text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${
            !selectedCity
              ? 'bg-gray-800 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800'
          }`}
        >
          All four cities
        </Link>
        {CITIES.map((c) => {
          const isActive = selectedCity === c
          const cityStyles: Record<string, string> = {
            'Mountain House': isActive ? 'bg-blue-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700',
            Tracy:           isActive ? 'bg-green-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700',
            Lathrop:         isActive ? 'bg-purple-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700',
            Manteca:         isActive ? 'bg-orange-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-700',
          }
          return (
            <Link
              key={c}
              href={activityHref(c,selectedStream)}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${cityStyles[c]}`}
            >
              {c}
            </Link>
          )
        })}
      </div>

      <nav aria-label="Activity type" className="flex flex-wrap gap-2 mb-6">
        {ACTIVITY_STREAMS.map(item=><Link key={item.key} href={activityHref(selectedCity,item.key)} aria-current={selectedStream===item.key ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-xl border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19352d] focus-visible:ring-offset-2 ${selectedStream===item.key ? 'bg-[#19352d] text-white border-[#19352d]' : 'bg-white text-slate-700 border-slate-200 hover:border-[#19352d]'}`}>{item.label}</Link>)}
      </nav>
      <h2 className="text-lg font-bold text-slate-900 mb-3">{streamLabel}</h2>

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
              ? `No ${selectedStream === 'all' ? 'recent activity' : streamLabel.toLowerCase()} in ${selectedCity} yet.`
              : `No ${selectedStream === 'all' ? 'recent activity' : streamLabel.toLowerCase()} yet.`}
          </p>
          <p className="text-sm mb-6">Try another activity type or browse the relevant section below.</p>
          <Link
            href={`${selectedStream==='events' ? '/events' : selectedStream==='pets' ? '/lost-and-found' : selectedStream==='listings' ? '/directory' : '/community'}${selectedCity ? `?${new URLSearchParams({city:selectedCity})}` : ''}`}
            className="inline-block bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-blue-800 transition"
          >
            {selectedStream==='events' ? 'Browse Events' : selectedStream==='pets' ? 'Browse Pet Reports' : selectedStream==='listings' ? 'Browse Directory' : 'Go to Community Board'}
          </Link>
        </div>
      )}

      {(selectedStream==='all' || selectedStream==='listings') && <p className="mb-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Listing checks show the latest recorded website check, not a new opening, owner confirmation or quality endorsement. <Link className="underline font-semibold" href={selectedCity ? `/directory?${new URLSearchParams({city:selectedCity})}` : '/directory'}>Browse the directory →</Link></p>}

      {/* Feed */}
      {!fetchError && feed.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-4 font-medium">
            {feed.length} recent item{feed.length !== 1 ? 's' : ''}
            {selectedCity ? ` in ${selectedCity}` : ' across our four cities'}
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
                className="inline-flex min-h-11 items-center text-sm font-semibold px-5 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition"
              >
                Post to Community
              </Link>
              <Link
                href="/post-lost-found"
                className="inline-flex min-h-11 items-center text-sm font-semibold px-5 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
              >
                Report Lost Pet
              </Link>
              <Link
                href={selectedCity ? `/events?city=${encodeURIComponent(selectedCity)}` : '/events'}
                className="inline-flex min-h-11 items-center text-sm font-semibold px-5 py-2 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition"
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
