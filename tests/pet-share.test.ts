import test from 'node:test'
import assert from 'node:assert/strict'
import {facebookReportUrl,validatePetShare} from '../lib/pet-share'
const valid={city:'Lathrop',status:'found',title:'Found tabby cat',description:'Seen near a public park; current custody unknown.',sourceUrl:'https://www.facebook.com/groups/123/posts/456/',reportDate:'2026-11-15',credit:'Reporter photo',permission:true}
test('Facebook references stay references and reject misleading hosts/credentials',()=>{
 assert.equal(facebookReportUrl(valid.sourceUrl),valid.sourceUrl)
 for(const url of ['https://facebook.com.evil.test/post','https://facebook.com@evil.test/post','http://facebook.com/posts/1','https://www.facebook.com/','javascript:alert(1)','https://www.facebook.com/post#token'])assert.equal(facebookReportUrl(url),null)
 assert.equal(facebookReportUrl('https://m.facebook.com/story.php?story_fbid=123&id=456'),'https://m.facebook.com/story.php?story_fbid=123&id=456')
})
test('report sharing requires explicit permission, exact city, credit and real date',()=>{
 assert.equal(validatePetShare(valid),null)
 for(const change of [{permission:false},{city:'Brentwood'},{credit:''},{reportDate:'2026-02-31'},{reportDate:'2999-01-01'},{status:'matched'},{description:''}])assert.ok(validatePetShare({...valid,...change}))
})
