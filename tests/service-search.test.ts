import {test} from 'node:test'
import assert from 'node:assert/strict'
import {serviceSearchTag,serviceForCategory} from '../lib/services'

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

test('cleanout and dryer vent discovery preserves exact specialties and category boundaries',()=>{
 for(const q of ['junk removal','Junk hauling','Junk removal & cleanouts'])assert.equal(serviceSearchTag(q),'junk removal')
 for(const q of ['dryer vent cleaning',' Dryer vents '])assert.equal(serviceSearchTag(q),'dryer vent cleaning')
 for(const q of ['hauling','cleanouts','dryer repair','vent cleaning','Junk Geni'])assert.equal(serviceSearchTag(q),undefined)
 assert.equal(serviceForCategory('junk-removal','Home Services')?.tag,'junk removal')
 assert.equal(serviceForCategory('dryer-vent-cleaning','Pet Services'),undefined)
})

 test('new cleaning and mobile detailing discovery retains exact job and category boundaries',()=>{
 for(const q of ['mobile auto detailing','Mobile car detailing'])assert.equal(serviceSearchTag(q),'mobile auto detailing')
 for(const q of ['trash bin cleaning','garbage can cleaning'])assert.equal(serviceSearchTag(q),'trash can cleaning')
 assert.equal(serviceSearchTag('gutter cleaners'),'gutter cleaning')
 assert.equal(serviceSearchTag('pressure wash'),'pressure washing')
 for(const q of ['car wash','auto repair','detailing','cleaning','gutter repair','Detail Guyz'])assert.equal(serviceSearchTag(q),undefined)
 assert.equal(serviceForCategory('mobile-auto-detailing','Automotive')?.tag,'mobile auto detailing')
 assert.equal(serviceForCategory('mobile-auto-detailing','Home Services'),undefined)
 assert.equal(serviceForCategory('trash-can-cleaning','Automotive'),undefined)
 })
