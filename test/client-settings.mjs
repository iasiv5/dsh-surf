let stored = '/pre'
let opened = null
let stateValue

globalThis.window = {
  __ModuleLoader__: { load: (spec) => { globalThis.__spec = spec } },
  open: (url, target, features) => { opened = [url, target, features]; return true },
  localStorage: {
    getItem: (key) => key === 'dsh-surf:basePath' ? stored : null,
    setItem: (key, value) => {
      if (key !== 'dsh-surf:basePath') throw new Error('bad storage key ' + key)
      stored = value
    }
  },
  location: { origin: 'https://x.io' }
}
globalThis.location = globalThis.window.location
await import('../lib/client.js')

const ReactStub = {
  createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
  useState: (initial) => {
    stateValue = typeof initial === 'function' ? initial() : initial
    return [stateValue, (next) => { stateValue = typeof next === 'function' ? next(stateValue) : next }]
  }
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
if (injected.length !== 1 || injected[0] !== 'settings.plugin.item') throw new Error('settings slot')
if (registered.length !== 1) throw new Error('register count')
const [descriptor, Card] = registered[0]
if (descriptor.name !== 'settings.plugin.item' || descriptor.id !== 'dsh-surf' || descriptor.key !== 'dsh-surf' || descriptor.label !== 'Surf') throw new Error('settings descriptor')
const card = Card({})
if (card.props['data-surf'] !== 'settings-card') throw new Error('card root')
const findByRole = (node, role) => {
  if (!node || typeof node !== 'object') return null
  if (node.props?.['data-surf'] === role) return node
  for (const child of node.children || []) {
    const found = findByRole(child, role)
    if (found) return found
  }
  return null
}
const input = findByRole(card, 'base-path')
const button = findByRole(card, 'open')
if (!input || !button) throw new Error('card controls')
input.props.onChange({ target: { value: '/new' } })
if (stored !== '/new') throw new Error('basePath persistence')
const rerendered = Card({})
findByRole(rerendered, 'open').props.onClick()
if (opened?.[0] !== 'https://x.io/new/surf/' || opened?.[1] !== '_blank' || opened?.[2] !== 'noopener') throw new Error('open action')
if (mod.resolveSurfUrl('', 'https://x.io') !== 'https://x.io/surf/') throw new Error('url resolver')

const host = await import('../lib/index.js')
let namespace = null
host.apply({ inject: (_deps, fn) => fn({ settings: { register: (name) => { namespace = name } } }) })
if (namespace !== 'dsh-surf') throw new Error('settings namespace')
console.log('CLIENT-SETTINGS-OK')
