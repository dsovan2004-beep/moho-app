import {test} from 'node:test'
import assert from 'node:assert/strict'
import {eventCalendar} from '../lib/event-calendar'
const event={id:'a7dea964-55db-4608-8bad-dfd8e931a4e2',title:'Parade',start_date:'2026-12-05T17:00:00-08:00'}
test('calendar exports exact UTC instant and no invented end time',()=>{
  const result=eventCalendar(event)
  assert.match(result,/DTSTART:20261206T010000Z/)
  assert.doesNotMatch(result,/DTEND:/)
  assert.match(eventCalendar({...event,end_date:'2026-12-05T20:30:00-08:00'}),/DTEND:20261206T043000Z/)
})
test('calendar content cannot inject extra calendar properties and preserves unicode folding',()=>{
  const result=eventCalendar({...event,title:'Hello\r\nATTENDEE:evil@example.com; hi, friend',description:'🎄'.repeat(80)})
  assert.doesNotMatch(result,/\r\nATTENDEE:/)
  assert.match(result,/Hello\\nATTENDEE/)
  for(const line of result.split('\r\n')) assert.ok(Buffer.byteLength(line)<=75)
  assert.ok(result.replace(/\r\n /g,'').includes('🎄'.repeat(80)))
})
