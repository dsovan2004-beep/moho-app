import {test} from 'node:test'
import assert from 'node:assert/strict'
import {businessShareUrl,copyShareText} from '../lib/share-links'
const id='506350d5-c30a-4d63-8dc7-efcb24f76b9f'
test('business sharing is fixed to public listing ID and one supported city',()=>{
 for(const city of ['Mountain House','Tracy','Lathrop','Manteca']) {
  const url=new URL(businessShareUrl(id,city)!)
  assert.equal(url.origin,'https://www.moholocal.com')
  assert.equal(url.pathname,`/business/${id}`)
  assert.deepEqual([...url.searchParams.keys()],['city'])
  assert.equal(url.searchParams.get('city'),city)
  assert.equal(url.hash,'')
 }
 assert.equal(businessShareUrl(id,'Manteca&returnTo=/messages'),`https://www.moholocal.com/business/${id}`)
 assert.equal(businessShareUrl(id,['Manteca']),`https://www.moholocal.com/business/${id}`)
 for(const invalid of ['bad',id+'?q=private','https://evil.example',null]) assert.equal(businessShareUrl(invalid,'Tracy'),null)
})
test('copy feedback reports success only after the exact safe payload is written',async()=>{
 let written=''
 assert.equal(await copyShareText(businessShareUrl(id,'Tracy')!,{writeText:async text=>{written=text}}),true)
 assert.equal(written,`https://www.moholocal.com/business/${id}?city=Tracy`)
 assert.equal(await copyShareText('safe public link'),false)
 assert.equal(await copyShareText('safe public link',{writeText:async()=>{throw new Error('Permission denied')}}),false)
})
