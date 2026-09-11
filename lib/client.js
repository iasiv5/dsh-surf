// dsh-surf client half: a Settings card launcher (no main-page overlay).
// The package registration id MUST equal package.json `name`.
window.__ModuleLoader__.load({
  // dsh-client-modules keys each graph row by package name and rejects a
  // bundle whose registration id mismatches it.
  id: '@iasiv5/dsh-surf',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const React = require('react')

    const STORAGE_KEY = 'dsh-surf:basePath'
    const SETTINGS_KEY = 'dsh-surf'

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

    function readBasePath() {
      return window.localStorage.getItem(STORAGE_KEY) || ''
    }

    function SurfSettingsCard() {
      const [basePath, setBasePath] = React.useState(readBasePath)
      const updateBasePath = (event) => {
        const value = event?.target?.value ?? ''
        setBasePath(value)
        window.localStorage.setItem(STORAGE_KEY, value)
      }
      return React.createElement(
        'section',
        {
          'data-surf': 'settings-card',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.35))',
            borderRadius: '12px'
          }
        },
        React.createElement('strong', null, 'Surf'),
        React.createElement(
          'p',
          { style: { margin: 0, color: 'var(--dsw-alias-label-secondary, inherit)' } },
          '打开自托管浏览器桌面。'
        ),
        React.createElement(
          'label',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          'basePath',
          React.createElement('input', {
            type: 'text',
            value: basePath,
            placeholder: '/your-prefix',
            onChange: updateBasePath,
            'data-surf': 'base-path'
          })
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            'data-surf': 'open',
            onClick: () => openSurf(basePath)
          },
          '🌐 打开 Surf'
        )
      )
    }

    function apply(ctx) {
      ctx.slots.inject('settings.plugin.item', function* () {
        yield ctx.slots.register(
          {
            name: 'settings.plugin.item',
            id: SETTINGS_KEY,
            key: SETTINGS_KEY,
            order: 130,
            label: 'Surf'
          },
          SurfSettingsCard
        )
      })
    }

    exports.name = 'dsh-surf/client'
    exports.inject = ['slots']
    exports.apply = apply
    exports.resolveSurfUrl = resolveSurfUrl
    exports.openSurf = openSurf
    exports.SurfSettingsCard = SurfSettingsCard
    return module.exports
  }
})
