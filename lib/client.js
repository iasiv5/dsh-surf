// dsh-surf client half: a thin shell.overlay launcher (no traffic proxying).
// Factory shape aligned with the installed DSH plugin samples (dsh-docs-panel / dsh-flowglass).
window.__ModuleLoader__.load({
  id: 'dsh-surf',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const React = require('react')

    const STORAGE_KEY = 'dsh-surf:basePath'

    // '' -> <origin>/surf/ ; '/pre' | 'pre/' -> <origin>/pre/surf/
    function resolveSurfUrl(basePath, origin) {
      const bp = String(basePath || '').replace(/^\/+|\/+$/g, '')
      return String(origin).replace(/\/+$/, '') + '/' + (bp ? bp + '/' : '') + 'surf/'
    }

    // origin 为空时 throw；打开一律 _blank + noopener
    function openSurf(basePath, origin = globalThis.location?.origin) {
      if (!origin) throw new Error('dsh-surf: origin unavailable, cannot open Surf')
      window.open(resolveSurfUrl(basePath, origin), '_blank', 'noopener')
    }

    function SurfButton() {
      return React.createElement(
        'div',
        {
          style: {
            position: 'fixed',
            right: '16px',
            bottom: '16px',
            zIndex: 2147483000,
            display: 'flex',
            gap: '8px',
            pointerEvents: 'none'
          }
        },
        React.createElement(
          'button',
          {
            style: { pointerEvents: 'auto' },
            'data-surf': 'main',
            title: 'Open Surf',
            onClick: () => openSurf(window.localStorage.getItem(STORAGE_KEY) || '')
          },
          '🌐 Surf'
        ),
        React.createElement(
          'button',
          {
            'data-surf': 'settings',
            title: 'Surf basePath',
            onClick: () => {
              const v = window.prompt('Surf basePath (empty = root mount)', window.localStorage.getItem(STORAGE_KEY) || '')
              if (v !== null) window.localStorage.setItem(STORAGE_KEY, v)
            }
          },
          '⚙'
        )
      )
    }

    function apply(ctx) {
      ctx.slots.inject('shell.overlay', () => {
        ctx.slots.register(
          { name: 'shell.overlay', id: 'dsh-surf:entry', order: 130, label: 'Surf 入口' },
          SurfButton
        )
      })
    }

    exports.name = 'dsh-surf/client'
    exports.inject = ['slots']
    exports.apply = apply
    exports.resolveSurfUrl = resolveSurfUrl
    exports.openSurf = openSurf
    return module.exports
  }
})
