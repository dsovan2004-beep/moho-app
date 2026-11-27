import {test} from 'node:test'
import assert from 'node:assert/strict'
import {directoryTextSearch,normalizeSearchApostrophes} from '../lib/directory-search'

test('straight and smart apostrophe searches query both stored name spellings',()=>{
 const expected=directoryTextSearch("Sam's Club")
 for(const query of ["Sam’s Club","Sam‘s Club","Samʼs Club","Sam＇s Club","  Sam’s   Club  "]) assert.deepEqual(directoryTextSearch(query),expected)
 assert.ok(expected.filter.includes("name.ilike.%Sam's Club%"))
 assert.ok(expected.filter.includes('name.ilike.%Sam’s Club%'))
 assert.equal(normalizeSearchApostrophes('Sam’s Club').toLowerCase(),normalizeSearchApostrophes("Sam's Club").toLowerCase())
})
test('name typography support does not admit PostgREST operators or user wildcards',()=>{
 const result=directoryTextSearch("Sam’s%,id.in.(private),name.eq.*\"Club\"")
 assert.equal(result.term,"Sam's id in private name eq Club")
 assert.ok(!/[()*_"]/u.test(result.filter))
 assert.ok(!result.filter.includes('id.in.('))
 assert.equal(result.filter.split(',').length,10)
})
test('ordinary Unicode names, whitespace, length limits and empty searches remain bounded',()=>{
 assert.equal(directoryTextSearch('  café   repair  ').term,'café repair')
 assert.equal(directoryTextSearch('a'.repeat(120)).term.length,100)
 assert.deepEqual(directoryTextSearch('%,()._*'),{term:'',filter:''})
 assert.equal(directoryTextSearch('garage door repair').filter.split(',').length,5)
})
