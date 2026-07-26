import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PluginHost } from './pluginHost'
import { Registry } from './registry'
import type { Plugin, PluginContext } from './types'
import type { Disposable } from './emitter'

// Helper: create a disposable that tracks dispose calls
function trackedDisposable(): { d: Disposable; disposeCount: () => number } {
  let count = 0
  const d: Disposable = { dispose: () => { count++ } }
  return { d, disposeCount: () => count }
}

function makePlugin(overrides: Partial<Plugin> = {}): Plugin {
  return {
    id: 'test-plugin',
    activate: () => {},
    ...overrides
  }
}

describe('PluginHost', () => {
  beforeEach(() => {
    // Clean Registry singleton state between tests
    const r = new (Registry as any)() as Registry
    // Replace instance's internals by clearing via dispose trick:
    // We'll just work with a fresh approach: clear the registry
    // by getting all pages/containers/views and disposing them.
    // Actually simpler: just clear the maps directly via any cast.
    const inst = Registry.instance as any
    inst._pages.clear()
    inst._viewContainers.clear()
    inst._views.clear()
    inst._topbarContribs.length = 0
  })

  it('activateBuiltin calls activate on each plugin with PluginContext', () => {
    const host = new PluginHost()
    const activate1 = vi.fn()
    const activate2 = vi.fn()

    host.activateBuiltin([
      makePlugin({ id: 'p1', activate: activate1 }),
      makePlugin({ id: 'p2', activate: activate2 })
    ])

    expect(activate1).toHaveBeenCalledOnce()
    expect(activate2).toHaveBeenCalledOnce()

    // Check that ctx has registerContribution
    const ctx: PluginContext = activate1.mock.calls[0][0]
    expect(ctx).toBeDefined()
    expect(typeof ctx.registerContribution).toBe('function')
  })

  it('PluginContext.registerContribution delegates to Registry.instance', () => {
    const host = new PluginHost()
    const spy = vi.spyOn(Registry.instance, 'registerContribution')

    host.activateBuiltin([
      makePlugin({
        id: 'p1',
        activate: (ctx) => {
          ctx.registerContribution({
            point: 'workbench.pages',
            page: { id: 'pg', title: 'Pg', layout: {} }
          })
        }
      })
    ])

    expect(spy).toHaveBeenCalledOnce()
    expect(spy.mock.calls[0][0]).toMatchObject({ point: 'workbench.pages' })
    expect(Registry.instance.getPage('pg')).toBeDefined()

    spy.mockRestore()
  })

  it('aggregate dispose calls dispose on single returned Disposable', () => {
    const host = new PluginHost()
    const { d, disposeCount } = trackedDisposable()

    const aggregate = host.activateBuiltin([
      makePlugin({ id: 'p1', activate: () => d })
    ])

    expect(disposeCount()).toBe(0)
    aggregate.dispose()
    expect(disposeCount()).toBe(1)
  })

  it('aggregate dispose calls dispose on all items in returned Disposable[]', () => {
    const host = new PluginHost()
    const a = trackedDisposable()
    const b = trackedDisposable()

    const aggregate = host.activateBuiltin([
      makePlugin({ id: 'p1', activate: () => [a.d, b.d] })
    ])

    expect(a.disposeCount()).toBe(0)
    expect(b.disposeCount()).toBe(0)
    aggregate.dispose()
    expect(a.disposeCount()).toBe(1)
    expect(b.disposeCount()).toBe(1)
  })

  it('activate returning void does not throw', () => {
    const host = new PluginHost()
    const aggregate = host.activateBuiltin([
      makePlugin({ id: 'p1', activate: () => { /* void */ } })
    ])
    expect(() => aggregate.dispose()).not.toThrow()
  })

  it('continues activating subsequent plugins when one throws', () => {
    const host = new PluginHost()
    const activate2 = vi.fn()

    host.activateBuiltin([
      makePlugin({
        id: 'failing',
        activate: () => { throw new Error('boom') }
      }),
      makePlugin({ id: 'p2', activate: activate2 })
    ])

    expect(activate2).toHaveBeenCalledOnce()
  })

  it('aggregate disposes in reverse activation order', () => {
    const host = new PluginHost()
    const order: string[] = []
    const a: Disposable = { dispose: () => order.push('a') }
    const b: Disposable = { dispose: () => order.push('b') }

    const aggregate = host.activateBuiltin([
      makePlugin({ id: 'first', activate: () => a }),
      makePlugin({ id: 'second', activate: () => b })
    ])

    aggregate.dispose()
    expect(order).toEqual(['b', 'a'])
  })

  it('aggregate dispose continues when one dispose throws', () => {
    const host = new PluginHost()
    const called: string[] = []
    const bad: Disposable = { dispose: () => { called.push('bad'); throw new Error('fail') } }
    const good: Disposable = { dispose: () => called.push('good') }

    const aggregate = host.activateBuiltin([
      makePlugin({ id: 'p1', activate: () => bad }),
      makePlugin({ id: 'p2', activate: () => good })
    ])

    expect(() => aggregate.dispose()).not.toThrow()
    expect(called).toEqual(['good', 'bad']) // reverse order
  })

  it('activateBuiltin([]) returns no-op disposable', () => {
    const host = new PluginHost()
    const d = host.activateBuiltin([])
    expect(() => d.dispose()).not.toThrow()
  })
})
