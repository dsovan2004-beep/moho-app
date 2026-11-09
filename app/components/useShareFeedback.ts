'use client'

import { useRef, useState } from 'react'
import { copyShareText } from '@/lib/share-links'

type Action = 'link' | 'text' | 'device'
type Feedback = { scope: string; action: Action | null; message: string; manual: Action | null; attempt: number }

// Share menus and clipboard writes can stay pending while the resident changes city.
export function useShareFeedback(scope: string) {
  const current = useRef({ scope, busy: false, attempt: 0 })
  if (current.current.scope !== scope) current.current = { scope, busy: false, attempt: current.current.attempt + 1 }
  const [feedback, setFeedback] = useState<Feedback>({ scope, action: null, message: '', manual: null, attempt: 0 })
  const shown = feedback.scope === scope ? feedback : { scope, action: null, message: '', manual: null, attempt: 0 }

  async function run(action: Action, operation: () => Promise<{ message: string; manual?: Action }>) {
    if (current.current.busy) return
    const attempt = ++current.current.attempt
    current.current.busy = true
    setFeedback({ scope, action, message: action === 'device' ? 'Opening share menu…' : 'Copying…', manual: null, attempt })
    const result = await operation()
    if (current.current.scope !== scope || current.current.attempt !== attempt) return
    current.current.busy = false
    setFeedback({ scope, action: null, message: result.message, manual: result.manual ?? null, attempt })
  }

  function copy(text: string, kind: 'link' | 'text') {
    return run(kind, async () => {
      let copied = false
      try { copied = await copyShareText(text, navigator.clipboard) } catch { /* Browser access may be restricted. */ }
      return copied
        ? { message: `${kind === 'link' ? 'Link' : 'Suggested text'} copied. Paste it wherever you choose.` }
        : { message: `Could not copy automatically. Tap Select ${kind === 'link' ? 'link' : 'text'}, then use your device’s Copy action.`, manual: kind }
    })
  }

  function share(data: ShareData) {
    return run('device', async () => {
      try {
        await navigator.share(data)
        return { message: 'Share menu closed. Check your chosen app to confirm it was sent.' }
      } catch (error) {
        return error && typeof error === 'object' && 'name' in error && error.name === 'AbortError'
          ? { message: 'Sharing canceled. Nothing was copied.' }
          : { message: 'Could not open sharing. Copy the link or select it below.', manual: 'link' }
      }
    })
  }

  return { ...shown, busy: shown.action !== null, copy, share }
}
