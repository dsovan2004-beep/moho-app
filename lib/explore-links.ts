// Shared navigation intents: carry the resident's selected city into discovery.
export function exploreLinks(city: string) {
  const directory = (category: string, query?: string, service?: string) => `/directory?${new URLSearchParams({city,category,...(query ? {q:query} : {}),...(service ? {service} : {})})}`
  return [
    {key:'indian-food',label:'Indian food',emoji:'🍽️',href:directory('Restaurants','Indian')},
    {key:'groceries',label:'Indian groceries',emoji:'🛍️',href:directory('Retail','Indian')},
    {key:'classes',label:'Language, dance & music',emoji:'📚',href:`/classes?${new URLSearchParams({city})}`},
    {key:'solar',label:'Solar bird exclusion',emoji:'⌂',href:directory('Home Services',undefined,'solar-bird-exclusion')},
    {key:'lights',label:'Holiday light installation',emoji:'✦',href:directory('Home Services',undefined,'holiday-light-installation')},
    {key:'events',label:'Local events & celebrations',emoji:'📅',href:`/events?${new URLSearchParams({city})}`},
  ]
}
