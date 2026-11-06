import {test} from 'node:test'
import assert from 'node:assert/strict'
import {eventDateParts, eventBucket, isUpcomingEvent} from '../lib/event-dates'
test('holiday evening timestamps retain Pacific date and time on UTC servers', () => {
  const p = eventDateParts('2026-12-06T01:00:00+00:00')
  assert.equal(p.date, 'December 5, 2026')
  assert.equal(p.day, '5')
  assert.equal(p.time, '5:00 PM')
  assert.equal(eventDateParts('2026-12-05').time, null)
})
test('same-day events remain visible until their known end or local midnight', () => {
  const now = new Date('2026-12-06T02:00:00Z')
  assert.equal(isUpcomingEvent({start_date:'2026-12-06T01:00:00Z'},now), true)
  assert.equal(isUpcomingEvent({start_date:'2026-12-06T01:00:00Z',end_date:'2026-12-06T01:30:00Z'},now), false)
  assert.equal(isUpcomingEvent({start_date:'2026-12-06T01:00:00Z'},new Date('2026-12-06T08:00:00Z')), false)
})
test('buckets use Pacific calendar days across daylight saving transitions', () => {
  assert.equal(eventBucket('2026-11-01T18:00:00-08:00',new Date('2026-11-01T06:30:00Z')), 'tomorrow')
  assert.equal(eventBucket('2026-12-06T01:00:00Z',new Date('2026-12-06T02:00:00Z')), 'today')
})
