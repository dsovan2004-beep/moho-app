'use client'

import { useState } from 'react'

interface GalleryImage {
  id: string
  image_url: string
  alt_text?: string
  position: number
  source?: string
  source_reference?: string
  verified?: boolean
}

interface ImageGalleryProps {
  images: GalleryImage[]
  businessName: string
  accentColor: string
}

export default function ImageGallery({ images, businessName, accentColor }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) return null

  const activeImage = images[activeIndex]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Main image */}
      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
        <img
          src={activeImage.image_url}
          alt={activeImage.alt_text || `${businessName} — photo ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading={activeIndex === 0 ? 'eager' : 'lazy'}
        />
        {/* Image counter badge */}
        {images.length > 1 && (
          <span className="absolute top-3 right-3 bg-black/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </span>
        )}
        {/* Navigation arrows for mobile */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition sm:hidden"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition sm:hidden"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnail row */}
      {images.length > 1 && (
        <div className="flex gap-1.5 p-2.5 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeIndex
                  ? 'border-current opacity-100 ring-1 ring-offset-1'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
              style={i === activeIndex ? { borderColor: accentColor, color: accentColor } : undefined}
              aria-label={`View photo ${i + 1}`}
            >
              <img
                src={img.image_url}
                alt={img.alt_text || `${businessName} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
