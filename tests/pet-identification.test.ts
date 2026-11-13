import {test} from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {PetIdentification} from '../app/components/PetIdentification'
test('comparison details display only supplied report fields without inventing missing identifiers',()=>{
 const html=renderToStaticMarkup(React.createElement(PetIdentification,{pet:{coat_description:'White front paws',last_seen:'Yesterday evening',location_detail:'Near a public park'}}))
 assert.match(html,/White front paws/);assert.match(html,/Yesterday evening/)
 assert.equal((html.match(/Not provided/g)??[]).length,3)
 assert.match(html,/not a pickup address/);assert.match(html,/do not confirm a match/)
 assert.doesNotMatch(html,/Confirmed owner|Secured —/)
})
test('comparison fields escape report text and treat whitespace as missing without exposing unrelated contacts',()=>{
 const pet={breed:'<script>alert(1)</script>',age:' ',contact_phone:'PRIVATE_TEST_PHONE',contact_name:'PRIVATE_TEST_NAME'}
 const html=renderToStaticMarkup(React.createElement(PetIdentification,{pet}))
 assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>|PRIVATE_TEST/)
 assert.equal((html.match(/Not provided/g)??[]).length,5)
})

test('existing alternate area is retained and conflicting recorded areas stay visible',()=>{
 const older=renderToStaticMarkup(React.createElement(PetIdentification,{pet:{location_last_seen:'Near park A'}}))
 assert.match(older,/Near park A/)
 const conflict=renderToStaticMarkup(React.createElement(PetIdentification,{pet:{location_detail:'Near park A',location_last_seen:'Near park B'}}))
 assert.match(conflict,/Near park A/);assert.match(conflict,/Additional recorded area/);assert.match(conflict,/Near park B/)
})
