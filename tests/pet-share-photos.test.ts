import test from 'node:test'
import assert from 'node:assert/strict'
import {appendPetPhotos,promotePetPhoto,replacePetPhoto,PET_PHOTO_MAX_BYTES} from '../lib/pet-share-photos'
const image=(name:string,size=500,type='image/jpeg')=>({name,size,type})
test('replacement at capacity preserves slot, count, other identities and original input',()=>{
 const selection=[image('cover.jpg'),image('same.jpg'),image('same.jpg')],next=image('replacement.webp',400,'image/webp')
 for(const index of [0,1,2]){
  const result=replacePetPhoto(selection,index,[next])
  assert.equal(result.error,null);assert.equal(result.files.length,3);assert.equal(result.files[index],next)
  selection.forEach((file,i)=>{if(i!==index)assert.equal(result.files[i],file)})
 }
 assert.equal(selection[0].name,'cover.jpg');assert.equal(selection[1].name,'same.jpg');assert.notEqual(selection[1],selection[2])
 for(const batch of [[image('bad.svg',1,'image/svg+xml')],[image('empty.jpg',0)],[image('large.jpg',PET_PHOTO_MAX_BYTES+1)],[next,next]]){
  const result=replacePetPhoto(selection,0,batch);assert.ok(result.error);assert.deepEqual(result.files,selection)
 }
 assert.deepEqual(replacePetPhoto(selection,0,[]),{files:selection,error:null})
 for(const index of [-1,3,NaN,0.5]){const result=replacePetPhoto(selection,index,[next]);assert.ok(result.error);assert.deepEqual(result.files,selection)}
})
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

test('cover promotion preserves File identity, every photo and gallery order without mutating the selection',()=>{
 const cover=image('cover.jpg'),second=image('same-name.jpg'),third=image('same-name.jpg')
 const selection=[cover,second,third]
 const promoted=promotePetPhoto(selection,2)
 assert.deepEqual(promoted,[third,cover,second])
 assert.equal(promoted[0],third);assert.equal(promoted[1],cover);assert.equal(promoted[2],second)
 assert.deepEqual(selection,[cover,second,third])
 assert.deepEqual(promotePetPhoto(selection,0),selection)
 for(const index of [-1,3,1.5,NaN])assert.deepEqual(promotePetPhoto(selection,index),selection)
 assert.deepEqual(promotePetPhoto([],0),[])
})
