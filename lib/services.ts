export const SERVICE_CHOICES = [
  { key: 'handyman', label: 'Handyman & small repairs', category: 'Home Services', tag: 'handyman' },
  { key: 'garage-door-repair', label: 'Garage door repair', category: 'Home Services', tag: 'garage door repair' },
  { key: 'heating-air-conditioning', label: 'Heating & air conditioning', category: 'Home Services', tag: 'heating and air conditioning' },
  { key: 'electrical-services', label: 'Electrical services', category: 'Home Services', tag: 'electrical services' },
  { key: 'plumbing', label: 'Plumbing', category: 'Home Services', tag: 'plumbing' },
  { key: 'carpet-tile-cleaning', label: 'Carpet & tile cleaning', category: 'Home Services', tag: 'carpet cleaning' },
  { key: 'window-cleaning', label: 'Window cleaning', category: 'Home Services', tag: 'window cleaning' },
  { key: 'pest-control', label: 'Pest control', category: 'Home Services', tag: 'pest control' },
  { key: 'house-cleaning', label: 'House cleaning', category: 'Home Services', tag: 'house cleaning' },
  { key: 'landscaping', label: 'Landscaping & yard care', category: 'Home Services', tag: 'landscaping' },
  { key: 'solar-bird-exclusion', label: 'Solar bird exclusion', category: 'Home Services', tag: 'solar bird exclusion' },
  { key: 'holiday-light-installation', label: 'Holiday light installation', category: 'Home Services', tag: 'holiday light installation' },
  { key: 'mobile-dog-grooming', label: 'Mobile dog grooming', category: 'Pet Services', tag: 'mobile dog grooming' },
  { key: 'pet-sitting', label: 'Pet sitting', category: 'Pet Services', tag: 'pet sitting' },
  { key: 'pet-boarding', label: 'Pet boarding', category: 'Pet Services', tag: 'pet boarding' },
  { key: 'dog-walking', label: 'Dog walking', category: 'Pet Services', tag: 'dog walking' },
] as const

export function serviceForCategory(key: string | null | undefined, category: string) {
  return SERVICE_CHOICES.find(item => item.key === key && (category === 'All' || item.category === category))
}

// Exact resident job terms only; ambiguous words and company names stay text searches.
const SERVICE_SEARCH_ALIASES:Record<string,readonly string[]> = {
  'electrical-services':['electrician','electricians','electrical'],
  plumbing:['plumber','plumbers'],
  'garage-door-repair':['garage door repairs'],
  'heating-air-conditioning':['hvac','heating and cooling'],
  'pet-sitting':['pet sitter','pet sitters'],
  'dog-walking':['dog walker','dog walkers'],
  landscaping:['landscaper','landscapers'],
  handyman:['handymen'],
}
export function serviceSearchTag(query:string):string|undefined {
  const normalize=(value:string)=>value.toLowerCase().replace(/[^\p{L}\p{N}\s'-]/gu,' ').replace(/\s+/g,' ').trim()
  const normalized=normalize(query)
  return SERVICE_CHOICES.find(item=>[item.label,item.tag,...(SERVICE_SEARCH_ALIASES[item.key]??[])]
    .some(term=>normalize(term)===normalized))?.tag
}
