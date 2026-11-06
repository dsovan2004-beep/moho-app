import {test} from 'node:test'
import assert from 'node:assert/strict'
import {directoryHref} from '../lib/directory-filters'
const current = {city:'Mountain House',category:'Home Services',service:'plumbing',query:'Example',sort:'name'}
const params = (href:string) => new URL(href,'https://www.moholocal.com').searchParams

test('removing search retains resident city, category and exact service',()=>{
  const p=params(directoryHref(current,{query:null}))
  assert.equal(p.get('q'),null)
  assert.equal(p.get('service'),'plumbing')
  assert.equal(p.get('city'),'Mountain House')
})
test('removing service broadens only service, retaining text and geography',()=>{
  const p=params(directoryHref(current,{service:null}))
  assert.equal(p.get('service'),null)
  assert.equal(p.get('q'),'Example')
  assert.equal(p.get('category'),'Home Services')
})
test('category removal or switching clears a narrower service',()=>{
  for(const category of ['All','Restaurants']) assert.equal(params(directoryHref(current,{category})).get('service'),null)
  assert.equal(params(directoryHref(current,{city:'Tracy'})).get('service'),'plumbing')
})
test('incompatible service URLs cannot keep an invisible service filter',()=>{
  assert.equal(params(directoryHref({...current,category:'Restaurants'})).get('service'),null)
  assert.equal(params(directoryHref({...current,service:'unknown'})).get('service'),null)
})

// These specialties must survive city changes; generic solar cleaning is not bird exclusion.
test('specialty service filters survive city changes without broadening the job',()=>{
  for(const service of ['solar-bird-exclusion','holiday-light-installation']) {
    const p=params(directoryHref({...current,service},{city:'Manteca',query:null}))
    assert.equal(p.get('service'),service)
    assert.equal(p.get('city'),'Manteca')
  }
})
