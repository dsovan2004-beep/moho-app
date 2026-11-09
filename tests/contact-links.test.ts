import {test} from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {businessPhoneHref,businessWebsiteHref} from '../lib/contact-links'
import BusinessContactActions from '../app/components/BusinessContactActions'

test('contact links accept ordinary public phone/website data without allowing app instructions',()=>{
 assert.equal(businessPhoneHref('(209) 229-5487'),'tel:+12092295487')
 assert.equal(businessPhoneHref('+1 209 229 5487 ext. 12'),'tel:+12092295487;ext=12')
 assert.equal(businessPhoneHref('+44 20 7946 0958'),'tel:+442079460958')
 assert.equal(businessPhoneHref('+64 9 555 0123'),'tel:+6495550123')
 for(const value of ['911','javascript:2092295487','2092295487?body=private','2092295487;123',undefined]) assert.equal(businessPhoneHref(value),null)
 assert.equal(businessWebsiteHref('https://example.com/contact?city=Tracy'),'https://example.com/contact?city=Tracy')
 for(const value of ['javascript://mattdisko.com','data:text/html,hi','//example.com','https://user:pass@example.com','https://example.com\n',undefined]) assert.equal(businessWebsiteHref(value),null)
})
test('malformed contacts are omitted and accessible names identify their business',()=>{
 const bad=renderToStaticMarkup(React.createElement(BusinessContactActions,{phone:'2095550100?body=private',website:'javascript:alert(1)',businessName:'Example'}))
 assert.doesNotMatch(bad,/<a /)
 assert.match(bad,/Contact details are unavailable/)
 const good=renderToStaticMarkup(React.createElement(BusinessContactActions,{phone:'2092295487',website:'https://example.com/',businessName:'Example'}))
 assert.match(good,/aria-label="Call 2092295487 — Example"/)
 assert.match(good,/aria-label="Visit website — Example"/)
})
