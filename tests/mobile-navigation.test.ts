import {test} from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {MobileNavigation} from '../app/components/MobileNavigation'

test('mobile destinations retain city context and expose events without leaking a signed-in action',()=>{
 const html=renderToStaticMarkup(React.createElement(MobileNavigation,{city:'Mountain House',signedIn:false,messageBadge:'PRIVATE_BADGE'}))
 assert.equal((html.match(/<a /g)??[]).length,6)
 for(const route of ['directory','discover','events','lost-and-found','community'])assert.match(html,new RegExp(`href="/${route}\\?city=Mountain\\+House"`))
 assert.match(html,/href="\/login"/);assert.doesNotMatch(html,/href="\/messages"|PRIVATE_BADGE/)
})
test('signed-in navigation retains unread feedback and six distinct named actions',()=>{
 const html=renderToStaticMarkup(React.createElement(MobileNavigation,{city:'Manteca',signedIn:true,messageBadge:React.createElement('span',{'aria-label':'3 unread messages'},'3')}))
 assert.match(html,/href="\/messages"/);assert.match(html,/3 unread messages/)
 for(const name of ['Find help','Explore','Events','Pets','Community','Messages'])assert.match(html,new RegExp(`<span>${name}</span>`))
 assert.doesNotMatch(html,/href="\/login"/)
})
