import {test} from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {PetProgressSummary} from '../app/components/PetProgress'
import {PetMatchCards,MatchComparisonGuide} from '../app/components/PetMatches'
test('public custody summary separates status confirmation from actual observation and contact',()=>{
 const html=renderToStaticMarkup(React.createElement(PetProgressSummary,{status:'found',progress:'sighted',observedAt:'2026-11-01T18:00:00Z',confirmedAt:'2026-11-12T15:00:00Z',contactStage:'return_arranged',contactAt:'2026-11-11T18:00:00Z'}))
 assert.match(html,/Latest reporter status/);assert.match(html,/animal not secured/)
 assert.match(html,/Observed Nov 1/);assert.match(html,/reporter Nov 12/);assert.match(html,/reunion not confirmed/)
 const legacy=renderToStaticMarkup(React.createElement(PetProgressSummary,{status:'found'}))
 assert.match(legacy,/No reporter confirmation time recorded/);assert.match(legacy,/Custody not confirmed/)
})
test('match review directs residents to latest custody and keeps ownership proof private',()=>{
 const html=renderToStaticMarkup(React.createElement(PetMatchCards,{links:[{id:'link',other_pet_id:'other',title:'Local-only test',city:'Tracy',status:'found',state:'confirmed',revision:1,updated_at:'2026-11-12T15:00:00Z'}],canManage:false,busy:false,onReview:()=>{}}))
 assert.match(html,/\/lost-and-found\/other#reporter-status/)
 assert.match(html,/reunion not confirmed/);assert.match(html,/latest custody/)
 const guide=renderToStaticMarkup(React.createElement(MatchComparisonGuide))
 assert.match(guide,/Photos can be older/);assert.match(guide,/pickup addresses out of public comments/)
})
