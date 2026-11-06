import {test} from 'node:test'
import assert from 'node:assert/strict'
import {pushSetup,type PushEnvironment} from '../lib/push-support'
const supported:PushEnvironment={userAgent:'Desktop',platform:'MacIntel',maxTouchPoints:0,standalone:false,secure:true,serviceWorker:true,pushManager:true,notification:true,permission:'default'}
test('iPhone browser directs installation before requesting unavailable push permission',()=>{
 assert.deepEqual(pushSetup({...supported,userAgent:'iPhone',pushManager:false,notification:false}),{state:'install',label:'iPhone or iPad'})
 assert.equal(pushSetup({...supported,userAgent:'iPhone',standalone:true}).state,'ready')
})
test('iPad desktop identity still requires the Home Screen app',()=>{
 assert.equal(pushSetup({...supported,maxTouchPoints:5}).state,'install')
 assert.equal(pushSetup({...supported,maxTouchPoints:5,standalone:true}).state,'ready')
})
test('Android uses feature support rather than requiring installation',()=>{
 assert.deepEqual(pushSetup({...supported,userAgent:'Android Chrome'}),{state:'ready',label:'Android phone'})
 assert.equal(pushSetup({...supported,userAgent:'Android',secure:false}).state,'unsupported')
})
test('denied notification permission explains settings instead of requesting repeatedly',()=>{
 assert.equal(pushSetup({...supported,permission:'denied'}).state,'denied')
 assert.equal(pushSetup({...supported,notification:false}).state,'unsupported')
})
