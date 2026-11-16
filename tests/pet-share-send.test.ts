import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {sendPetSharePhotos,type PetShareSendProgress} from '../lib/pet-share-send'
import PetShareSendProgressView from '../app/components/PetShareSendProgress'

test('photo preparation is sequential, and every image is prepared before private upload starts',async()=>{
 const calls:string[]=[];let active=0;let peak=0
 await sendPetSharePhotos([1,2,3],{
  prepare:async n=>{active++;peak=Math.max(peak,active);calls.push(`prepare${n}`);await new Promise(resolve=>setTimeout(resolve,1));active--;return `blob${n}`},
  onPrepared:()=>calls.push('lock'),onProgress:p=>{if(p.phase!=='saving')calls.push(`${p.phase}${p.photo}`)},
  upload:async(blob,index)=>{calls.push(`upload${index}:${blob}`)},
 })
 assert.equal(peak,1)
 assert.deepEqual(calls,['preparing1','prepare1','preparing2','prepare2','preparing3','prepare3','lock','uploading1','upload0:blob1','uploading2','upload1:blob2','uploading3','upload2:blob3'])
})
test('preparation failures never upload or lock, while failed uploads stop the remaining work',async()=>{
 let uploaded=0;let locked=false
 await assert.rejects(sendPetSharePhotos([1,2],{prepare:async n=>{if(n===2)throw new Error('decode');return n},upload:async()=>{uploaded++},onPrepared:()=>{locked=true},onProgress:()=>{}}),/Photo 2 could not be prepared/)
 assert.equal(uploaded,0);assert.equal(locked,false)
 await assert.rejects(sendPetSharePhotos([1,2,3],{prepare:async n=>n,upload:async()=>{uploaded++;throw new Error('offline')},onPrepared:()=>{locked=true},onProgress:()=>{}}),/Photo 1 upload could not be confirmed/)
 assert.equal(uploaded,1);assert.equal(locked,true)
 for(const files of [[],[1,2,3,4]])await assert.rejects(sendPetSharePhotos(files,{prepare:async n=>n,upload:async()=>{throw new Error('must not run')},onPrepared:()=>{},onProgress:()=>{}}),/one to three/)
})
test('progress describes work in flight without claiming receipt or publication',()=>{
 const phases:PetShareSendProgress[]=[{phase:'preparing',photo:1,total:3},{phase:'uploading',photo:2,total:3},{phase:'saving'}]
 for(const progress of phases){const html=renderToStaticMarkup(React.createElement(PetShareSendProgressView,{progress}));assert.match(html,/role="status"/);assert.match(html,/saved request reference/);assert.doesNotMatch(html,/published successfully|upload complete|100%|request saved/i)}
 const idle=renderToStaticMarkup(React.createElement(PetShareSendProgressView,{progress:null}))
 assert.match(idle,/role="status"/);assert.doesNotMatch(idle,/Preparing|Uploading|Saving|Sending progress/)
})
