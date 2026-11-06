const CITIES: Record<string,string> = {'mountain-house':'Mountain House',tracy:'Tracy',lathrop:'Lathrop',manteca:'Manteca',brentwood:'Brentwood'}
const CATEGORIES: Record<string,{category:string;query?:string;service?:string}> = {
  restaurants:{category:'Restaurants'}, 'health-and-wellness':{category:'Health & Wellness'},
  'beauty-and-spa':{category:'Beauty & Spa'}, retail:{category:'Retail'}, education:{category:'Education'},
  automotive:{category:'Automotive'}, 'real-estate':{category:'Real Estate'}, 'home-services':{category:'Home Services'},
  'pet-services':{category:'Pet Services'}, dentists:{category:'Health & Wellness',query:'dentist'},
  gyms:{category:'Health & Wellness',query:'gym'}, coffee:{category:'Restaurants',query:'coffee'},
  'hair-salons':{category:'Beauty & Spa',query:'hair'}, doctors:{category:'Health & Wellness',query:'doctor'},
  pizza:{category:'Restaurants',query:'pizza'}, spas:{category:'Beauty & Spa',query:'spa'},
  plumbers:{category:'Home Services',service:'plumbing'}, electricians:{category:'Home Services',query:'electric'},
  'nail-salons':{category:'Beauty & Spa',query:'nail'}, chiropractors:{category:'Health & Wellness',query:'chiropract'},
  'mexican-food':{category:'Restaurants',query:'Mexican'}, tutors:{category:'Education',query:'tutor'},
  'real-estate-agents':{category:'Real Estate',query:'agent'},
}

// Preserve old bookmarks while retiring unsupported quality/ranking claims.
export function legacyBestDestination(categorySlug:string,citySlug:string) {
  if(!Object.prototype.hasOwnProperty.call(CITIES,citySlug) || !Object.prototype.hasOwnProperty.call(CATEGORIES,categorySlug)) return null
  const category=CATEGORIES[categorySlug]
  const query=new URLSearchParams({city:CITIES[citySlug],category:category.category})
  if(category.service) query.set('service',category.service)
  if(category.query) query.set('q',category.query)
  return `/directory?${query}`
}
