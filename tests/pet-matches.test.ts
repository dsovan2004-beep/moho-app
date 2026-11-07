import {test} from 'node:test'
import assert from 'node:assert/strict'
import {petReportId,matchLabel,contactLabel} from '../lib/pet-matches'
const id='00000000-0000-4000-8000-000000000060'
test('pet links accept canonical reports and reject external, credential and lookalike destinations',()=>{
 for(const link of [id,`/lost-and-found/${id}`,`https://www.moholocal.com/lost-and-found/${id}?city=Tracy`])assert.equal(petReportId(link),id)
 for(const link of [`https://evil.test/lost-and-found/${id}`,`https://www.moholocal.com.evil.test/lost-and-found/${id}`,`https://user@www.moholocal.com/lost-and-found/${id}`,`http://www.moholocal.com/lost-and-found/${id}`,`https://www.moholocal.com:444/lost-and-found/${id}`,'javascript:alert(1)','/messages'])assert.throws(()=>petReportId(link),/Paste a MoHoLocal/)
})
test('contact and matching labels never substitute for completed reunion or verified ownership',()=>{
 assert.equal(contactLabel('return_arranged'),'Return arranged — reunion not confirmed')
 assert.match(matchLabel('possible'),/not confirmed/)
 assert.match(matchLabel('confirmed'),/reunion not confirmed/)
 assert.equal(contactLabel(null),'Contact not confirmed')
})
