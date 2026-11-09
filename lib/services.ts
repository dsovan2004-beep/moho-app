export const SERVICE_CHOICES = [
  { key: 'handyman', label: 'Handyman & small repairs', category: 'Home Services', tag: 'handyman' },
  { key: 'garage-door-repair', label: 'Garage door repair', category: 'Home Services', tag: 'garage door repair' },
  { key: 'heating-air-conditioning', label: 'Heating & air conditioning', category: 'Home Services', tag: 'heating and air conditioning' },
  { key: 'plumbing', label: 'Plumbing', category: 'Home Services', tag: 'plumbing' },
  { key: 'carpet-tile-cleaning', label: 'Carpet & tile cleaning', category: 'Home Services', tag: 'carpet cleaning' },
  { key: 'house-cleaning', label: 'House cleaning', category: 'Home Services', tag: 'house cleaning' },
  { key: 'landscaping', label: 'Landscaping & yard care', category: 'Home Services', tag: 'landscaping' },
  { key: 'solar-bird-exclusion', label: 'Solar bird exclusion', category: 'Home Services', tag: 'solar bird exclusion' },
  { key: 'holiday-light-installation', label: 'Holiday light installation', category: 'Home Services', tag: 'holiday light installation' },
  { key: 'mobile-dog-grooming', label: 'Mobile dog grooming', category: 'Pet Services', tag: 'mobile dog grooming' },
  { key: 'pet-sitting', label: 'Pet sitting', category: 'Pet Services', tag: 'pet sitting' },
  { key: 'dog-walking', label: 'Dog walking', category: 'Pet Services', tag: 'dog walking' },
] as const

export function serviceForCategory(key: string | null | undefined, category: string) {
  return SERVICE_CHOICES.find(item => item.key === key && (category === 'All' || item.category === category))
}
