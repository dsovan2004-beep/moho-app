import {test} from 'node:test'
import assert from 'node:assert/strict'
import {execFileSync,spawnSync} from 'node:child_process'
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import path from 'node:path'
const script=path.resolve('scripts/check-release-source.mjs')
test('release source guard accepts current/editorial-only trees and blocks delayed application revisions',()=>{
 const root=mkdtempSync(path.join(tmpdir(),'moho-release-'))
 try {
  const origin=path.join(root,'origin.git'), author=path.join(root,'author'), build=path.join(root,'build')
  const git=(cwd:string,...args:string[])=>execFileSync('git',args,{cwd,stdio:'pipe'})
  mkdirSync(origin);git(origin,'init','--bare','--initial-branch=main')
  git(root,'clone',origin,author);git(author,'config','user.email','fixture@example.test');git(author,'config','user.name','Local fixture')
  mkdirSync(path.join(author,'app'));writeFileSync(path.join(author,'app','page.tsx'),'version one');git(author,'add','.');git(author,'commit','-m','fixture one');git(author,'push','origin','main')
  git(root,'clone',origin,build)
  const check=()=>spawnSync(process.execPath,[script],{cwd:build,encoding:'utf8'})
  assert.equal(check().status,0)
  mkdirSync(path.join(author,'docs'));writeFileSync(path.join(author,'docs','update.md'),'editorial update');git(author,'add','.');git(author,'commit','-m','docs only');git(author,'push','origin','main')
  assert.equal(check().status,0)
  writeFileSync(path.join(author,'app','page.tsx'),'version two');git(author,'add','.');git(author,'commit','-m','fixture two');git(author,'push','origin','main')
  const stale=check();assert.equal(stale.status,1);assert.match(stale.stderr,/stopped/)
  git(build,'pull','--ff-only','origin','main');assert.equal(check().status,0)
  git(build,'remote','set-url','origin',path.join(root,'missing.git'));const unavailable=check();assert.equal(unavailable.status,1);assert.match(unavailable.stderr,/Could not verify/)
 } finally {rmSync(root,{recursive:true,force:true})}
})
