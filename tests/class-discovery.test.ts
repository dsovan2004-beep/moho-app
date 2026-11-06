import {test} from 'node:test'
import assert from 'node:assert/strict'
import {classesHref,classTopic,matchesClassTopic} from '../lib/class-discovery'
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
