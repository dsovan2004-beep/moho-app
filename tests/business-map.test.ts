import {test} from 'node:test'
import assert from 'node:assert/strict'
import {businessMapQuery} from '../lib/business-map'
test('map destinations retain complete addresses without duplicate city/state',()=>{
 assert.equal(businessMapQuery('17600 Golden Valley Pkwy, Lathrop, CA 95330','Lathrop'),'17600 Golden Valley Pkwy, Lathrop, CA 95330')
 assert.equal(businessMapQuery('296 Northgate Drive, Manteca, CA 95336','Manteca'),'296 Northgate Drive, Manteca, CA 95336')
 assert.equal(businessMapQuery('  12 Main St  ','Tracy'),'12 Main St, Tracy, CA')
 assert.equal(businessMapQuery('12 Main St, Tracy','Tracy'),'12 Main St, Tracy, CA')
})
test('map context never overwrites explicit address geography or treats a street word as the city',()=>{
 assert.equal(businessMapQuery('12 Manteca Avenue','Manteca'),'12 Manteca Avenue, Manteca, CA')
 assert.equal(businessMapQuery('1 Main St, Stockton, CA 95202','Tracy'),'1 Main St, Stockton, CA 95202')
 assert.equal(businessMapQuery('','Tracy'),'')
})
