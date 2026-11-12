import {test} from 'node:test'
import assert from 'node:assert/strict'
import {activityHref,activityStream} from '../lib/activity-filters'
test('activity routes preserve selected stream across the four cities without private state',()=>{
 for(const city of ['Mountain House','Tracy','Lathrop','Manteca']) {
  const url=new URL(activityHref(city,'discussions'),'https://www.moholocal.com')
  assert.equal(url.searchParams.get('city'),city);assert.equal(url.searchParams.get('stream'),'discussions')
  assert.deepEqual([...url.searchParams.keys()],['city','stream'])
 }
 assert.equal(activityHref(undefined,'events'),'/activity?stream=events')
 assert.equal(activityHref('Manteca','all'),'/activity?city=Manteca')
})
test('unsupported activity types and retired cities normalize without arbitrary query injection',()=>{
 assert.equal(activityStream('fake'), 'all');assert.equal(activityStream('events&city=Brentwood'),'all')
 assert.equal(activityHref('Brentwood','pets'),'/activity?stream=pets')
 assert.equal(activityHref('Manteca&next=https://example.test','listings'),'/activity?stream=listings')
})
