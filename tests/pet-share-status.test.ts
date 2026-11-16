import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import PetShareStatus from '../app/components/PetShareStatus'
const id='00000000-0000-4000-8000-000000000091'
const reportId='00000000-0000-4000-8000-000000000092'
const render=(status:string,report:string|null)=>renderToStaticMarkup(React.createElement(PetShareStatus,{request:{id,title:'Reporter request',review_status:status,published_report_id:report}}))
test('only approved requests expose a validated pet report link; other states do not imply publication',()=>{
 for(const status of ['pending','rejected','withdrawn','unknown','constructor'])assert.doesNotMatch(render(status,reportId),/href=/)
 assert.match(render('pending',null),/Pending review · photos private/)
 assert.match(render('withdrawn',reportId),/Permission withdrawn · report hidden/)
 assert.match(render('approved',reportId),new RegExp(`/lost-and-found/${reportId}`))
 for(const value of [null,'https://evil.example','javascript:alert(1)'])assert.doesNotMatch(render('approved',value),/href=/)
 assert.doesNotMatch(render('approved',reportId),/currently public|currently visible|reunited/i)
})
