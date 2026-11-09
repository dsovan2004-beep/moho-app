import {RELAUNCH_CITY_NAMES} from './cities'
export type OutcomeCity = {city:string; reached_provider:number; could_not_reach:number; found_help:number}
export type OutcomeSummary = {start_day:string; end_day:string; cities:OutcomeCity[]}
export function parseOutcomeSummary(value:unknown):OutcomeSummary|null {
  if(!value||typeof value!=='object') return null
  const v=value as OutcomeSummary
  if(!/^\d{4}-\d{2}-\d{2}$/.test(v.start_day)||!/^\d{4}-\d{2}-\d{2}$/.test(v.end_day)||!Array.isArray(v.cities)||v.cities.length!==4) return null
  const seen=new Set<string>()
  for(const row of v.cities) {
    if(!row||!RELAUNCH_CITY_NAMES.some(c=>c===row.city)||seen.has(row.city)) return null
    seen.add(row.city)
    if(![row.reached_provider,row.could_not_reach,row.found_help].every(n=>Number.isSafeInteger(n)&&n>=0)) return null
  }
  return v
}
export function outcomeReportTotal(report:OutcomeSummary) {
  return report.cities.reduce((n,row)=>n+row.reached_provider+row.could_not_reach+row.found_help,0)
}
