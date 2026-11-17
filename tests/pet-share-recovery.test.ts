import test from 'node:test'
import assert from 'node:assert/strict'
import {recoverPetShareReference} from '../lib/pet-share-recovery'
const id='00000000-0000-4000-8000-000000000091'
test('recovery recognizes only the requested saved reference; a confirmed empty read is distinct',async()=>{
 assert.deepEqual(await recoverPetShareReference(id,async()=>({data:{id},error:null})),{state:'saved',id})
 assert.deepEqual(await recoverPetShareReference(id,async()=>({data:null,error:null})),{state:'missing'})
})
test('failed, malformed or wrong-reference reads never mean missing and cannot expose backend errors',async()=>{
 for(const result of [{data:null,error:{message:'private backend detail'}},{data:undefined,error:null},{data:[],error:null},{data:{id:'00000000-0000-4000-8000-000000000092'},error:null},{data:{},error:null}]){
  await assert.rejects(recoverPetShareReference(id,async()=>result),error=>error instanceof Error&&/Nothing was resent/.test(error.message)&&!error.message.includes('private backend detail'))
 }
 await assert.rejects(recoverPetShareReference(id,async()=>{throw new Error('network')}),/Nothing was resent/)
 let called=false;await assert.rejects(recoverPetShareReference('invalid',async()=>{called=true;return {data:null,error:null}}),/invalid/);assert.equal(called,false)
})
