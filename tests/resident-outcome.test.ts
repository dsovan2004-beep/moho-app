import {test} from 'node:test'
import assert from 'node:assert/strict'
import {renderToStaticMarkup} from 'react-dom/server'
import React from 'react'
import ResidentOutcome from '../app/components/ResidentOutcome'

test('outcome reporting is optional and separates self-reports from bookings',()=>{
  const html=renderToStaticMarkup(React.createElement(ResidentOutcome,{city:'Lathrop'}))
  assert.match(html,/<details/)
  assert.doesNotMatch(html,/<details[^>]* open/)
  assert.match(html,/not a public business review or a verified booking/)
  assert.match(html,/separate account record keeps only your latest reporting day/)
  assert.match(html,/One update per account per Pacific calendar day/)
  assert.match(html,/I tried but could not reach a provider/)
  assert.match(html,/I reached a provider/)
  assert.match(html,/I found someone to help through the directory/)
  assert.doesNotMatch(html,/<textarea|type="email"|type="tel"/)
  assert.match(html,/Share my update/)
  assert.doesNotMatch(html,/Your optional update was counted/)
})
