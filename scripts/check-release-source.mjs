import { execFileSync, spawnSync } from 'node:child_process'

// Ignore editorial-only commits, but never deploy an older application tree.
const paths = ['app','lib','public','scripts','package.json','package-lock.json','tsconfig.json','next.config.js','open-next.config.ts','wrangler.jsonc','tailwind.config.*','postcss.config.*','image-loader.js']
try {
  execFileSync('git',['fetch','--no-tags','origin','main'],{stdio:'inherit'})
  const result=spawnSync('git',['diff','--quiet','HEAD','FETCH_HEAD','--',...paths],{stdio:'inherit'})
  if(result.status !== 0) {
    console.error('Release source is not the current application tree on main. Build/deployment stopped; retry current main.')
    process.exit(1)
  }
  console.log('Release source matches the current application tree on main.')
} catch {
  console.error('Could not verify release source against main. Build/deployment stopped.')
  process.exit(1)
}
