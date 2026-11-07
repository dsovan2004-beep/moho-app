export type PetProgress = 'unknown' | 'sighted' | 'secured'
export function petProgressLabel(progress?:string|null,status?:string,contactStage?:string|null){
 if(status==='reunited')return 'Reunited — recorded status'
 if(progress==='sighted')return 'Sighted — not secured'
 if(progress==='secured')return contactStage==='return_arranged'?'Secured — return arranged':contactStage==='contacted'?'Secured — contact made':contactStage==='attempted'?'Secured — contact attempted':'Secured — seeking owner'
 return 'Sighting / secured status not confirmed'
}
export function compatibleProgress(status:string,progress:string):PetProgress{
 return progress==='secured'&&status==='found'?'secured':progress==='sighted'&&['lost','found'].includes(status)?'sighted':'unknown'
}
// datetime-local follows the resident device timezone; transport an explicit UTC instant.
export function localObservationInput(value?:string|null){
 if(!value)return '';const d=new Date(value);if(!Number.isFinite(d.getTime()))return ''
 const pad=(n:number)=>String(n).padStart(2,'0')
 return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export function observationInstant(value:string){
 const d=new Date(value)
 if(!value||!Number.isFinite(d.getTime()))throw new Error('Enter when you observed the animal.')
 return d.toISOString()
}
