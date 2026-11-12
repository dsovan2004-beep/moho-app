import React from 'react'
import Link from 'next/link'
import { checkDate } from '@/lib/listing-evidence'
import { RELAUNCH_CITY_NAMES } from '@/lib/cities'

export type ActivityItemType = 'community' | 'event' | 'lost_pet' | 'business' | 'business_check'

export interface ActivityItem {
  id: string
  type: ActivityItemType
  title: string
  description: string
  city: string
  created_at: string
  image_url?: string
  service_areas?: string[]
  category?: string
}

const TYPE_BADGE: Record<ActivityItemType, { label: string; classes: string }> = {
  community: { label: 'COMMUNITY',    classes: 'bg-blue-100 text-blue-700'   },
  event:     { label: 'EVENT',        classes: 'bg-amber-100 text-amber-700' },
  lost_pet:  { label: 'PET REPORT',     classes: 'bg-red-100 text-red-700'     },
  business_check: { label: 'WEBSITE CHECKED', classes: 'bg-emerald-100 text-emerald-800' },
  business:  { label: 'LISTING ADDED', classes: 'bg-green-100 text-green-700' },
}

const CITY_BADGE: Record<string, string> = {
  'Mountain House': 'bg-blue-50 text-blue-700',
  Tracy: 'bg-green-50 text-green-700',
  Lathrop: 'bg-purple-50 text-purple-700',
  Manteca: 'bg-orange-50 text-orange-700',
  Brentwood: 'bg-teal-50 text-teal-700',
}

const TYPE_ICON: Record<ActivityItemType, string> = {
  community: '💬',
  event:     '📅',
  lost_pet:  '🐾',
  business:  '🏢',
  business_check: '🔎',
}

function getHref(item: ActivityItem, currentCity?: string): string {
  if (item.type === 'community') return `/community/${item.id}`
  if (item.type === 'event')     return `/events/${item.id}`
  if (item.type === 'business' || item.type === 'business_check') {
    const city = currentCity ?? (RELAUNCH_CITY_NAMES.some(city=>city===item.city) ? item.city : item.service_areas?.[0])
    return `/business/${item.id}${city ? `?${new URLSearchParams({city})}` : ''}`
  }

  // Lost pets land on the list page with city context
  const cityParam = currentCity
    ? `?city=${encodeURIComponent(currentCity)}`
    : item.city
    ? `?city=${encodeURIComponent(item.city)}`
    : ''
  return `/lost-and-found${cityParam}`
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

interface ActivityCardProps {
  item: ActivityItem
  /** The currently selected city filter, if any — used to carry city context into link hrefs */
  currentCity?: string
}

export function ActivityCard({ item, currentCity }: ActivityCardProps) {
  const badge = TYPE_BADGE[item.type]
  const cityColor = CITY_BADGE[item.city] ?? 'bg-gray-50 text-gray-600'
  const icon = TYPE_ICON[item.type]
  const href = getHref(item, currentCity)
  const showCityBadge = item.city && item.city.trim().length > 0

  return (
    <Link href={href} className="block group">
      <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
        {/* Flyer / screenshot thumbnail — shown when present */}
        {item.image_url && (
          <div className="w-full h-40 bg-gray-100 overflow-hidden">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}

        <div className="p-5">
          {/* Top row: type badge + timestamp */}
          <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full tracking-wide ${badge.classes}`}>
              {icon} {badge.label}
            </span>
            <time dateTime={item.created_at} className="text-xs text-slate-500">{item.type === 'business_check' ? `Checked ${checkDate(item.created_at)}` : timeAgo(item.created_at)}</time>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-blue-700 transition-colors line-clamp-2">
            {item.title}
          </h3>

          {/* Category label for businesses */}
          {(item.type === 'business' || item.type === 'business_check') && item.category && (
            <p className="text-xs font-semibold text-green-700 mb-1">{item.category}</p>
          )}

          {/* Description snippet */}
          {item.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {item.description}
            </p>
          )}

          {item.service_areas?.length ? <p className="mb-3 text-xs text-slate-600">Advertised coverage: {item.service_areas.join(' · ')}</p> : null}

          {/* City badge — only rendered when city is a non-empty string */}
          {showCityBadge && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cityColor}`}>
              📍 {item.city === 'Service area only' ? 'Office location not listed' : item.city}
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
