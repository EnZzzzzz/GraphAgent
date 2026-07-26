import { describe, it, expect, beforeEach } from 'vitest'
import { ContentLayoutService } from './contentLayoutService'
import { Registry } from './registry'
import type { ContentNode } from './types'

function freshService(): ContentLayoutService {
  return new ContentLayoutService()
}

function clearAndRegisterView(viewId: string): void {
  // Register a view so validation passes
  Registry.instance.registerContribution({
    point: 'workbench.views',
    view: { id: viewId, title: viewId, component: () => null }
  })
}

describe('ContentLayoutService', () => {
  beforeEach(() => {
    // Clear registry between tests
    const inst = Registry.instance as any
    inst._pages.clear()
    inst._viewContainers.clear()
    inst._views.clear()
    inst._topbarContribs.length = 0
  })

  describe('activatePage / getLayout', () => {
    it('stores layout tree per pageId and returns it', () => {
      const svc = freshService()
      clearAndRegisterView('v1')
      clearAndRegisterView('v2')

      const root: ContentNode = { viewId: 'v1' }
      svc.activatePage('page1', root)

      const layout = svc.getLayout('page1')
      expect(layout).toBeDefined()
      // Root should be a RuntimeLeaf with generated leafId
      expect(layout!.type).toBe('leaf')
      if (layout!.type === 'leaf') {
        expect(layout!.viewId).toBe('v1')
        expect(layout!.leafId).toBeTruthy()
      }
    })

    it('caches layout per pageId: switch away and back preserves runtime state', () => {
      const svc = freshService()
      clearAndRegisterView('v1')
      clearAndRegisterView('v2')

      svc.activatePage('page1', { viewId: 'v1' })
      const initial = svc.getLayout('page1')!

      // Activate another page
      svc.activatePage('page2', { viewId: 'v2' })

      // Switch back — should get same layout with same leafId
      const restored = svc.getLayout('page1')!
      expect(restored).toEqual(initial)
    })

    it('re-initializes when activatePage called again for same pageId', () => {
      const svc = freshService()
      clearAndRegisterView('v1')
      clearAndRegisterView('v2')

      svc.activatePage('page1', { viewId: 'v1' })
      const first = svc.getLayout('page1')
      svc.activatePage('page1', { viewId: 'v2' }) // re-init
      const second = svc.getLayout('page1')

      // leafId should be different (new initialization)
      if (first!.type === 'leaf' && second!.type === 'leaf') {
        expect(first!.leafId).not.toBe(second!.leafId)
      }
    })
  })

  describe('splitLeaf', () => {
    it('splits a leaf into a row split with two children', () => {
      const svc = freshService()
      clearAndRegisterView('v1')
      clearAndRegisterView('v2')

      svc.activatePage('page1', { viewId: 'v1' })
      const layout = svc.getLayout('page1')!
      expect(layout.type).toBe('leaf')
      const leafId = (layout as { leafId: string }).leafId

      svc.splitLeaf(leafId, 'row', 'v2')

      const after = svc.getLayout('page1')!
      expect(after.type).toBe('split')
      if (after.type === 'split') {
        expect(after.direction).toBe('row')
        expect(after.children).toHaveLength(2)
        // First child is the original leaf
        expect(after.children[0].type).toBe('leaf')
        if (after.children[0].type === 'leaf') {
          expect(after.children[0].viewId).toBe('v1')
          expect(after.children[0].leafId).toBe(leafId)
        }
        // Second child is the new leaf
        expect(after.children[1].type).toBe('leaf')
        if (after.children[1].type === 'leaf') {
          expect(after.children[1].viewId).toBe('v2')
        }
        expect(after.sizes).toEqual([1, 1])
      }
    })

    it('splits a leaf inside a nested split', () => {
      const svc = freshService()
      clearAndRegisterView('v1')
      clearAndRegisterView('v2')
      clearAndRegisterView('v3')

      svc.activatePage('page1', { viewId: 'v1' })
      const root = svc.getLayout('page1')!
      const leafId = (root as { leafId: string }).leafId

      // Split into [v1, v2]
      svc.splitLeaf(leafId, 'row', 'v2')
      // Now split v2 into [v2, v3]
      const afterFirst = svc.getLayout('page1')!
      const v2Leaf = (afterFirst as any).children[1]
      const v2LeafId = v2Leaf.leafId

      svc.splitLeaf(v2LeafId, 'column', 'v3')

      const afterSecond = svc.getLayout('page1')!
      expect(afterSecond.type).toBe('split')
      if (afterSecond.type === 'split') {
        // Second child should now be a split
        expect(afterSecond.children[1].type).toBe('split')
      }
    })

    it('throws when viewId is not registered', () => {
      const svc = freshService()
      clearAndRegisterView('v1')

      svc.activatePage('page1', { viewId: 'v1' })
      const root = svc.getLayout('page1')!
      const leafId = (root as { leafId: string }).leafId

      expect(() => svc.splitLeaf(leafId, 'row', 'nonexistent')).toThrow()
    })
  })

  describe('closeLeaf', () => {
    it('closes a leaf and collapses parent split with single child', () => {
      const svc = freshService()
      clearAndRegisterView('v1')
      clearAndRegisterView('v2')

      svc.activatePage('page1', { viewId: 'v1' })
      const root = svc.getLayout('page1')!
      const leafId = (root as { leafId: string }).leafId
      svc.splitLeaf(leafId, 'row', 'v2')

      // Now we have [v1, v2] split; close v2
      const split = svc.getLayout('page1')!
      const v2LeafId = (split as any).children[1].leafId
      svc.closeLeaf(v2LeafId)

      // Should collapse back to single leaf (v1)
      const after = svc.getLayout('page1')!
      expect(after.type).toBe('leaf')
      if (after.type === 'leaf') {
        expect(after.viewId).toBe('v1')
      }
    })

    it('closes a leaf in multi-child split without collapsing', () => {
      const svc = freshService()
      clearAndRegisterView('v1')
      clearAndRegisterView('v2')
      clearAndRegisterView('v3')

      svc.activatePage('page1', { viewId: 'v1' })
      const root = svc.getLayout('page1')!
      const leafId = (root as { leafId: string }).leafId

      // Create a 3-child split: build [v1, v2] then split v2 to [v2, v3]
      svc.splitLeaf(leafId, 'row', 'v2')
      const split = svc.getLayout('page1')!
      const v1LeafId = (split as any).children[0].leafId
      svc.splitLeaf(v1LeafId, 'row', 'v3')

      // Close v3 — should leave 2 children, no collapse
      const split2 = svc.getLayout('page1')!
      const v3Leaf = (split2 as any).children[1] // v3 was inserted after v1? No...
      // Actually the tree is: [ [v1, v3], v2 ]. Closing v2 should leave [v1, v3]
      const v2LeafId = (split2 as any).children[1].leafId
      svc.closeLeaf(v2LeafId)

      const after = svc.getLayout('page1')!
      expect(after.type).toBe('split')
      if (after.type === 'split') {
        expect(after.children).toHaveLength(2)
      }
    })

    it('throws when trying to close the last leaf', () => {
      const svc = freshService()
      clearAndRegisterView('v1')

      svc.activatePage('page1', { viewId: 'v1' })
      const root = svc.getLayout('page1')!
      const leafId = (root as { leafId: string }).leafId

      expect(() => svc.closeLeaf(leafId)).toThrow()
    })
  })

  describe('setChildSizes', () => {
    it('updates sizes on a split node', () => {
      const svc = freshService()
      clearAndRegisterView('v1')
      clearAndRegisterView('v2')

      svc.activatePage('page1', { viewId: 'v1' })
      const root = svc.getLayout('page1')!
      const leafId = (root as { leafId: string }).leafId
      svc.splitLeaf(leafId, 'row', 'v2')

      const split = svc.getLayout('page1')!
      const splitId = (split as any).splitId
      svc.setChildSizes(splitId, [2, 1])

      const after = svc.getLayout('page1')!
      if (after.type === 'split') {
        expect(after.sizes).toEqual([2, 1])
      }
    })
  })

  describe('onDidChange', () => {
    it('fires when layout changes via splitLeaf', () => {
      const svc = freshService()
      clearAndRegisterView('v1')
      clearAndRegisterView('v2')

      svc.activatePage('page1', { viewId: 'v1' })
      const root = svc.getLayout('page1')!
      const leafId = (root as { leafId: string }).leafId

      let fired = false
      svc.onDidChange(() => { fired = true })
      svc.splitLeaf(leafId, 'row', 'v2')

      expect(fired).toBe(true)
    })
  })
})
