import {test} from 'node:test'
import assert from 'node:assert/strict'
import {exploreLinks} from '../lib/explore-links'

test('Explore intents retain each selected city and lead to current discovery routes',()=>{
  for(const city of ['Mountain House','Tracy','Lathrop','Manteca']) {
    for(const link of exploreLinks(city)) {
      const url=new URL(link.href,'https://www.moholocal.com')
      assert.equal(url.searchParams.get('city'),city)
      assert.ok(['/directory','/events'].includes(url.pathname))
    }
  }
})
test('Explore service shortcuts stay exact while cultural searches disclose their specific offering',()=>{
  const links=exploreLinks('Lathrop')
  const get=(key:string)=>new URL(links.find(link=>link.key===key)!.href,'https://www.moholocal.com').searchParams
  assert.equal(get('solar').get('service'),'solar-bird-exclusion')
  assert.equal(get('lights').get('service'),'holiday-light-installation')
  assert.equal(get('groceries').get('category'),'Retail')
  assert.equal(get('groceries').get('q'),'Indian')
  assert.equal(get('classes').get('q'),'Marathi')
  assert.match(links.find(link=>link.key==='classes')!.label,/Marathi/)
})
