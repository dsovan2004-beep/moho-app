import type { ActivityItem } from '../app/components/ActivityCard'

// Latest actual approval/check per listing; check wins equal timestamps.
export function mergeActivity(items: ActivityItem[], limit=40) {
  const seen=new Set<string>()
  const isBusiness=(item:ActivityItem)=>item.type==='business' || item.type==='business_check'
  return items.filter(item=>Number.isFinite(Date.parse(item.created_at)))
    .sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at) || Number(b.type==='business_check')-Number(a.type==='business_check'))
    .filter(item=>{const key=`${isBusiness(item)?'listing':item.type}:${item.id}`;if(seen.has(key))return false;seen.add(key);return true})
    .slice(0,limit)
}
