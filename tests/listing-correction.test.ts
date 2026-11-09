import {test} from 'node:test'
import assert from 'node:assert/strict'
import {listingCorrectionParams} from '../lib/listing-correction'
import {safeReturnTo} from '../lib/auth-return'
const id='506350d5-c30a-4d63-8dc7-efcb24f76b9f'
test('correction handoff preserves resident city rather than office city and survives sign-in',()=>{
 const p=listingCorrectionParams(id,'A&B Electric','Lathrop','Manteca')
 assert.equal(p.get('city'),'Manteca')
 assert.equal(p.get('title'),'Listing correction: A&B Electric')
 assert.equal(p.get('business_id'),id)
 assert.equal(safeReturnTo(`/submit?${p}`),`/submit?${p}`)
})
test('unknown/repeated city falls back to actual supported office or explicit coverage only',()=>{
 assert.equal(listingCorrectionParams(id,'Example','Tracy',['Manteca','Tracy']).get('city'),'Tracy')
 assert.equal(listingCorrectionParams(id,'Example','Modesto','unknown',['Lathrop']).get('city'),'Lathrop')
 assert.equal(listingCorrectionParams(id,'Example','Service area only',undefined).has('city'),false)
})
test('invalid listing IDs cannot generate correction links and long names remain bounded',()=>{
 assert.throws(()=>listingCorrectionParams('bad','Example','Tracy','Tracy'))
 assert.equal(listingCorrectionParams(id,'A'.repeat(250),'Tracy','Tracy').get('title')?.length,200)
})
