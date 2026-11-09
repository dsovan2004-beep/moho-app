import {test} from 'node:test'
import assert from 'node:assert/strict'
import {regionalDirectoryFilter} from '../lib/directory-scope'

test('regional view includes the four city locations and only explicitly checked outside providers',()=>{
 const id='506350d5-c30a-4d63-8dc7-efcb24f76b9f'
 const filter=regionalDirectoryFilter([id,id])
 assert.equal(filter,`city.in.("Mountain House","Tracy","Lathrop","Manteca"),id.in.(${id})`)
 for(const city of ['San Jose','Santa Clara','Sunnyvale','Brentwood']) assert.ok(!filter.includes(city))
})
test('missing or malformed coverage IDs cannot broaden the regional filter',()=>{
 const base='city.in.("Mountain House","Tracy","Lathrop","Manteca")'
 assert.equal(regionalDirectoryFilter([]),base)
 assert.equal(regionalDirectoryFilter(['bad),city.neq.null',null,123,'506350d5-c30a-4d63-8dc7-efcb24f76b9f?city=San+Jose']),base)
})
