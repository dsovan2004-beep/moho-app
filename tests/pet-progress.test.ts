import {test} from 'node:test'
import assert from 'node:assert/strict'
import {compatibleProgress,localObservationInput,observationInstant,petProgressLabel} from '../lib/pet-progress'
test('legacy found reports do not imply secured or independently confirmed reunion',()=>{
 assert.equal(petProgressLabel(undefined,'found'),'Sighting / secured status not confirmed')
 assert.equal(petProgressLabel('sighted','found'),'Sighted — not secured')
 assert.equal(petProgressLabel('unknown','reunited'),'Reunited — recorded status')
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
test('secured labels reflect contact without continuing to claim the owner is being sought',()=>{
 assert.equal(petProgressLabel('secured','found','contacted'),'Secured — contact made')
 assert.equal(petProgressLabel('secured','found','return_arranged'),'Secured — return arranged')
 assert.equal(petProgressLabel('unknown','reunited','return_arranged'),'Reunited — recorded status')
})

test('changing custody state never reuses the previous sighting observation time',async()=>{
 const {observationForProgress}=await import('../lib/pet-progress')
 const old='2026-11-01T10:15'
 assert.equal(observationForProgress('sighted','secured',old),'')
 assert.equal(observationForProgress('secured','sighted',old),'')
 assert.equal(observationForProgress('secured','unknown',old),'')
 assert.equal(observationForProgress('sighted','sighted',old),old)
})
test('found classification and incompatible legacy progress do not imply custody',async()=>{
 const {petCustodyLabel}=await import('../lib/pet-progress')
 assert.match(petCustodyLabel(null,'found'),/Custody not confirmed/)
 assert.match(petCustodyLabel('secured','lost'),/Custody not confirmed/)
 assert.equal(petProgressLabel('secured','lost'),'Sighting / secured status not confirmed')
 assert.match(petCustodyLabel('secured','found'),/according to the reporter/)
 assert.match(petCustodyLabel('sighted','found'),/not secured/)
})
