import {test} from 'node:test'
import assert from 'node:assert/strict'
import {petBoardMetadata} from '../lib/pet-board-metadata'
test('default pet filter variants canonicalize together without merging history',()=>{
 const a=petBoardMetadata({})
 assert.deepEqual(a.alternates,petBoardMetadata({city:'All Cities',status:'All'}).alternates)
 assert.equal(a.alternates?.canonical,'https://www.moholocal.com/lost-and-found')
 assert.notDeepEqual(a.alternates,petBoardMetadata({history:'1'}).alternates)
})
test('city status and history remain distinct views without claiming current custody',()=>{
 for(const city of ['Mountain House','Tracy','Lathrop','Manteca']) {
 const a=petBoardMetadata({city,status:'found'})
 assert.ok(String(a.title).includes(city))
 assert.ok(String(a.alternates?.canonical).includes('status=found'))
 assert.ok(a.description?.includes('does not establish custody'))
 }
 assert.ok(String(petBoardMetadata({status:'reunited'}).title).startsWith('Recorded'))
})
test('invalid and duplicate pet filters do not create indexable landing pages',()=>{
 for(const p of [{city:'Brentwood'},{city:['Tracy','Manteca']},{status:'unknown'},{status:'__proto__'},{status:'constructor'},{history:'2'}]) {
 const a=petBoardMetadata(p);assert.equal(a.alternates,undefined);assert.deepEqual(a.robots,{index:false,follow:true})
 }
})
