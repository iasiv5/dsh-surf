export const name='@iasiv5/dsh-surf'
export const inject=[]

export function apply(ctx) {
  if (typeof ctx?.inject !== 'function') return
  ctx.inject(['settings'], (scope) => {
    const settings = scope?.settings
    if (typeof settings?.register !== 'function') return
    const passThrough = (value) => ({ ...(value ?? {}) })
    passThrough.toJSON = () => ({
      uid: 0,
      refs: { 0: { type: 'object', meta: { default: {} }, dict: {} } }
    })
    settings.register('dsh-surf', passThrough, { base: {} })
  })
}
