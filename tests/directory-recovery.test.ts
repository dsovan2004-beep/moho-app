import {test} from 'node:test'
import assert from 'node:assert/strict'
import {directoryRecovery} from '../lib/directory-recovery'
const params=(href:string)=>new URL(href,'https://www.moholocal.com').searchParams

test('empty-search recovery broadens locally before offering other cities',()=>{
 for(const city of ['Mountain House','Tracy','Lathrop','Manteca']) {
  const actions=directoryRecovery({city,category:'Home Services',service:'plumbing',query:'unmatched-name',sort:'newest'})
  const steps=actions.map(a=>params(a.href))
  assert.equal(steps[0].get('q'),null)
  assert.equal(steps[0].get('service'),'plumbing')
  assert.equal(steps[1].get('service'),null)
  assert.equal(steps[1].get('q'),null)
  assert.equal(steps[1].get('category'),'Home Services')
  assert.equal(steps[2].get('category'),'All')
  for(const step of steps.slice(0,-1)) assert.equal(step.get('city'),city)
  assert.equal(steps.at(-1)!.get('city'),'All Cities')
  assert.equal(steps.at(-1)!.get('service'),'plumbing')
  assert.equal(steps.at(-1)!.get('q'),'unmatched-name')
 }
})
test('unfiltered empty results have no self-loop and city-only recovery changes geography explicitly',()=>{
 assert.deepEqual(directoryRecovery({city:'All Cities',category:'All',query:'',sort:'name'}),[])
 const actions=directoryRecovery({city:'Manteca',category:'All',query:'',sort:'name'})
 assert.equal(actions.length,1)
 assert.equal(params(actions[0].href).get('city'),'All Cities')
})
