export const CLASS_TOPICS = [
  {key:'all',label:'All programs'},
  {key:'language',label:'Language & culture'},
  {key:'dance',label:'Dance'},
  {key:'music',label:'Music'},
] as const
export type ClassTopic = typeof CLASS_TOPICS[number]['key']
export function classTopic(value?:string):ClassTopic {
  return CLASS_TOPICS.some(topic=>topic.key===value) ? value as ClassTopic : 'all'
}
export function matchesClassTopic(tags:string[],topic:ClassTopic) {
  if(topic==='all') return true
  return tags.some(tag=>topic==='language' ? /language|cultural education/i.test(tag) && !/dance/i.test(tag) : topic==='dance' ? /dance|bhangra|bharatanatyam|kathak|bollywood/i.test(tag) : /music|tabla|singing|instrument/i.test(tag))
}
export function classesHref(city:string,topic:ClassTopic='all') {
  return `/classes?${new URLSearchParams({city,...(topic==='all'?{}:{topic})})}`
}


export function classCoverage<T extends {service_areas:string[];service_tags:string[]}>(programs:T[],city:string,topic:ClassTopic) {
  const inCity=programs.filter(row=>city==='All Cities'||row.service_areas.includes(city))
  return {
    visible:inCity.filter(row=>matchesClassTopic(row.service_tags,topic)),
    inCity,
    countForCity:(name:string)=>programs.filter(row=>(name==='All Cities'||row.service_areas.includes(name))&&matchesClassTopic(row.service_tags,topic)).length,
  }
}
