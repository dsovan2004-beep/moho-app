// Public contact data must not become arbitrary browser/app instructions.
export function businessWebsiteHref(value?: string): string | null {
  if (!value || /[\x00-\x20\x7f]/.test(value)) return null
  try {
    const url=new URL(value)
    if (!['https:','http:'].includes(url.protocol) || !url.hostname || url.username || url.password) return null
    return url.href
  } catch { return null }
}

export function businessPhoneHref(value?: string): string | null {
  if (!value) return null
  const parts=value.trim().match(/^([+\d\s().-]+?)(?:\s*(?:ext\.?|x|#)\s*(\d{1,6}))?$/i)
  if (!parts) return null
  const digits=parts[1].replace(/\D/g,'')
  const number=digits.length===10 ? `+1${digits}` : digits.length===11 && digits.startsWith('1') ? `+${digits}` : parts[1].trim().startsWith('+') && /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null
  return number ? `tel:${number}${parts[2] ? `;ext=${parts[2]}` : ''}` : null
}
