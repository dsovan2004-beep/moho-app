import Link from 'next/link'

export type ActivityItemType = 'community' | 'event' | 'lost_pet'

export interface ActivityItem {
  id: string
  type: ActivityItemType
  title: string
  description: string
  city: string
  created_at: string
}

const TYPE_BADGE: Record<ActivityItemType, { label: string; classes: string }> = {
  community: { label: 'COMMUNITY', classes: 'bg-blue-100 text-blue-700' },
  event: { label: 'EVENT', classes: 'bg-amber-100 text-amber-700' },
  lost_pet: { label: 'LOST PET', classes: 'bg-red-100 text-red-700' },
}

const CITY_BADGE: Record<string, string> = {
  'Mountain House': 'bg-blue-50 text-blue-700',
  Tracy: 'bg-green-50 text-green-700',
  Lathrop: 'bg-purple-50 text-purple-700',
  Manteca: 'bg-orange-50 text-orange-700',
}

const TYPE_ICON: Record<ActivityItemType, string> = {
  community: '💬',
  event: '📅',
  lost_pet: '🐾',
}

const TYPE_HREF: Record<ActivityItemType, (id: string) => string> = {
  community: (id) => `/community/${id}`,
  event: () => `/events`,
  lost_pet: () => `/lost-and-found`,
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ActivityCard({ item }: { item: ActivityItem }) {
  const badge = TYPE_BADGE[item.type]
  const cityColor = CITY_BADGE[item.city] ?? 'bg-gray-50 text-gray-600'
  const icon = TYPE_ICON[item.type]
  const href = TYPE_HREF[item.type](item.id)

  return (
    <Link href={href} className="block group">
      <article className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
        {/* Top row: type badge + timestamp */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full tracking-wide ${badge.classes}`}>
            {icon} {badge.label}
          </span>
          <span className="text-xs text-gray-400">{timeAgo(item.created_at)}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-700 transition-colors line-clamp-2">
          {item.title}
        </h3>

        {/* Description snippet */}
        {item.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {item.description}
          </p>
        )}

        {/* City badge */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cityColor}`}>
          📍 {item.city}
        </span>
      </article>
    </Link>
  )
}
