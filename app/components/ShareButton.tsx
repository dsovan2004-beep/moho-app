'use client'

import { useState } from 'react'

interface ShareButtonProps {
  businessName: string
}

export default function ShareButton({ businessName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href

    // Use native share sheet on mobile if available
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: businessName, url })
      } catch {
        // User cancelled native share — no-op
      }
      return
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard write failed silently
    }
  }

  return (
    <button
      onClick={handleShare}
      className="bg-white/15 border border-white/30 text-white font-semibold text-sm px-5 py-2.5 rounded-xl text-center hover:bg-white/25 transition w-full sm:w-auto"
    >
      {copied ? '✅ Link copied!' : '🔗 Share'}
    </button>
  )
}
