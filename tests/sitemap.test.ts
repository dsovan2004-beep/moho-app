import {existsSync} from 'node:fs'
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {sitemapStaticPaths,sitemapXml,SITEMAP_CITY_SLUGS} from '../lib/sitemap'
test('sitemap static URLs cover four current cities and exclude retired/utility routes',()=>{
  assert.deepEqual(SITEMAP_CITY_SLUGS.sort(),['lathrop','manteca','mountain-house','tracy'])
  const paths=sitemapStaticPaths()
  for(const city of SITEMAP_CITY_SLUGS) assert.ok(paths.includes(`/${city}/home-services`))
  assert.ok(paths.includes('/classes'));assert.ok(paths.includes('/discover'))
  assert.ok(paths.every(p=>!/^\/best|brentwood|san-jose|santa-clara|sunnyvale|submit|admin|messages|my-requests/.test(p)))
})
test('sitemap escapes XML, deduplicates and only emits date-shaped lastmod',()=>{
  const xml=sitemapXml([{path:'/events?city=Tracy&month=11',updated_at:'2026-11-08T12:00:00Z'},{path:'/events?city=Tracy&month=11'},{path:'/directory',updated_at:'<bad>'}])
  assert.match(xml,/Tracy&amp;month/);assert.equal((xml.match(/<url>/g)??[]).length,2)
  assert.match(xml,/<lastmod>2026-11-08<\/lastmod>/);assert.doesNotMatch(xml,/<bad>/)
})

test('no static sitemap asset shadows the live catalog route',()=>{
  assert.equal(existsSync(new URL('../public/sitemap.xml',import.meta.url)),false)
})
