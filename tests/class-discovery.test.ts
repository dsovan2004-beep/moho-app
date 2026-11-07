import {test} from 'node:test'
import assert from 'node:assert/strict'
import {classesHref,classTopic,matchesClassTopic,classCoverage} from '../lib/class-discovery'
test('Class topics match explicit offerings and preserve city through topic changes',()=>{
  assert.equal(matchesClassTopic(['Marathi language classes'],'language'),true)
  assert.equal(matchesClassTopic(['Bhangra'],'dance'),true)
  assert.equal(matchesClassTopic(['Tabla lessons'],'music'),true)
  assert.equal(matchesClassTopic(['Bhangra'],'music'),false)
  const url=new URL(classesHref('Mountain House','dance'),'https://www.moholocal.com')
  assert.equal(url.searchParams.get('city'),'Mountain House')
  assert.equal(url.searchParams.get('topic'),'dance')
  assert.equal(classTopic('unsupported'),'all')
})


test('class coverage counts a multi-city program once and keeps topic counts city-specific',()=>{
  const programs=[{service_areas:['Mountain House','Tracy'],service_tags:['Marathi language classes']},{service_areas:['Manteca','Lathrop'],service_tags:['Bhangra']}]
  const coverage=classCoverage(programs,'Manteca','language')
  assert.equal(coverage.visible.length,0)
  assert.equal(coverage.inCity.length,1)
  assert.equal(coverage.countForCity('Tracy'),1)
  assert.equal(coverage.countForCity('All Cities'),1)
  assert.equal(classCoverage(programs,'All Cities','all').visible.length,2)
  assert.equal(classCoverage(programs,'Lathrop','dance').visible.length,1)
})
