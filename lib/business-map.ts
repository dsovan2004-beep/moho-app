// Keep an explicitly supplied locality; do not append the listing city twice.
export function businessMapQuery(address:string,city:string) {
 const value=address.trim()
 if(!value)return ''
 const escaped=city.trim().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
 const hasCity=escaped&&new RegExp(`(?:^|,)\\s*${escaped}(?=\\s*(?:,|$))`,'i').test(value)
 const hasState=/(?:,|\s)(?:CA|California)\b/i.test(value)
 if(hasCity)return hasState?value:`${value}, CA`
 // A complete supplied address wins over a conflicting listing-city field.
 if(/\b[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/.test(value))return value
 return `${value}, ${city.trim()}, CA`
}
