/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/explicit-function-return-type */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const asar = require('@electron/asar')
const yaml = require('js-yaml')

const resources = path.resolve('dist/win-unpacked/resources')
const archive = path.join(resources, 'app.asar')
const entries = asar.listPackage(archive)
assert(entries.some((entry) => entry.replaceAll('\\', '/') === '/out/main/index.js'))
assert(entries.some((entry) => entry.replaceAll('\\', '/') === '/LICENSE'))
assert(entries.some((entry) => entry.replaceAll('\\', '/') === '/NOTICE.md'))
for (const entry of entries) {
  const normalized = entry.replaceAll('\\', '/')
  if (normalized.startsWith('/node_modules/')) continue
  assert(!/(^|\/)\.env(?:\.|\/|$)/.test(normalized), `Unexpected environment file: ${entry}`)
  assert(
    !/^\/(?:src|tests|screenshots|recordings|\.git)(?:\/|$)/.test(normalized),
    `Unexpected file: ${entry}`
  )
}
const pkg = JSON.parse(asar.extractFile(archive, 'package.json').toString())
assert.equal(pkg.name, 'ai-interview-assistant')
assert.equal(pkg.version, require('../package.json').version)
const updater = yaml.load(fs.readFileSync(path.join(resources, 'app-update.yml'), 'utf8'))
assert.equal(updater.owner, 'lijunznib')
assert.equal(updater.repo, 'ai-interview-assistant')
console.log(
  'Package verified: application identity, license, update repository and excluded personal files.'
)
