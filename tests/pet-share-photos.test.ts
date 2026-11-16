import test from 'node:test'
import assert from 'node:assert/strict'
import {appendPetPhotos,PET_PHOTO_MAX_BYTES} from '../lib/pet-share-photos'
const image=(name:string,size=500,type='image/jpeg')=>({name,size,type})
test('photo selection appends in cover/gallery order without mutating earlier choices',()=>{
 const current=[image('first.jpg')];const next=image('second.jpg')
 const result=appendPetPhotos(current,[next])
 assert.deepEqual(result,{files:[current[0],next],error:null})
 assert.deepEqual(current,[image('first.jpg')])
 assert.deepEqual(appendPetPhotos(current,[]),{files:current,error:null})
})
test('bad or oversized batches preserve selected photos instead of silently dropping or replacing them',()=>{
 const current=[image('cover.jpg')]
 for(const batch of [[image('a.jpg'),image('b.jpg'),image('c.jpg')],[image('bad.svg',40,'image/svg+xml')],[image('empty.jpg',0)],[image('large.jpg',PET_PHOTO_MAX_BYTES+1)],[image('good.jpg'),image('bad.txt',20,'text/plain')]]){
  const result=appendPetPhotos(current,batch)
  assert.ok(result.error);assert.deepEqual(result.files,current)
 }
 assert.equal(appendPetPhotos(current,[image('max.png',PET_PHOTO_MAX_BYTES,'image/png'),image('third.webp',100,'image/webp')]).error,null)
})
