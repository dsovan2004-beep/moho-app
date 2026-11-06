import {test} from 'node:test'
import assert from 'node:assert/strict'
import {localOpeningsFor} from '../lib/local-openings'
test('local opening updates stay city-scoped and leave the feature when review is overdue',()=>{
  const now=Date.parse('2026-11-06T18:46:00Z')
  assert.deepEqual(localOpeningsFor('Mountain House',now).map(x=>x.name),['Wingstop','Domino’s Pizza','ARCO Gas & Convenience Store'])
  assert.deepEqual(localOpeningsFor('Tracy',now).map(x=>x.name),['Sprouts Farmers Market'])
  assert.deepEqual(localOpeningsFor('Lathrop',now).map(x=>x.name),['Sam’s Club'])
  assert.deepEqual(localOpeningsFor('Manteca',now),[])
  assert.deepEqual(localOpeningsFor('Mountain House',Date.parse('2026-12-07T08:00:00Z')),[])
})
