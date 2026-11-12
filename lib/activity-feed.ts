import type { ActivityItem } from '../app/components/ActivityCard'

// This is a latest-record feed, not a historical audit log of every edit.
export function mergeActivity(items: ActivityItem[], limit=40) {
  const valid=items.filter(item=>Number.isFinite(Date.parse(item.created_at)))
  const checked=new Set(valid.filter(item=>item.type==='business_check').map(item=>item.id))
  const seen=new Set<string>()
  return valid.filter(item=>!(item.type==='business' && checked.has(item.id)))
    .sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at))
    .filter(item=>{const key=`${item.type}:${item.id}`;if(seen.has(key))return false;seen.add(key);return true})
    .slice(0,limit)
}
