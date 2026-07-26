import { describe, it, expect, vi } from 'vitest'
import { Registry } from './registry'
import type {
  View, ViewContainer, Page, TopbarContribution
} from './types'

// Helper: create a fresh Registry for each test
function freshRegistry(): Registry {
  // Registry is singleton — for testing we need isolation.
  // We create a new one via the constructor (exported for testing).
  return new (Registry as any)() as Registry
}

// ── Test fixtures ──

function makeView(overrides: Partial<View> = {}): View {
  return {
    id: 'v1',
    title: 'Test View',
    component: () => null,
    ...overrides
  }
}

function makeContainer(overrides: Partial<ViewContainer> = {}): ViewContainer {
  return {
    id: 'c1',
    title: 'Test Container',
    part: 'sidebar',
    viewIds: ['v1'],
    ...overrides
  }
}

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    id: 'p1',
    title: 'Test Page',
    layout: {},
    ...overrides
  }
}

function makeTopbar(overrides: Partial<TopbarContribution> = {}): TopbarContribution {
  return {
    point: 'workbench.topbar',
    slot: 'left',
    pageId: 'p1',
    component: () => null,
    ...overrides
  }
}

// ── Tests ──

describe('Registry', () => {
  // ── Page registration ──
  describe('pages', () => {
    it('registers and retrieves pages', () => {
      const r = freshRegistry()
      const page = makePage({ id: 'home', title: 'Home' })
      r.registerContribution({ point: 'workbench.pages', page })

      expect(r.getPages()).toEqual([page])
      expect(r.getPage('home')).toBe(page)
      expect(r.getPage('nonexistent')).toBeUndefined()
    })

    it('duplicate page id overwrites previous', () => {
      const r = freshRegistry()
      const p1 = makePage({ id: 'p', title: 'First' })
      const p2 = makePage({ id: 'p', title: 'Second' })
      r.registerContribution({ point: 'workbench.pages', page: p1 })
      r.registerContribution({ point: 'workbench.pages', page: p2 })

      expect(r.getPages()).toEqual([p2])
      expect(r.getPage('p')!.title).toBe('Second')
    })

    it('dispose removes the page', () => {
      const r = freshRegistry()
      const d = r.registerContribution({ point: 'workbench.pages', page: makePage({ id: 'p' }) })
      d.dispose()
      expect(r.getPages()).toEqual([])
      expect(r.getPage('p')).toBeUndefined()
    })
  })

  // ── ViewContainer registration ──
  describe('viewContainers', () => {
    it('registers and retrieves viewContainers', () => {
      const r = freshRegistry()
      const c = makeContainer({ id: 'c1', part: 'sidebar' })
      r.registerContribution({ point: 'workbench.viewContainers', container: c })

      expect(r.getViewContainers()).toEqual([c])
      expect(r.getViewContainers('sidebar')).toEqual([c])
      expect(r.getViewContainers('content')).toEqual([])
    })

    it('filters by part', () => {
      const r = freshRegistry()
      const c1 = makeContainer({ id: 'c1', part: 'sidebar' })
      const c2 = makeContainer({ id: 'c2', part: 'auxiliary' })
      r.registerContribution({ point: 'workbench.viewContainers', container: c1 })
      r.registerContribution({ point: 'workbench.viewContainers', container: c2 })

      expect(r.getViewContainers('sidebar')).toEqual([c1])
      expect(r.getViewContainers('auxiliary')).toEqual([c2])
    })

    it('dispose removes the container', () => {
      const r = freshRegistry()
      const d = r.registerContribution({ point: 'workbench.viewContainers', container: makeContainer({ id: 'c1' }) })
      d.dispose()
      expect(r.getViewContainers()).toEqual([])
    })
  })

  // ── View registration ──
  describe('views', () => {
    it('registers and retrieves views', () => {
      const r = freshRegistry()
      const v = makeView({ id: 'v1', title: 'My View' })
      r.registerContribution({ point: 'workbench.views', view: v })

      expect(r.getViews()).toEqual([v])
      expect(r.getView('v1')).toBe(v)
      expect(r.getView('nope')).toBeUndefined()
    })

    it('dispose removes the view', () => {
      const r = freshRegistry()
      const d = r.registerContribution({ point: 'workbench.views', view: makeView({ id: 'v1' }) })
      d.dispose()
      expect(r.getView('v1')).toBeUndefined()
      expect(r.getViews()).toEqual([])
    })
  })

  // ── Topbar registration ──
  describe('topbar', () => {
    it('registers and retrieves by pageId', () => {
      const r = freshRegistry()
      const t = makeTopbar({ pageId: 'p1', slot: 'left' })
      r.registerContribution(t)

      expect(r.getTopbarContributions('p1')).toEqual([t])
      expect(r.getTopbarContributions('p2')).toEqual([])
    })

    it('filters by pageId and slot', () => {
      const r = freshRegistry()
      const tl = makeTopbar({ pageId: 'p1', slot: 'left', component: () => null })
      const tc = makeTopbar({ pageId: 'p1', slot: 'center', component: () => null })
      r.registerContribution(tl)
      r.registerContribution(tc)

      expect(r.getTopbarContributions('p1', 'left')).toEqual([tl])
      expect(r.getTopbarContributions('p1', 'center')).toEqual([tc])
    })

    it('sorts by order ascending (undefined order = 0)', () => {
      const r = freshRegistry()
      const t1 = makeTopbar({ pageId: 'p1', slot: 'left', order: 3 })
      const t2 = makeTopbar({ pageId: 'p1', slot: 'left', order: 1 })
      const t3 = makeTopbar({ pageId: 'p1', slot: 'left' }) // no order → 0
      r.registerContribution(t1)
      r.registerContribution(t2)
      r.registerContribution(t3)

      const result = r.getTopbarContributions('p1', 'left')
      expect(result[0]).toBe(t3)   // order 0
      expect(result[1]).toBe(t2)   // order 1
      expect(result[2]).toBe(t1)   // order 3
    })

    it('dispose removes the topbar contribution', () => {
      const r = freshRegistry()
      const d = r.registerContribution(makeTopbar({ pageId: 'p1', slot: 'left' }))
      d.dispose()
      expect(r.getTopbarContributions('p1')).toEqual([])
    })
  })

  // ── resolvePage ──
  describe('resolvePage', () => {
    it('returns undefined for unknown pageId', () => {
      const r = freshRegistry()
      expect(r.resolvePage('nonexistent')).toBeUndefined()
    })

    it('resolves full page with sidebar, content, auxiliary, topbar', () => {
      const r = freshRegistry()

      // Register a page
      r.registerContribution({
        point: 'workbench.pages',
        page: {
          id: 'session',
          title: 'Session',
          layout: {
            sidebar: { containerId: 'sessions-container' },
            content: { viewId: 'chat-view' },
            auxiliary: { viewId: 'chat-panel' }
          }
        }
      })

      // Register container
      r.registerContribution({
        point: 'workbench.viewContainers',
        container: {
          id: 'sessions-container',
          title: 'Sessions',
          part: 'sidebar',
          viewIds: ['session-list']
        }
      })

      // Register views
      r.registerContribution({
        point: 'workbench.views',
        view: { id: 'session-list', title: 'Session List', component: () => null }
      })
      r.registerContribution({
        point: 'workbench.views',
        view: { id: 'chat-view', title: 'Chat', component: () => null }
      })
      r.registerContribution({
        point: 'workbench.views',
        view: { id: 'chat-panel', title: 'Chat Panel', component: () => null }
      })

      // Register topbar contributions
      const LeftComp = () => null
      const CenterComp = () => null
      r.registerContribution({
        point: 'workbench.topbar',
        slot: 'left',
        pageId: 'session',
        component: LeftComp
      })
      r.registerContribution({
        point: 'workbench.topbar',
        slot: 'center',
        pageId: 'session',
        order: 1,
        component: CenterComp
      })

      const resolution = r.resolvePage('session')!

      expect(resolution.pageId).toBe('session')
      expect(resolution.sidebar).toBeDefined()
      expect(resolution.sidebar!.container.id).toBe('sessions-container')
      expect(resolution.sidebar!.views).toHaveLength(1)
      expect(resolution.sidebar!.views[0].id).toBe('session-list')

      expect(resolution.content).toBeDefined()
      expect(resolution.content).toEqual({ viewId: 'chat-view' })

      expect(resolution.auxiliary).toBeDefined()
      expect(resolution.auxiliary!.view.id).toBe('chat-panel')

      expect(resolution.topbar.left).toHaveLength(1)
      expect(resolution.topbar.left[0].component).toBe(LeftComp)
      expect(resolution.topbar.center).toHaveLength(1)
      expect(resolution.topbar.center[0].component).toBe(CenterComp)
      expect(resolution.topbar.right).toHaveLength(0)
    })

    it('omits parts not declared in page.layout', () => {
      const r = freshRegistry()
      r.registerContribution({
        point: 'workbench.pages',
        page: { id: 'minimal', title: 'Minimal', layout: {} }
      })

      const resolution = r.resolvePage('minimal')!
      expect(resolution.pageId).toBe('minimal')
      expect(resolution.sidebar).toBeUndefined()
      expect(resolution.content).toBeUndefined()
      expect(resolution.auxiliary).toBeUndefined()
      expect(resolution.topbar.left).toHaveLength(0)
      expect(resolution.topbar.center).toHaveLength(0)
      expect(resolution.topbar.right).toHaveLength(0)
    })

    it('silently degrades when referenced container does not exist', () => {
      const r = freshRegistry()
      r.registerContribution({
        point: 'workbench.pages',
        page: {
          id: 'p',
          title: 'P',
          layout: { sidebar: { containerId: 'no-such-container' } }
        }
      })

      const resolution = r.resolvePage('p')!
      expect(resolution.sidebar).toBeUndefined()
    })

    it('passes through content node as-is (no view resolution at resolve time)', () => {
      const r = freshRegistry()
      r.registerContribution({
        point: 'workbench.pages',
        page: {
          id: 'p',
          title: 'P',
          layout: { content: { viewId: 'no-such-view' } }
        }
      })

      const resolution = r.resolvePage('p')!
      // ContentNode is passed through as-is; view existence is validated at render time
      expect(resolution.content).toEqual({ viewId: 'no-such-view' })
    })

    it('silently degrades when a viewId inside container does not exist (skips missing views)', () => {
      const r = freshRegistry()
      r.registerContribution({
        point: 'workbench.pages',
        page: { id: 'p', title: 'P', layout: { sidebar: { containerId: 'c' } } }
      })
      r.registerContribution({
        point: 'workbench.viewContainers',
        container: { id: 'c', title: 'C', part: 'sidebar', viewIds: ['v-exists', 'v-missing'] }
      })
      r.registerContribution({
        point: 'workbench.views',
        view: { id: 'v-exists', title: 'Exists', component: () => null }
      })

      const resolution = r.resolvePage('p')!
      expect(resolution.sidebar!.views).toHaveLength(1)
      expect(resolution.sidebar!.views[0].id).toBe('v-exists')
    })

    it('resolves topbar grouped by slot with correct ordering', () => {
      const r = freshRegistry()
      r.registerContribution({ point: 'workbench.pages', page: { id: 'p', title: 'P', layout: {} } })
      r.registerContribution({ point: 'workbench.topbar', slot: 'left', pageId: 'p', order: 1, component: () => null })
      r.registerContribution({ point: 'workbench.topbar', slot: 'left', pageId: 'p', order: 0, component: () => null })
      r.registerContribution({ point: 'workbench.topbar', slot: 'right', pageId: 'p', order: 5, component: () => null })
      r.registerContribution({ point: 'workbench.topbar', slot: 'center', pageId: 'p', order: 2, component: () => null })

      const resolution = r.resolvePage('p')!
      expect(resolution.topbar.left).toHaveLength(2)
      expect(resolution.topbar.left[0].order).toBe(0)
      expect(resolution.topbar.left[1].order).toBe(1)
      expect(resolution.topbar.center).toHaveLength(1)
      expect(resolution.topbar.center[0].order).toBe(2)
      expect(resolution.topbar.right).toHaveLength(1)
      expect(resolution.topbar.right[0].order).toBe(5)
    })
  })

  // ── onDidChange ──
  describe('onDidChange', () => {
    it('fires when contribution is registered', () => {
      const r = freshRegistry()
      const fn = vi.fn()
      r.onDidChange(fn)

      r.registerContribution({ point: 'workbench.pages', page: makePage({ id: 'p' }) })
      expect(fn).toHaveBeenCalledOnce()

      r.registerContribution({ point: 'workbench.views', view: makeView({ id: 'v' }) })
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('fires when contribution is disposed', () => {
      const r = freshRegistry()
      const fn = vi.fn()
      const d = r.registerContribution({ point: 'workbench.pages', page: makePage({ id: 'p' }) })

      r.onDidChange(fn)
      d.dispose()
      expect(fn).toHaveBeenCalledOnce()
    })

    it('dispose of onDidChange stops receiving events', () => {
      const r = freshRegistry()
      const fn = vi.fn()
      const d = r.onDidChange(fn)
      d.dispose()

      r.registerContribution({ point: 'workbench.pages', page: makePage({ id: 'p' }) })
      expect(fn).not.toHaveBeenCalled()
    })
  })
})
