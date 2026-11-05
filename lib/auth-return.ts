export function safeReturnTo(value: string | null): string {
  if (value?.startsWith('/submit?') && value.length<=1500) {
    const params=new URL(value,'https://www.moholocal.com').searchParams
    if ([...params.keys()].every(key=>['submission_type','business_id','city','title'].includes(key))) return `/submit?${params.toString()}`
  }
  if (value === '/community' || value === '/submit' || value === '/submit-business' || value === '/my-requests') return value
  if (value && /^\/(?:claim-listing|community)\/[0-9a-f-]{36}$/i.test(value)) return value
  return '/'
}
