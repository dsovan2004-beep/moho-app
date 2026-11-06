import {test} from 'node:test'
import assert from 'node:assert/strict'
import {legacyBestDestination} from '../lib/legacy-discovery'
const params=(destination:string|null)=>new URL(destination!,'https://www.moholocal.com').searchParams

test('old category bookmarks retain city and category without a ranking destination',()=>{
  assert.equal(legacyBestDestination('restaurants','tracy'),'/directory?city=Tracy&category=Restaurants')
  assert.equal(params(legacyBestDestination('home-services','mountain-house')).get('city'),'Mountain House')
  assert.equal(params(legacyBestDestination('health-and-wellness','brentwood')).get('category'),'Health & Wellness')
})
test('plumber bookmark opens a checked exact-service shortlist rather than all home services',()=>{
  const p=params(legacyBestDestination('plumbers','mountain-house'))
  assert.equal(p.get('service'),'plumbing')
  assert.equal(p.get('category'),'Home Services')
})
test('subcategory bookmarks use visible text filters rather than silently broadening the category',()=>{
  assert.equal(params(legacyBestDestination('pizza','tracy')).get('q'),'pizza')
  assert.equal(params(legacyBestDestination('dentists','manteca')).get('q'),'dentist')
})
test('unknown and inherited object properties are not valid routes or redirect targets',()=>{
  for(const [category,city] of [['constructor','tracy'],['pizza','__proto__'],['unsupported','tracy'],['pizza','https://example.com']]) assert.equal(legacyBestDestination(category,city),null)
})
