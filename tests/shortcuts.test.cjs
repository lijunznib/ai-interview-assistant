/* CommonJS harness runs directly in Node, outside the application's TypeScript build. */
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/explicit-function-return-type */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { test } = require('node:test')
const ts = require('typescript')

function loadTypescript(file, imports, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  })
  const context = {
    exports: {},
    require(name) {
      assert.ok(name in imports, `Unexpected dependency: ${name}`)
      return imports[name]
    },
    console,
    AbortController,
    process: { platform: 'win32' },
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: () => 1,
    clearTimeout: () => {},
    ...globals
  }
  context.global = context
  vm.runInNewContext(outputText, context, { filename: file })
}

function harness({ capture, apiKey = 'test-only' } = {}) {
  const handlers = {}
  const keys = new Map()
  const events = []
  const requests = []
  let captureCount = 0
  const stream = async function* (messages) {
    requests.push(structuredClone(messages))
    yield 'test answer'
  }
  loadTypescript(
    'src/main/shortcuts.ts',
    {
      electron: {
        ipcMain: { handle: (name, handler) => (handlers[name] = handler) },
        globalShortcut: {
          register: (key, handler) => {
            if (keys.has(key)) return false
            keys.set(key, handler)
            return true
          },
          unregister: (key) => keys.delete(key)
        },
        screen: { getAllDisplays: () => [{ bounds: { x: 0, y: 0, width: 1920 } }] }
      },
      './main-window': { applyContentProtection: () => {} },
      './toolbar-window': {},
      './take-screenshot': {
        takeScreenshot: () => capture?.() ?? Promise.resolve(`image-${++captureCount}`)
      },
      './save-screenshot': { saveScreenshotToDisk: () => {} },
      './save-code': { handleGeneratedCode: () => {} },
      './ai': { getSolutionStream: stream, getGeneralStream: stream, getFollowUpStream: stream },
      './state': { state: { inCoderPage: true }, setPageChangeHandler: () => {} },
      './settings': { settings: { apiKey } },
      './transcription': { getTranscriptionText: () => '', clearTranscriptionText: () => {} }
    },
    {
      mainWindow: {
        isDestroyed: () => false,
        webContents: { send: (...event) => events.push(structuredClone(event)) }
      }
    }
  )
  return {
    events,
    requests,
    async action(action) {
      handlers.initShortcuts(null, { [action]: { key: action } })
      const callback = keys.get(action)
      assert.equal(typeof callback, 'function', `Missing action: ${action}`)
      await callback()
    }
  }
}

test('capturing images never calls AI, even without an API key', async () => {
  const app = harness({ apiKey: '' })
  await app.action('takeScreenshot')
  assert.equal(app.requests.length, 0)
  assert.equal(app.events.filter(([name]) => name === 'solution-error').length, 0)
  assert.equal(app.events.find(([name]) => name === 'screenshots-updated')?.[2], 1)
})

test('submit sends all queued images once; a second submit sends nothing', async () => {
  const app = harness()
  await app.action('takeScreenshot')
  await app.action('takeScreenshot')
  await app.action('submitScreenshots')
  assert.equal(app.requests.length, 1)
  const images = app.requests[0][0].content.filter((part) => part.type === 'image')
  assert.deepEqual(
    images.map((part) => part.image),
    ['image-1', 'image-2']
  )
  await app.action('submitScreenshots')
  assert.equal(app.requests.length, 1)
})

test('clear removes queued images without clearing the existing answer', async () => {
  const app = harness()
  await app.action('takeScreenshot')
  await app.action('clearScreenshots')
  await app.action('submitScreenshots')
  assert.equal(app.requests.length, 0)
  assert.deepEqual(app.events.filter(([name]) => name === 'screenshots-updated').at(-1), [
    'screenshots-updated',
    [],
    0
  ])
  assert.ok(!app.events.some(([name]) => name === 'solution-clear'))
})

test('clear also cancels a screenshot that is still being captured', async () => {
  let finishCapture
  const app = harness({
    capture: () =>
      new Promise((resolve) => {
        finishCapture = resolve
      })
  })
  const capturing = app.action('takeScreenshot')
  await Promise.resolve()
  await app.action('clearScreenshots')
  finishCapture('deleted-image')
  await capturing
  await app.action('submitScreenshots')
  assert.equal(app.requests.length, 0)
})

test('submit immediately after capture waits for that image', async () => {
  let finishCapture
  const app = harness({
    capture: () =>
      new Promise((resolve) => {
        finishCapture = resolve
      })
  })
  const capturing = app.action('takeScreenshot')
  await Promise.resolve()
  const submitting = app.action('submitScreenshots')
  finishCapture('ready-image')
  await Promise.all([capturing, submitting])
  assert.equal(app.requests.length, 1)
  assert.equal(
    app.requests[0][0].content.find((part) => part.type === 'image').image,
    'ready-image'
  )
})

test('new Windows bindings migrate saved shortcuts without resetting other preferences', () => {
  let options
  let defaults
  loadTypescript('src/renderer/src/lib/store/shortcuts.ts', {
    zustand: {
      create: () => (initializer) => {
        defaults = initializer(() => {})
      }
    },
    'zustand/middleware': {
      persist: (initializer, config) => {
        options = config
        return initializer
      }
    },
    '../utils/env': { isMac: false, platformAlt: 'CommandOrControl' }
  })
  const expected = {
    takeScreenshot: 'CommandOrControl+H',
    submitScreenshots: 'CommandOrControl+Enter',
    clearScreenshots: 'CommandOrControl+L',
    hideOrShowMainWindow: 'CommandOrControl+B',
    pageUp: 'CommandOrControl+Shift+,',
    pageDown: 'CommandOrControl+Shift+.',
    moveMainWindowUp: 'CommandOrControl+Up',
    moveMainWindowDown: 'CommandOrControl+Down'
  }
  const stored = { shortcuts: structuredClone(defaults.shortcuts) }
  stored.shortcuts.takeScreenshot.key = 'CommandOrControl+Enter'
  stored.shortcuts.hideOrShowMainWindow.key = 'CommandOrControl+H'
  stored.shortcuts.ignoreOrEnableMouse.key = 'CommandOrControl+F8'
  const migrated = options.migrate(stored, 5)
  for (const [action, key] of Object.entries(expected)) {
    assert.equal(defaults.shortcuts[action]?.key, key, `Default ${action}`)
    assert.equal(migrated.shortcuts[action]?.key, key, `Migrated ${action}`)
  }
  assert.equal(migrated.shortcuts.ignoreOrEnableMouse.key, 'CommandOrControl+F8')
})
