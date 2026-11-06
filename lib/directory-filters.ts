import { SERVICE_CHOICES } from './services'

export type DirectoryFilters = { city: string; category: string; service?: string; query: string; sort: string }
type FilterPatch = Partial<{ [K in keyof DirectoryFilters]: DirectoryFilters[K] | null }>

// Changing a category clears its narrower service. Removing text must not remove a service.
export function directoryHref(current: DirectoryFilters, patch: FilterPatch = {}) {
  const next = { ...current, ...patch }
  if (patch.category != null && patch.category !== current.category && !('service' in patch)) next.service = null
  const params = new URLSearchParams({ city: next.city ?? 'All Cities', category: next.category ?? 'All' })
  const validService = SERVICE_CHOICES.some(item => item.key === next.service)
  if (validService && ['All', 'Home Services'].includes(next.category ?? 'All')) params.set('service', next.service!)
  if (next.query?.trim()) params.set('q', next.query.trim())
  if (next.sort && ['name', 'rating', 'newest'].includes(next.sort)) params.set('sort', next.sort)
  return `/directory?${params}`
}
