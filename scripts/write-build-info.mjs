import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

// Public deployment provenance only: never serialize environment variables.
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Cannot establish build source revision')
mkdirSync('public', { recursive: true })
writeFileSync('public/build-info.json', JSON.stringify({ application: 'MoHoLocal', source_revision: revision }) + '\n')
