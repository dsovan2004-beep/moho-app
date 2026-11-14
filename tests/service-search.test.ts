import {test} from 'node:test'
import assert from 'node:assert/strict'
import {serviceSearchTag} from '../lib/services'

test('exact resident role terms match the checked service, despite name/description wording',()=>{
  for(const query of ['electrician',' Electricians ','ELECTRICAL']) assert.equal(serviceSearchTag(query),'electrical services')
  assert.equal(serviceSearchTag('plumber'),'plumbing')
  assert.equal(serviceSearchTag('dog walker'),'dog walking')
})
test('canonical service names retain precise specialties and whitespace tolerance',()=>{
  assert.equal(serviceSearchTag('garage   door repair'),'garage door repair')
  assert.equal(serviceSearchTag('Carpet & tile cleaning'),'carpet cleaning')
  assert.equal(serviceSearchTag('Carpet   tile cleaning'),'carpet cleaning')
  assert.equal(serviceSearchTag('solar bird exclusion'),'solar bird exclusion')
})
test('ambiguous jobs, company names and filter-like text do not infer a service',()=>{
  for(const query of ['cleaning','solar','pet care','Electrician Brothers','electrician,city.eq.Tracy','']) assert.equal(serviceSearchTag(query),undefined)
})

test('dog training discovery accepts exact resident terms without broadening general training or businesses',()=>{
 for(const q of ['dog training',' Dog Trainer ','DOG TRAINERS'])assert.equal(serviceSearchTag(q),'dog training')
 for(const q of ['training','trainer','K9 Courage Dog Training','dog boarding','aggressive dog'])assert.equal(serviceSearchTag(q),undefined)
})
