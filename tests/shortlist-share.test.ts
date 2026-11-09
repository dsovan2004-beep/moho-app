import {test} from 'node:test'
import assert from 'node:assert/strict'
import {shortlistShare,shortlistFromPath} from '../lib/shortlist-share'
test('all four cities receive stable public city/service routes with no arbitrary search state',()=>{
 for(const city of ['Mountain House','Tracy','Lathrop','Manteca']) {
  const share=shortlistShare(city,'window-cleaning')!
  assert.equal(new URL(share.url).search,'')
  assert.ok(share.title.includes(city))
  assert.equal(share.service?.category,'Home Services')
  assert.match(share.description,/not a quality endorsement/)
  assert.ok(share.text.endsWith(share.url))
 }
 assert.equal(shortlistShare('Manteca')?.path,'/shortlists/manteca')
})
test('unknown/retired cities and services cannot silently broaden a shared shortlist',()=>{
 for(const city of ['All Cities','San Jose','Brentwood','unknown'])assert.equal(shortlistShare(city),null)
 assert.equal(shortlistShare('Tracy','unknown'),null)
 assert.equal(shortlistFromPath('manteca',['window-cleaning','extra']),null)
 assert.equal(shortlistFromPath('unknown'),null)
 assert.equal(shortlistFromPath('manteca',['pest-control'])?.service?.tag,'pest control')
})
