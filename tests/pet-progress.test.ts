import {test} from 'node:test'
import assert from 'node:assert/strict'
import {compatibleProgress,localObservationInput,observationInstant,petProgressLabel} from '../lib/pet-progress'
test('legacy found reports do not imply secured; reunion is reporter-confirmed',()=>{
 assert.equal(petProgressLabel(undefined,'found'),'Sighting / secured status not confirmed')
 assert.equal(petProgressLabel('sighted','found'),'Sighted — not secured')
 assert.equal(petProgressLabel('unknown','reunited'),'Reunited — reporter confirmed')
})
test('changing report classification cannot retain contradictory possession',()=>{
 assert.equal(compatibleProgress('lost','secured'),'unknown')
 assert.equal(compatibleProgress('reunited','sighted'),'unknown')
 assert.equal(compatibleProgress('found','secured'),'secured')
})
test('observation time is explicit and round-trips device local time',()=>{
 const input='2026-11-06T10:15'
 assert.equal(localObservationInput(observationInstant(input)),input)
 assert.equal(localObservationInput(null),'')
 assert.throws(()=>observationInstant(''),/Enter when/)
 assert.throws(()=>observationInstant('invalid'),/Enter when/)
})
