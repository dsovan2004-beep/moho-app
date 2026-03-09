export const runtime = 'edge'

import { getSupabaseClient, type LostAndFound } from '@/lib/supabase'
import Link from 'next/link'

// ── Pet emoji map (matches index.html exactly) ───────────────────────────────
function getPetEmoji(pet: LostAndFound): string {
  const breed = (pet.breed ?? pet.pet_type ?? '').toLowerCase()
  const petKind = (pet.type ?? pet.pet_type ?? '').toLowerCase()
  const desc = (pet.coat_description ?? '').toLowerCase()

  if (breed.includes('poodle')) return '🐩'
  if (breed.includes('shepherd') || breed.includes('gsd')) return '🐕‍🦺'
  if (breed.includes('chihuahua') || breed.includes('french bulldog')) return '🐶'
  if (petKind === 'cat' || breed.includes('siamese') || breed.includes('shorthair') || breed.includes('longhair') || breed.includes('tabby')) {
    if (desc.includes('all black') || desc.includes('black ·') || breed.includes('black')) return '🐈‍⬛'
    return '🐈'
  }
  // all dogs default
  return '🐕'
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  lost: {
    photoBg: 'linear-gradient(135deg,#fee2e2,#fecaca)',
    badgeBg: '#dc2626',
    label: '🚨 LOST',
    filterLabel: '🚨 Lost',
    cardBorder: 'border-gray-200',
  },
  found: {
    photoBg: 'linear-gradient(135deg,#fef3c7,#fde68a)',
    badgeBg: '#d97706',
    label: '🔍 FOUND',
    filterLabel: '🔍 Found',
    cardBorder: 'border-gray-200',
  },
  reunited: {
    photoBg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',
    badgeBg: '#16a34a',
    label: '🎉 REUNITED',
    filterLabel: '🎉 Reunited',
    cardBorder: 'border-green-500',
  },
} as const

// ── City chip styles ──────────────────────────────────────────────────────────
const CITY_CHIP: Record<string, string> = {
  'Mountain House': 'bg-blue-50 text-blue-700',
  Tracy: 'bg-green-50 text-green-700',
  Lathrop: 'bg-purple-50 text-purple-700',
  Manteca: 'bg-orange-50 text-orange-700',
}

const CITY_EMOJI: Record<string, string> = {
  'Mountain House': '🏘️',
  Tracy: '🌿',
  Lathrop: '🔮',
  Manteca: '🍊',
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function getPets(city?: string, status?: string) {
  const supabase = getSupabaseClient()
  let req = supabase
    .from('lost_and_found')
    .select('*')
    .order('created_at', { ascending: false })

  if (city && city !== 'All Cities') req = req.eq('city', city)
  if (status && status !== 'All') req = req.eq('status', status)

  const { data, error } = await req
  if (error) console.error(error)
  return (data ?? []) as LostAndFound[]
}

// ── Card component ────────────────────────────────────────────────────────────
function PetCard({ pet }: { pet: LostAndFound }) {
  const cfg = STATUS_CFG[pet.status] ?? STATUS_CFG.lost
  const emoji = getPetEmoji(pet)
  const chipClass = CITY_CHIP[pet.city] ?? 'bg-gray-100 text-gray-600'
  const isReunited = pet.status === 'reunited'

  return (
    <div
      className={`rounded-2xl overflow-hidden border-2 ${cfg.cardBorder} transition-all hover:-translate-y-0.5 hover:shadow-xl cursor-pointer`}
      style={isReunited ? { background: 'linear-gradient(135deg,#f0fdf4,white)' } : { background: 'white' }}
    >
      {/* Photo area */}
      <div
        className="h-36 flex items-center justify-center relative overflow-hidden"
        style={{ background: cfg.photoBg }}
      >
        {pet.image_url ? (
          <img
            src={pet.image_url}
            alt={pet.pet_name || pet.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">{emoji}</span>
        )}
        <span
          className="absolute top-2.5 right-2.5 text-white text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: cfg.badgeBg }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        {pet.pet_name && (
          <div className="text-lg font-extrabold text-gray-900 mb-0.5">{pet.pet_name}</div>
        )}
        {(pet.breed || pet.age || pet.gender) && (
          <div className="text-xs text-gray-500 mb-3">
            {[pet.breed, pet.gender, pet.age].filter(Boolean).join(' · ')}
          </div>
        )}
        {!pet.pet_name && (
          <div className="text-sm font-bold text-gray-900 mb-3">{pet.title}</div>
        )}

        {pet.location_detail && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
            <span>📍</span><span>{pet.location_detail}, {pet.city}</span>
          </div>
        )}
        {pet.last_seen && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
            <span>🕐</span><span>{pet.last_seen}</span>
          </div>
        )}
        {pet.coat_description && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
            <span>🎨</span><span>{pet.coat_description}</span>
          </div>
        )}
        {/* Reunited testimonial */}
        {isReunited && pet.description && (
          <div className="flex items-start gap-1.5 text-xs text-green-700 font-semibold mb-1.5">
            <span>💬</span><span>"{pet.description.replace(/🎉/g, '').trim()}"</span>
          </div>
        )}

        {/* City chip */}
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-2 ${chipClass}`}>
          {CITY_EMOJI[pet.city]} {pet.city}
        </span>

        {/* Reunited banner */}
        {isReunited && (
          <div className="mt-3 rounded-xl bg-green-600 text-white text-center text-xs font-bold py-2.5">
            🎉 Home safe! Reunited
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between">
        {pet.reward ? (
          <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
            💰 {pet.reward} Reward
          </span>
        ) : isReunited ? (
          <span className="text-xs font-semibold text-green-700">✓ Case closed — Happy ending!</span>
        ) : (
          <span className="text-xs text-gray-400">No reward listed</span>
        )}
        {pet.contact_phone && (
          <span className="text-xs font-semibold text-blue-600">📞 {pet.contact_phone}</span>
        )}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
interface PageProps {
  searchParams: Promise<{ city?: string; status?: string }>
}

const CITIES = ['All Cities', 'Mountain House', 'Tracy', 'Lathrop', 'Manteca']
const STATUSES = [
  { key: 'All', label: 'All' },
  { key: 'lost', label: '🚨 Lost' },
  { key: 'found', label: '🔍 Found' },
  { key: 'reunited', label: '🎉 Reunited' },
]

export default async function LostAndFoundPage({ searchParams }: PageProps) {
  const params = await searchParams
  const city = params.city ?? 'All Cities'
  const status = params.status ?? 'All'

  const [allPets, filteredPets] = await Promise.all([
    getPets(city),
    getPets(city, status),
  ])

  const lostCount = allPets.filter((p) => p.status === 'lost').length
  const foundCount = allPets.filter((p) => p.status === 'found').length
  const reunitedCount = allPets.filter((p) => p.status === 'reunited').length

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">🐾 Lost &amp; Found Pets</h1>
          <p className="text-gray-500 text-sm mt-1">
            All 4 cities · Post a lost or found pet · Celebrate reunions 🎉
          </p>
        </div>
        <Link
          href="/post-lost-found"
          className="shrink-0 text-sm font-bold px-4 py-2 rounded-lg transition hover:opacity-90"
          style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
        >
          + Post Lost or Found Pet
        </Link>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-extrabold text-red-600">{lostCount}</div>
          <div className="text-xs text-gray-500 mt-1">Currently Lost</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-extrabold text-amber-600">{foundCount}</div>
          <div className="text-xs text-gray-500 mt-1">Found — Seeking Owner</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-extrabold text-green-600">{reunitedCount}</div>
          <div className="text-xs text-gray-500 mt-1">Reunited This Month 🎉</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-2 flex-wrap items-center mb-6">
        {/* City label */}
        <span className="text-xs font-bold text-gray-500 mr-1">City:</span>

        {CITIES.map((c) => {
          const isActive = city === c
          return (
            <Link
              key={c}
              href={`/lost-and-found?city=${encodeURIComponent(c)}&status=${encodeURIComponent(status)}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                isActive
                  ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              {c === 'All Cities' ? c : `${CITY_EMOJI[c]} ${c}`}
            </Link>
          )
        })}

        {/* Divider */}
        <span className="w-px bg-gray-200 self-stretch mx-1" />
        <span className="text-xs font-bold text-gray-500 mr-1">Status:</span>

        {STATUSES.map(({ key, label }) => {
          const isActive = status === key
          const activeStyle =
            key === 'lost' ? 'bg-red-600 text-white border-red-600'
            : key === 'found' ? 'bg-amber-500 text-white border-amber-500'
            : key === 'reunited' ? 'bg-green-600 text-white border-green-600'
            : 'bg-gray-800 text-white border-gray-800'

          return (
            <Link
              key={key}
              href={`/lost-and-found?city=${encodeURIComponent(city)}&status=${encodeURIComponent(key)}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                isActive
                  ? activeStyle
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* ── Grid ── */}
      {filteredPets.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-4">🐾</p>
          <p className="font-semibold text-lg">No listings found</p>
          <p className="text-sm mt-1">Try a different city or status filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  )
}
