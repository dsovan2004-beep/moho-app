import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const CITIES = [
  { name: 'Mountain House', bg: 'bg-blue-800',   hover: 'hover:bg-blue-700',   emoji: '🏔️' },
  { name: 'Tracy',          bg: 'bg-green-800',  hover: 'hover:bg-green-700',  emoji: '🌿' },
  { name: 'Lathrop',        bg: 'bg-purple-800', hover: 'hover:bg-purple-700', emoji: '⚡' },
  { name: 'Manteca',        bg: 'bg-orange-800', hover: 'hover:bg-orange-700', emoji: '🌅' },
]

const SECTIONS = [
  {
    href: '/directory',
    icon: '🏢',
    title: 'Business Directory',
    desc: 'Find local restaurants, shops, services and more',
    border: 'border-blue-200 hover:border-blue-400',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    hoverText: 'group-hover:text-blue-700',
  },
  {
    href: '/events',
    icon: '📅',
    title: 'Community Events',
    desc: "What's happening across San Joaquin County",
    border: 'border-green-200 hover:border-green-400',
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    hoverText: 'group-hover:text-green-700',
  },
  {
    href: '/community',
    icon: '💬',
    title: 'Community Board',
    desc: 'Conversations, recommendations & local news',
    border: 'border-amber-200 hover:border-amber-400',
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    hoverText: 'group-hover:text-amber-700',
  },
  {
    href: '/lost-and-found',
    icon: '🐾',
    title: 'Lost & Found Pets',
    desc: 'Help reunite pets with their families',
    border: 'border-red-200 hover:border-red-400',
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    hoverText: 'group-hover:text-red-700',
  },
]

async function getSiteCounts() {
  const [businesses, events, posts, pets] = await Promise.allSettled([
    supabase.from('businesses').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('community_posts').select('id', { count: 'exact', head: true }),
    supabase.from('lost_and_found').select('id', { count: 'exact', head: true }).eq('status', 'lost'),
  ])

  return {
    businesses: businesses.status === 'fulfilled' ? (businesses.value.count ?? 0) : 0,
    events:     events.status === 'fulfilled'     ? (events.value.count ?? 0)     : 0,
    posts:      posts.status === 'fulfilled'      ? (posts.value.count ?? 0)      : 0,
    lostPets:   pets.status === 'fulfilled'       ? (pets.value.count ?? 0)       : 0,
  }
}

export default async function HomePage() {
  const counts = await getSiteCounts()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Your Local Hub for<br />
          <span className="text-blue-700">San Joaquin County</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Discover businesses, events, and community conversations in
          Mountain House, Tracy, Lathrop, and Manteca.
        </p>
      </div>

      {/* Live stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { count: counts.businesses, label: 'Businesses',    color: 'text-blue-700',   bg: 'bg-blue-50'   },
          { count: counts.events,     label: 'Events',        color: 'text-green-700',  bg: 'bg-green-50'  },
          { count: counts.posts,      label: 'Posts',         color: 'text-amber-700',  bg: 'bg-amber-50'  },
          { count: counts.lostPets,   label: 'Pets Missing',  color: 'text-red-700',    bg: 'bg-red-50'    },
        ].map(({ count, label, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl py-4 text-center`}>
            <p className={`text-3xl font-extrabold ${color}`}>{count}</p>
            <p className="text-sm font-medium text-gray-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* City quick-links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {CITIES.map((city) => (
          <Link
            key={city.name}
            href={`/directory?city=${encodeURIComponent(city.name)}`}
            className={`${city.bg} ${city.hover} text-white rounded-xl p-4 text-center transition-all hover:-translate-y-0.5`}
          >
            <div className="text-2xl mb-1">{city.emoji}</div>
            <div className="font-bold text-sm">{city.name}</div>
          </Link>
        ))}
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`group flex items-start gap-4 p-5 rounded-2xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${s.bg} ${s.border}`}
          >
            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${s.iconBg}`}>
              {s.icon}
            </div>
            <div>
              <h2 className={`font-bold text-gray-900 text-lg transition ${s.hoverText}`}>
                {s.title}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
