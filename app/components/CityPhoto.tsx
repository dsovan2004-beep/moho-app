import { CITY_PHOTOS, type PhotoCity } from '@/lib/city-photos'

export default function CityPhoto({ city, priority = false, className = '' }: { city: PhotoCity; priority?: boolean; className?: string }) {
  const photo = CITY_PHOTOS[city]
  return <figure className={`overflow-hidden rounded-3xl bg-[#173b3b] ${className}`}>
    <div className="relative h-full min-h-64">
      <img src={`/images/cities/${photo.file}-1600.webp`} srcSet={`/images/cities/${photo.file}-800.webp 800w, /images/cities/${photo.file}-1600.webp 1600w`}
        sizes="(max-width: 1023px) 100vw, 50vw" width={1600} height={1000} alt={photo.alt}
        loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
      <figcaption className="absolute bottom-0 inset-x-0 p-5 text-white">
        <p className="text-sm font-semibold">{photo.caption}</p>
        <p className="text-xs mt-2 leading-relaxed"><a className="underline underline-offset-2" href={photo.source} target="_blank" rel="noopener noreferrer">{photo.author}</a> · <a className="underline underline-offset-2" href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a></p>
        <p className="text-[11px] mt-1 leading-relaxed">{photo.notice} · Geographic crop / resized</p>
      </figcaption>
    </div>
  </figure>
}
