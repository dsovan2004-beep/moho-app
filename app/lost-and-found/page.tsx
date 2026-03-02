import { supabase, type LostAndFound } from '@/lib/supabase'
import Link from 'next/link'

const CITIES = ['All Cities', 'Mountain House', 'Tracy', 'Lathrop', 'Manteca']
const STATUSES = ['All', 'lost', 'found', 'reunited'] as const

type Status = typeof STATUSES[number]

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  lost: { bg: 'bg-red-100', text: 'text-red-700', label: 'Lost', icon: '🔴' },
  found: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Found', icon: '🟡' },
  reunited: { bg: 'bg-green-100', text: 'text-green-700', label: 'Reunited', icon: '🟢' },
}

interface PageProps {
  searchParams: Promise<{ city?: string; status?: string }>
}

async function getPets(city?: string, status?: string) {
  let req = supabase
    .from('lost_and_found')
    .select('*')
    .order('created_at', { ascending: false })

  if (city && city !== 'All Cities') {
    req = req.eq('city', city)
  }
  if (status && status !== 'All') {
    req = req.eq('status', status)
  }

  const { data, error } = await req
  if (error) console.error(error)
  return (data ?? []) as LostAndFound[]
}

function PetCard({ pet }: { pet: LostAndFound }) {
  const style = STATUS_STYLES[pet.status] ?? STATUS_STYLES.lost

  return (
    <article className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
      {/* Image */}
      <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        {pet.image_url ? (
          <img src={pet.image_url} alt={pet.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">🐾</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
              {style.icon} {style.label.toUpperCase()}
            </span>
            {pet.pet_name && (
              <span className="ml-2 text-xs font-medium text-gray-500">
                "{pet.pet_name}"
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {new Date(pet.created_at).toLocaleDateString()}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 mb-1">{pet.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{pet.description}</p>

        <div className="flex items-center gap-3 text-xs text-gray-400 border-t border-gray-100 pt-3">
          <span>🐶 {pet.pet_type}</span>
          <span>📍 {pet.city}</span>
        </div>

        {pet.contact_name && (
          <div className="mt-2 text-xs text-gray-500">
            Contact: <span className="font-medium text-gray-700">{pet.contact_name}</span>
            {pet.contact_phone && (
              <span className="ml-2 text-blue-600">{pet.contact_phone}</span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function StatCard({ count, label, colorClass }: { count: number; label: string; colorClass: string }) {
  return (
    <div className={`rounded-xl p-4 text-center ${colorClass}`}>
      <p className="text-3xl font-extrabold">{count}</p>
      <p className="text-sm font-medium mt-0.5">{label}</p>
    </div>
  )
}

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Lost & Found Pets</h1>
          <p className="text-gray-500 mt-1">Help reunite pets with their families</p>
        </div>
        <button
          className="shrink-0 text-sm font-semibold px-4 py-2 rounded-full text-white transition"
          style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}
        >
          + Report Pet
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard count={lostCount} label="Lost" colorClass="bg-red-50 text-red-700" />
        <StatCard count={foundCount} label="Found" colorClass="bg-amber-50 text-amber-700" />
        <StatCard count={reunitedCount} label="Reunited" colorClass="bg-green-50 text-green-700" />
      </div>

      {/* City Filter */}
      <div className="flex gap-2 flex-wrap mb-3">
        {CITIES.map((c) => (
          <Link
            key={c}
            href={`/lost-and-found?city=${encodeURIComponent(c)}&status=${encodeURIComponent(status)}`}
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

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map((s) => {
          const st = s === 'All' ? null : STATUS_STYLES[s]
          const isActive = status === s
          return (
            <Link
              key={s}
              href={`/lost-and-found?city=${encodeURIComponent(city)}&status=${encodeURIComponent(s)}`}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${
                isActive
                  ? st
                    ? `${st.bg} ${st.text} ring-2 ring-offset-1`
                    : 'bg-gray-800 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {st ? `${st.icon} ${st.label}` : 'All'}
            </Link>
          )
        })}
      </div>

      {/* Grid */}
      {filteredPets.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🐾</p>
          <p className="font-medium">No listings found</p>
          <p className="text-sm mt-1">Try a different city or status filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  )
}
