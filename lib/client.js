// dsh-surf client half: a first-level Settings launcher (no main-page overlay).
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

    const SECTION_ID = 'dsh-surf'
    const NAV_LABEL = '网络冲浪'

    function resolveSurfUrl(basePath, origin) {
      const bp = String(basePath || '').replace(/^\/+|\/+$/g, '')
      return String(origin).replace(/\/+$/, '') + '/' + (bp ? bp + '/' : '') + 'surf/'
    }

    function openSurf(basePath = '', origin = globalThis.location?.origin) {
      if (!origin) throw new Error('dsh-surf: origin unavailable, cannot open Surf')
      window.open(resolveSurfUrl(basePath, origin), '_blank', 'noopener')
    }

    function SurfSettingsSection() {
      return React.createElement(
        'section',
        {
          'data-surf': 'settings-section',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            border: '1px solid var(--dsw-alias-border-l2, rgba(127,127,127,0.35))',
            borderRadius: '12px'
          }
        },
        React.createElement('strong', null, NAV_LABEL),
        React.createElement(
          'p',
          { style: { margin: 0, color: 'var(--dsw-alias-label-secondary, inherit)' } },
          '点击左侧「网络冲浪」即可打开远端浏览器。'
        ),
        React.createElement(
          'button',
          { type: 'button', 'data-surf': 'open', onClick: () => openSurf('') },
          '🌐 打开 Surf'
        )
      )
    }

    function createBrowserIcon(oldIcon) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const attrs = {
        viewBox: '0 0 16 16',
        width: '16',
        height: '16',
        fill: 'none',
        'aria-hidden': 'true'
      }
      for (const [key, value] of Object.entries(attrs)) svg.setAttribute(key, value)
      const className = oldIcon?.getAttribute('class')
      if (className) svg.setAttribute('class', className)
      svg.innerHTML = '<rect x="1.5" y="2" width="13" height="11.5" rx="1.8" stroke="currentColor" stroke-width="1.3"/><path d="M1.8 5.2h12.4" stroke="currentColor" stroke-width="1.3"/><circle cx="3.7" cy="3.6" r=".65" fill="currentColor"/><circle cx="5.8" cy="3.6" r=".65" fill="currentColor"/>'
      return svg
    }

    function installNavLauncher() {
      if (typeof document === 'undefined' || !document.body) return () => {}
      // The nav row button is rendered by the host settings shell from the slot
      // descriptor label — it is NOT inside the plugin's own DOM, so the click
      // guard keys on this attribute, stamped here at injection time, instead of
      // on button text (a text match alone would hijack unrelated buttons that
      // happen to share the label).
      const LAUNCHER_ATTR = 'data-surf-launcher'
      let launcherButton = null
      const scan = () => {
        if (launcherButton?.isConnected) return
        const button = Array.from(document.querySelectorAll('button')).find((candidate) => candidate.textContent?.trim() === NAV_LABEL)
        if (!button) return
        button.setAttribute(LAUNCHER_ATTR, '1')
        const icon = button.querySelector('svg')
        if (icon && icon.getAttribute('data-dsh-surf-browser-icon') !== '1') {
          const replacement = createBrowserIcon(icon)
          replacement.setAttribute('data-dsh-surf-browser-icon', '1')
          icon.replaceWith(replacement)
        }
        launcherButton = button
      }
      // Trailing debounce: the first mutation batch after an idle period scans
      // immediately; further batches inside the window only (re)arm one trailing
      // catch-up scan, so continuous React re-render storms cost at most one
      // full scan per window. A decorated-and-still-connected launcher short
      // circuits the scan entirely (no querySelectorAll at all).
      const DEBOUNCE_MS = 200
      let timer = null
      const scheduleScan = () => {
        if (timer !== null) return
        scan()
        timer = setTimeout(() => {
          timer = null
          scan()
        }, DEBOUNCE_MS)
      }
      const onClick = (event) => {
        const target = event.target instanceof Element ? event.target.closest(`[${LAUNCHER_ATTR}="1"]`) : null
        if (!target) return
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation?.()
        openSurf('')
      }
      const observer = typeof MutationObserver === 'function' ? new MutationObserver(scheduleScan) : null
      observer?.observe(document.body, { childList: true, subtree: true })
      document.addEventListener('click', onClick, true)
      scan()
      return () => {
        if (timer !== null) {
          clearTimeout(timer)
          timer = null
        }
        observer?.disconnect()
        document.removeEventListener('click', onClick, true)
        launcherButton?.removeAttribute(LAUNCHER_ATTR)
      }
    }

    function apply(ctx) {
      ctx.slots.inject('settings.section', () => ctx.slots.register(
        {
          name: 'settings.section',
          id: SECTION_ID,
          order: 130,
          label: NAV_LABEL
        },
        SurfSettingsSection
      ))
      if (typeof ctx.effect === 'function') ctx.effect(installNavLauncher, 'dsh-surf:settings-nav')
      else installNavLauncher()
    }

    exports.name = 'dsh-surf/client'
    exports.inject = ['slots']
    exports.apply = apply
    exports.resolveSurfUrl = resolveSurfUrl
    exports.openSurf = openSurf
    exports.SurfSettingsSection = SurfSettingsSection
    return module.exports
  }
})
