let opened = null

globalThis.window = {
  __ModuleLoader__: { load: (spec) => { globalThis.__spec = spec } },
  open: (url, target, features) => { opened = [url, target, features]; return true },
  location: { origin: 'https://x.io' }
}
globalThis.location = globalThis.window.location
await import('../lib/client.js')

const ReactStub = {
  createElement: (type, props, ...children) => ({ type, props: props || {}, children })
}
const spec = globalThis.__spec
if (!spec || spec.id !== '@iasiv5/dsh-surf') throw new Error('registration id')
const mod = spec.factory((id) => id === 'react' ? ReactStub : {})
if (mod.name !== 'dsh-surf/client') throw new Error('module name')
if (mod.inject.length !== 1 || mod.inject[0] !== 'slots') throw new Error('inject')

const injected = []
const registered = []
const fakeCtx = {
  slots: {
    inject: (name, fn) => {
      injected.push(name)
      const result = fn()
      if (result && typeof result.next === 'function') {
        while (!result.next().done) {}
      }
    },
    register: (descriptor, component) => registered.push([descriptor, component])
  }
}
mod.apply(fakeCtx)
if (injected.length !== 1 || injected[0] !== 'settings.section') throw new Error('settings slot')
if (registered.length !== 1) throw new Error('register count')
const [descriptor, Section] = registered[0]
if (descriptor.name !== 'settings.section' || descriptor.id !== 'dsh-surf' || descriptor.order !== 130 || descriptor.label !== '网络冲浪') throw new Error('settings descriptor')
const section = Section({})
if (section.props['data-surf'] !== 'settings-section') throw new Error('section root')
const button = section.children.find((child) => child?.props?.['data-surf'] === 'open')
if (!button) throw new Error('open button')
button.props.onClick()
if (opened?.[0] !== 'https://x.io/surf/' || opened?.[1] !== '_blank' || opened?.[2] !== 'noopener') throw new Error('open action')
if (mod.resolveSurfUrl('/pre', 'https://x.io') !== 'https://x.io/pre/surf/') throw new Error('url resolver')
const savedLocation = globalThis.location
delete globalThis.location
let threw = false
try { mod.openSurf() } catch { threw = true }
globalThis.location = savedLocation
if (!threw) throw new Error('openSurf no-origin must throw')

const host = await import('../lib/index.js')
host.apply({})
console.log('CLIENT-SETTINGS-OK')
