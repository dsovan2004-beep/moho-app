import {test} from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {mergeActivity} from '../lib/activity-feed'
import {ActivityCard,type ActivityItem} from '../app/components/ActivityCard'
const row:ActivityItem={id:'13c711d5-c388-4be5-a7f0-aebea3c648ba',type:'business',title:'Example',description:'Source checked',city:'Tracy',created_at:'2026-11-01T00:00:00Z'}
test('new website check ranks by actual check date and replaces older listing-added card',()=>{
 const result=mergeActivity([row,{...row,type:'business_check',created_at:'2026-11-12T13:00:00Z'},{...row,id:'post',type:'community',created_at:'2026-11-11T13:00:00Z'}])
 assert.deepEqual(result.map(x=>x.type),['business_check','community'])
 assert.equal(result[0].created_at,'2026-11-12T13:00:00Z')
})
test('feed ignores invalid dates, deduplicates and bounds newest records',()=>{
 assert.equal(mergeActivity([row,{...row,type:'business_check',created_at:'invalid'}])[0].type,'business')
 const rows=[row,{...row,created_at:'2026-11-02T00:00:00Z'},{...row,id:'other',created_at:'2026-11-03T00:00:00Z'}]
 assert.equal(mergeActivity(rows).length,2)
 assert.equal(mergeActivity(rows,1)[0].id,'other')
})
test('check card uses dated website label and carries resident city without implying opening or quality',()=>{
 const html=renderToStaticMarkup(React.createElement(ActivityCard,{item:{...row,type:'business_check',service_areas:['Tracy','Mountain House'],created_at:'2026-11-12T13:00:00Z'},currentCity:'Mountain House'}))
 assert.match(html,/WEBSITE CHECKED/);assert.match(html,/Checked Nov 12, 2026/);assert.match(html,/city=Mountain\+House/);assert.match(html,/Advertised coverage/);assert.ok(!html.includes('NEW BUSINESS'))
 const added=renderToStaticMarkup(React.createElement(ActivityCard,{item:row}))
 assert.match(added,/LISTING ADDED/)
})
