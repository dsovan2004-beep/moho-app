import {test} from 'node:test'
import assert from 'node:assert/strict'
import {directoryMetadata} from '../lib/directory-metadata'
test('city service metadata distinguishes local discovery and consolidates sort views',()=>{
 const a=directoryMetadata({city:'Manteca',service:'dog-walking',sort:'newest'})
 assert.equal(a.title,'Dog walking in Manteca | MoHoLocal')
 assert.deepEqual(a.alternates,directoryMetadata({city:'Manteca',service:'dog-walking',sort:'name'}).alternates)
 assert.equal(a.alternates?.canonical,'https://www.moholocal.com/directory?city=Manteca&service=dog-walking')
})
test('search text is not echoed into metadata or promoted as an indexable landing page',()=>{
 const a=directoryMetadata({city:'Tracy',q:'private access code'})
 assert.ok(!JSON.stringify(a).includes('private access code'))
 assert.deepEqual(a.robots,{index:false,follow:true})
 assert.equal(a.alternates,undefined)
})
test('invalid duplicated and incompatible filters cannot claim canonical service landing pages',()=>{
 for(const p of [{city:'San Jose'},{city:['Tracy','Manteca']},{category:'Restaurants',service:'dog-walking'},{service:'made-up'}]) {
 const a=directoryMetadata(p);assert.equal(a.alternates,undefined);assert.deepEqual(a.robots,{index:false,follow:true})
 }
})
