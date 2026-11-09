import {CITIES,RELAUNCH_CITY_NAMES} from './cities'
export const SITEMAP_BASE='https://www.moholocal.com'
export const SITEMAP_CITY_SLUGS=CITIES.filter(c=>RELAUNCH_CITY_NAMES.some(name=>name===c.name)).map(c=>c.slug)
const categories=['restaurants','health-wellness','beauty-spa','retail','education','automotive','real-estate','home-services','pet-services']
export function sitemapStaticPaths() {
  return ['/', '/directory','/discover','/events','/community','/lost-and-found','/new-resident','/classes',
    ...SITEMAP_CITY_SLUGS.flatMap(city=>[`/${city}`,`/new-resident/${city}`,...categories.map(cat=>`/${city}/${cat}`)])]
}
export function xmlEscape(value:string) {return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
export function sitemapXml(entries:Array<{path:string;updated_at?:string|null}>) {
  const seen=new Set<string>()
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+entries.filter(e=>{
    if(seen.has(e.path)) return false;seen.add(e.path);return true
  }).map(e=>{
    const d=e.updated_at?.slice(0,10)
    const date=d&&/^\d{4}-\d{2}-\d{2}$/.test(d)?`<lastmod>${d}</lastmod>`:''
    return `  <url><loc>${xmlEscape(SITEMAP_BASE+e.path)}</loc>${date}</url>`
  }).join('\n')+'\n</urlset>'
}
