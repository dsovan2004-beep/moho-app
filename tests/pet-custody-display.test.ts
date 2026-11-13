import {test} from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {PetReportControls} from '../app/components/PetStatusControls'
import {PetProgressSummary} from '../app/components/PetProgress'
import {PetMatchCards,MatchComparisonGuide,PetMatchResults} from '../app/components/PetMatches'
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

test('failed match actions preserve known cards and offer read-only refresh before retry',()=>{
 const html=renderToStaticMarkup(React.createElement(PetMatchResults,{links:[{id:'test',other_pet_id:'other',title:'LOCAL TEST RECORD',city:'Manteca',status:'found',state:'possible',revision:1,updated_at:'2026-11-12T15:00:00Z'}],canManage:true,busy:false,loading:false,loadError:'',actionError:'A newer revision exists.',onRetry:()=>{},onReview:()=>{}}))
 assert.match(html,/LOCAL TEST RECORD/);assert.match(html,/A newer revision exists/)
 assert.match(html,/Refresh matches/);assert.match(html,/check the saved decision/)
 assert.equal((html.match(/disabled=""/g)??[]).length,3)
 assert.doesNotMatch(html,/No possible matches linked/);assert.doesNotMatch(html,/was saved/)
})
test('match loading failures are not presented as an empty successful result',()=>{
 const html=renderToStaticMarkup(React.createElement(PetMatchResults,{links:[],canManage:false,busy:false,loading:false,loadError:'Could not load.',actionError:'',onRetry:()=>{},onReview:()=>{}}))
 assert.match(html,/Retry loading matches/);assert.doesNotMatch(html,/No possible matches linked/)
})

test('archive and reunion controls clearly name the action instead of promising archive renewal',()=>{
 const report={id:'00000000-0000-4000-8000-000000000060',title:'LOCAL TEST',pet_name:'',city:'Tracy',status:'archived',status_revision:1,status_confirmed_at:null,created_at:'2026-11-01T18:00:00Z',under_review:false,expires_at:'2026-12-01T18:00:00Z',expired:false}
 const archive=renderToStaticMarkup(React.createElement(PetReportControls,{report,onSaved:()=>{}}))
 assert.match(archive,/>Archive report<\/button>/);assert.doesNotMatch(archive,/>Confirm status and renew/)
 const reunion=renderToStaticMarkup(React.createElement(PetReportControls,{report:{...report,status:'reunited'},onSaved:()=>{}}))
 assert.match(reunion,/>Confirm reunion and renew 30 days<\/button>/)
})
