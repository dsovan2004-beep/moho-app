import {test} from 'node:test'
import assert from 'node:assert/strict'
import {renderToStaticMarkup} from 'react-dom/server'
import React from 'react'
import {businessHref, directoryReturn, contactPreference, discoveryContext, latestCheck, textContact} from '../lib/business-discovery'
import BusinessContactActions from '../app/components/BusinessContactActions'
import type {Business} from '../lib/supabase'
const old = {checked_at:'2026-10-01',source_url:'https://example.com',checked_fields:[],service_areas:['Tracy'],service_tags:['plumbing'],scope_note:''}
const recent = {...old,checked_at:'2026-11-06',service_areas:['Mountain House','Tracy'],service_tags:['handyman']}
const biz: Business = {id:'one',name:'Example',category:'Home Services',description:'',address:'',created_at:'2026-11-06',city:'Service area only',listing_checks:[old,recent]}

test('discovery retains resident city and only a service supported by this listing',()=>{
  assert.deepEqual(discoveryContext(biz,'Tracy','handyman').tags,['handyman'])
  assert.equal(discoveryContext(biz,'Tracy','handyman').city,'Tracy')
  assert.equal(discoveryContext(biz,'bad-city','plumbing').city,'Mountain House')
  assert.equal(discoveryContext(biz,'Tracy','plumbing').service,undefined)
})
test('latest evidence wins without changing incoming order',()=>{
  assert.equal(latestCheck(biz.listing_checks),recent)
  assert.equal((biz.listing_checks as typeof old[])[0],old)
  assert.equal(latestCheck(null),null)
})
test('detail links retain known city/service and reject arbitrary context',()=>{
  assert.equal(businessHref('id','Mountain House','house-cleaning'),'/business/id?city=Mountain+House&service=house-cleaning')
  assert.equal(businessHref('id','bad-city','bad-service'),'/business/id')
})
test('request-first instructions cannot be inherited by lookalike hosts',()=>{
  assert.ok(contactPreference('https://www.mattdisko.com/'))
  assert.equal(contactPreference('https://mattdisko.com.example.com'),null)
  assert.equal(contactPreference('not a url'),null)
})
test('request-first contact renders before follow-up phone with an accessible target',()=>{
  const html=renderToStaticMarkup(React.createElement(BusinessContactActions,{phone:'5102397080',website:'https://www.mattdisko.com/'}))
  assert.ok(html.indexOf('Start service request') < html.indexOf('Call for follow-up'))
  assert.match(html,/required website request form/)
  assert.match(html,/min-h-11/)
})


test('text channel requires the exact checked provider host and phone',()=>{
  assert.equal(textContact('https://www.ithinkpet.com/','+1 (510) 274-1750')?.href,'sms:+15102741750')
  assert.equal(textContact('https://ithinkpet.com.example.com/','5102741750'),null)
  assert.equal(textContact('https://ithinkpet.com/','2095550100'),null)
  const html=renderToStaticMarkup(React.createElement(BusinessContactActions,{phone:'(510) 274-1750',website:'https://www.ithinkpet.com/'}))
  assert.match(html,/href="sms:\+15102741750"/)
  assert.doesNotMatch(html,/sms:[^" ]*[?&]body=/)
  assert.doesNotMatch(html,/tel:/)
  assert.match(html,/nothing is sent automatically/)
})


test('directory detail round-trip retains exact search, filters and sort',()=>{
  const destination='/directory?city=All+Cities&category=All&q=Shamblin&sort=newest'
  const detail=new URL(businessHref('id','Lathrop',undefined,destination),'https://www.moholocal.com')
  assert.equal(directoryReturn(detail.searchParams.get('returnTo')),destination)
  const scoped='/directory?city=Manteca&category=Home+Services&service=electrical-services&q=electrician&sort=name'
  assert.equal(directoryReturn(scoped),scoped)
})
test('directory return rejects foreign destinations, duplicate fields and arbitrary routing',()=>{
  for(const value of ['https://evil.example/directory?city=Tracy','//evil.example/directory?city=Tracy','/directory/../login?city=Tracy','/directory?city=Tracy&city=Manteca','/directory?city=Tracy&redirect=https://evil.example','/directory?city=unknown','/directory?category=unknown','/directory?city=Tracy#login',['/directory?city=Tracy']]) assert.equal(directoryReturn(value),null)
  assert.equal(directoryReturn('/directory?q='+ 'a'.repeat(201)),null)
  assert.equal(directoryReturn('/directory?q=%00'),null)
  assert.equal(new URL(directoryReturn('/directory?q=A%26B')!,'https://www.moholocal.com').searchParams.get('q'),'A&B')
})
