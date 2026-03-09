'use client'
export const runtime = 'edge'

import { useState } from 'react'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

const CITIES = ['Mountain House', 'Tracy', 'Lathrop', 'Manteca']
const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Other']

const STATUSES = [
  { key: 'lost',     label: '🚨 Lost',     desc: 'I lost my pet',             bg: '#dc2626' },
  { key: 'found',    label: '🔍 Found',    desc: 'I found someone\'s pet',    bg: '#d97706' },
  { key: 'reunited', label: '🎉 Reunited', desc: 'Happy ending — we found them!', bg: '#16a34a' },
]

export default function PostLostFoundPage() {
  const [status, setStatus]               = useState('lost')
  const [type, setType]                   = useState('Dog')
  const [petName, setPetName]             = useState('')
  const [breed, setBreed]                 = useState('')
  const [age, setAge]                     = useState('')
  const [gender, setGender]               = useState('')
  const [city, setCity]                   = useState('Mountain House')
  const [locationDetail, setLocationDetail] = useState('')
  const [lastSeen, setLastSeen]           = useState('')
  const [coatDesc, setCoatDesc]           = useState('')
  const [description, setDescription]     = useState('')
  const [reward, setReward]               = useState('')
  const [contactName, setContactName]     = useState('')
  const [contactPhone, setContactPhone]   = useState('')
  const [photoFile, setPhotoFile]         = useState<File | null>(null)
  const [photoPreview, setPhotoPreview]   = useState<string | null>(null)
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState(false)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function resetForm() {
    setStatus('lost'); setType('Dog'); setPetName(''); setBreed(''); setAge('')
    setGender(''); setCity('Mountain House'); setLocationDetail(''); setLastSeen('')
    setCoatDesc(''); setDescription(''); setReward(''); setContactName(''); setContactPhone('')
    setPhotoFile(null); setPhotoPreview(null); setSuccess(false); setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    const supabase = getSupabaseClient()
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const title = petName
      ? `${status === 'lost' ? 'Lost' : status === 'found' ? 'Found' : 'Reunited'} ${type} — ${petName}`
      : `${status === 'lost' ? 'Lost' : status === 'found' ? 'Found' : 'Reunited'} ${type}`

    // ── Upload photo if provided ──────────────────────────────────────────
    let imageUrl: string | null = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop() ?? 'jpg'
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('pet-images')
        .upload(path, photoFile, { contentType: photoFile.type })
      if (uploadErr) {
        setError(`Photo upload failed: ${uploadErr.message}`)
        setSubmitting(false)
        return
      }
      const { data: urlData } = supabase.storage.from('pet-images').getPublicUrl(path)
      imageUrl = urlData.publicUrl
    }

    const { error: err } = await supabase.from('lost_and_found').insert({
      title,
      status,
      type,
      pet_name:         petName        || null,
      breed:            breed          || null,
      age:              age            || null,
      gender:           gender         || null,
      city,
      location_detail:  locationDetail || null,
      last_seen:        lastSeen       || null,
      coat_description: coatDesc       || null,
      description:      description    || null,
      reward:           reward         || null,
      contact_name:     contactName,
      contact_phone:    contactPhone   || null,
      image_url:        imageUrl,
    })

    setSubmitting(false)
    if (err) { setError(err.message) } else { setSuccess(true) }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="text-7xl mb-5">🐾</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Listing posted!</h2>
        <p className="text-gray-500 text-sm mb-8">
          Your listing is now live on MoHoLocal — the community will see it right away.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/lost-and-found"
            className="px-5 py-2.5 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
            style={{ backgroundColor: '#1e3a5f' }}>
            View All Listings
          </Link>
          <button onClick={resetForm}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-400 transition">
            Post Another
          </button>
        </div>
      </div>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-10">

      {/* Back */}
      <Link href="/lost-and-found"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition mb-6">
        ← Back to Lost &amp; Found
      </Link>

      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Post a Pet Listing</h1>
      <p className="text-gray-500 text-sm mb-8">
        Help reunite pets with their families across Mountain House, Tracy, Lathrop &amp; Manteca.
      </p>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Status ── */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            What happened? *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {STATUSES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setStatus(s.key)}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-center transition-all text-sm font-bold"
                style={status === s.key
                  ? { backgroundColor: s.bg, borderColor: s.bg, color: 'white' }
                  : { borderColor: '#e5e7eb', color: '#374151' }}>
                <span className="text-xl">{s.label.split(' ')[0]}</span>
                <span>{s.label.split(' ').slice(1).join(' ')}</span>
                <span className="text-[10px] font-normal opacity-80">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Pet Info ── */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pet Info</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Animal Type *
              </label>
              <select value={type} onChange={(e) => setType(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                {PET_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                <option value="">Unknown</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>

          {/* Pet Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Pet Name <span className="text-gray-400 font-normal">(if known)</span>
            </label>
            <input value={petName} onChange={(e) => setPetName(e.target.value)}
              placeholder="e.g. Buddy"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Breed */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Breed</label>
              <input value={breed} onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Golden Retriever"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age</label>
              <input value={age} onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 2 yrs"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>

          {/* Coat / Appearance */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Coat / Appearance
            </label>
            <input value={coatDesc} onChange={(e) => setCoatDesc(e.target.value)}
              placeholder="e.g. Golden coat · Blue collar · Has tag"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Photo <span className="text-gray-400 font-normal">(strongly recommended)</span>
            </label>
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                  className="absolute top-2 right-2 bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-300 transition text-sm font-bold shadow">
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition">
                <span className="text-3xl mb-2">📷</span>
                <span className="text-sm font-semibold text-gray-600">Click to upload a photo</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG — max 5MB</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* ── Location ── */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location &amp; Time</p>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Location detail */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Location Detail *
            </label>
            <input value={locationDetail} onChange={(e) => setLocationDetail(e.target.value)}
              required placeholder="e.g. Near Altamont Village park, Mountain House"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          {/* Last seen */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {status === 'found' ? 'Date/Time Found' : 'Last Seen'}
            </label>
            <input value={lastSeen} onChange={(e) => setLastSeen(e.target.value)}
              placeholder="e.g. Mar 1 · ~7:30 AM"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        {/* ── Extra Details ── */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Additional Details
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} placeholder="Any other helpful information..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
          </div>

          {status === 'lost' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Reward <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input value={reward} onChange={(e) => setReward(e.target.value)}
                placeholder="e.g. $200"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          )}
        </div>

        {/* ── Contact ── */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</p>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your Name *
            </label>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)}
              required placeholder="Full name"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
              placeholder="(209) 555-0100"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        {/* ── Submit ── */}
        <button type="submit" disabled={submitting}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#f59e0b', color: '#1e3a5f' }}>
          {submitting ? 'Posting...' : '🐾 Post Listing'}
        </button>

        <p className="text-center text-xs text-gray-400">
          Your listing goes live immediately and is visible to the whole community.
        </p>
      </form>
    </div>
  )
}
