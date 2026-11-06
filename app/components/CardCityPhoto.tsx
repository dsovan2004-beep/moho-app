import Link from 'next/link'
import { CITY_PHOTOS } from '@/lib/city-photos'

// City context only: never substitute a different city's image or a satellite view
// for a business, service portfolio, venue or actual event photograph.
export default function CardCityPhoto({ city }: { city: string }) {
  if (city !== 'Tracy') return null
  const photo = CITY_PHOTOS.Tracy
  return <figure className="border-b border-slate-200 bg-[#edf1eb]">
    <img src={`/images/cities/${photo.file}-800.webp`} width={800} height={500}
      alt={photo.alt} loading="lazy" className="h-44 sm:h-48 w-full object-cover" />
    <figcaption className="px-4 py-3 text-xs leading-relaxed text-slate-700">
      <p className="font-semibold">City backdrop · {photo.caption}</p>
      <p>This street view shows the city, not this business or event.</p>
      <Link href="/photo-credits" className="inline-flex min-h-11 items-center underline underline-offset-2">{photo.author} · {photo.license} · crop · Credits →</Link>
    </figcaption>
  </figure>
}
