import { directoryHref, type DirectoryFilters } from './directory-filters'
import { serviceForCategory } from './services'

export function directoryRecovery(filters: DirectoryFilters) {
  const actions: { label: string; href: string }[] = []
  const local = filters.city === 'All Cities' ? 'all cities' : filters.city
  const service = serviceForCategory(filters.service, filters.category)
  if (filters.query.trim()) actions.push({ label: 'Remove search term', href: directoryHref(filters, {query:null}) })
  if (service) actions.push({ label: `Browse all ${service.category.toLowerCase()} in ${local}`, href: directoryHref(filters, {service:null,query:null}) })
  if (filters.category !== 'All' || service) actions.push({ label: `Browse all listings in ${local}`, href: directoryHref(filters, {category:'All',service:null,query:null}) })
  if (filters.city !== 'All Cities') actions.push({ label: 'Try this search in other cities', href: directoryHref(filters, {city:'All Cities'}) })
  return actions
}
