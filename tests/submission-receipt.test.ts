import { test } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { savedSubmissionReference, receiptListingHref } from '../lib/submission-receipt'
import SubmissionReceipt from '../app/components/SubmissionReceipt'
const id='506350d5-c30a-4d63-8dc7-efcb24f76b9f'
test('receipt requires actual saved ID and explicit pending-review success contract',()=>{
 assert.equal(savedSubmissionReference({status:'success',submission_id:id,needs_review:true}),id)
 for(const value of [null,[],{}, {status:'success'}, {status:'success',submission_id:'not-an-id',needs_review:true},{status:'success',submission_id:id,needs_review:false},{status:'error',submission_id:id,needs_review:true},{status:'success',submission_id:id}]) assert.equal(savedSubmissionReference(value),null)
})
test('listing return uses only a UUID and supported city, never an arbitrary destination',()=>{
 assert.equal(receiptListingHref(id,'Manteca'),`/business/${id}?city=Manteca`)
 assert.equal(receiptListingHref('https://evil.example','Manteca'),null)
 assert.equal(receiptListingHref(id,'https://evil.example'),`/business/${id}`)
})
test('correction receipt renders saved reference, review status and original listing return',()=>{
 const html=renderToStaticMarkup(React.createElement(SubmissionReceipt,{reference:id,listingId:id,city:'Manteca',onAnother:()=>{}}))
 assert.match(html,/Correction received/)
 assert.match(html,/pending review/)
 assert.match(html,/Request reference/)
 assert.ok(html.includes(id))
 assert.ok(html.includes(`/business/${id}?city=Manteca`))
 assert.doesNotMatch(html,/my-requests|published successfully|approved successfully/i)
})
