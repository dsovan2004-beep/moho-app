export function safeReturnTo(value: string | null): string {
  if (value === '/submit' || value === '/submit-business' || value === '/my-requests') return value
  if (value && /^\/claim-listing\/[0-9a-f-]{36}$/i.test(value)) return value
  return '/'
}
