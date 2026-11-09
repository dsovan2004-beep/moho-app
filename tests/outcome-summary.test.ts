import {test} from 'node:test'
import assert from 'node:assert/strict'
import {parseOutcomeSummary,outcomeReportTotal} from '../lib/outcome-summary'
const valid={start_day:'2026-10-10',end_day:'2026-11-08',cities:['Mountain House','Tracy','Lathrop','Manteca'].map(city=>({city,reached_provider:0,could_not_reach:0,found_help:0}))}
test('operator outcomes distinguish a real zero response from missing or malformed data',()=>{
  assert.equal(outcomeReportTotal(parseOutcomeSummary(valid)!),0)
  for(const v of [null,{}, {...valid,cities:[]},{...valid,cities:[valid.cities[0],...valid.cities.slice(0,3)]}]) assert.equal(parseOutcomeSummary(v),null)
  assert.equal(parseOutcomeSummary({...valid,cities:valid.cities.map(r=>({...r,found_help:-1}))}),null)
  assert.equal(parseOutcomeSummary({...valid,cities:valid.cities.map(r=>({...r,found_help:'1'}))}),null)
})
test('self-reported choices are counted as updates without conversion-rate inference',()=>{
  const report={...valid,cities:valid.cities.map(r=>({...r,reached_provider:2,could_not_reach:1,found_help:3}))}
  assert.equal(outcomeReportTotal(parseOutcomeSummary(report)!),24)
})
