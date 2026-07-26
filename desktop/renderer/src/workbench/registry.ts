import type { ComponentType } from 'react'
import { Emitter } from './emitter'
import type { Disposable } from './emitter'
import type {
  Contribution,
  Page,
  View,
  ViewContainer,
  TopbarContribution,
  PartId,
  TopbarSlot,
  ContentNode
} from './types'

// ── PageResolution ──────────────────────────────────────

export interface PageResolution {
  pageId: string
  sidebar?: { container: ViewContainer; views: View[] }
  content?: ContentNode
  auxiliary?: { view: View }
  topbar: {
    left: Array<{ component: ComponentType; order: number }>
    center: Array<{ component: ComponentType; order: number }>
    right: Array<{ component: ComponentType; order: number }>
  }
}

// ── Registry ────────────────────────────────────────────

export class Registry {
  static readonly instance = new Registry()

  private _pages = new Map<string, Page>()
  private _viewContainers = new Map<string, ViewContainer>()
  private _views = new Map<string, View>()
  private _topbarContribs: TopbarContribution[] = []

  private _emitter = new Emitter<void>()
  private _version = 0

  /** 单调递增的版本号，每次注册/取消注册时 +1。用于 React useSyncExternalStore 对比。 */
  get version(): number {
    return this._version
  }

  // ── Registration ──

  registerContribution(contribution: Contribution): Disposable {
    switch (contribution.point) {
      case 'workbench.pages':
        return this._registerPage(contribution.page)
      case 'workbench.viewContainers':
        return this._registerViewContainer(contribution.container)
      case 'workbench.views':
        return this._registerView(contribution.view)
      case 'workbench.topbar':
        return this._registerTopbar(contribution)
    }
  }

  private _registerPage(page: Page): Disposable {
    this._pages.set(page.id, page)
    this._fireChange()
    return { dispose: () => { this._pages.delete(page.id); this._fireChange() } }
  }

  private _registerViewContainer(container: ViewContainer): Disposable {
    this._viewContainers.set(container.id, container)
    this._fireChange()
    return { dispose: () => { this._viewContainers.delete(container.id); this._fireChange() } }
  }

  private _registerView(view: View): Disposable {
    this._views.set(view.id, view)
    this._fireChange()
    return { dispose: () => { this._views.delete(view.id); this._fireChange() } }
  }

  private _registerTopbar(contrib: TopbarContribution): Disposable {
    this._topbarContribs.push(contrib)
    this._fireChange()
    return {
      dispose: () => {
        const idx = this._topbarContribs.indexOf(contrib)
        if (idx !== -1) this._topbarContribs.splice(idx, 1)
        this._fireChange()
      }
    }
  }

  private _fireChange(): void {
    this._version++
    this._emitter.fire()
  }

  // ── Change notification ──

  onDidChange(listener: () => void): Disposable {
    return this._emitter.on(listener)
  }

  // ── Queries ──

  getPages(): Page[] {
    return Array.from(this._pages.values())
  }

  getPage(pageId: string): Page | undefined {
    return this._pages.get(pageId)
  }

  getViewContainers(part?: PartId): ViewContainer[] {
    const all = Array.from(this._viewContainers.values())
    if (part === undefined) return all
    return all.filter((c) => c.part === part)
  }

  getViews(): View[] {
    return Array.from(this._views.values())
  }

  getView(viewId: string): View | undefined {
    return this._views.get(viewId)
  }

  getTopbarContributions(pageId: string, slot?: TopbarSlot): TopbarContribution[] {
    let filtered = this._topbarContribs.filter((t) => t.pageId === pageId)
    if (slot !== undefined) {
      filtered = filtered.filter((t) => t.slot === slot)
    }
    // Sort by order ascending, undefined = 0
    return filtered.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }

  // ── Page resolution ──

  resolvePage(pageId: string): PageResolution | undefined {
    const page = this._pages.get(pageId)
    if (!page) return undefined

    const resolution: PageResolution = {
      pageId,
      topbar: { left: [], center: [], right: [] }
    }

    // Sidebar
    if (page.layout.sidebar) {
      const container = this._viewContainers.get(page.layout.sidebar.containerId)
      if (container) {
        const views = container.viewIds
          .map((vid) => this._views.get(vid))
          .filter((v): v is View => v !== undefined)
        resolution.sidebar = { container, views }
      }
    }

    // Content — 原样传递声明树，不再预解析单 view
    if (page.layout.content) {
      resolution.content = page.layout.content
    }

    // Auxiliary
    if (page.layout.auxiliary) {
      const view = this._views.get(page.layout.auxiliary.viewId)
      if (view) {
        resolution.auxiliary = { view }
      }
    }

    // Topbar: group by slot
    const topbarForPage = this._topbarContribs.filter((t) => t.pageId === pageId)
    for (const t of topbarForPage) {
      resolution.topbar[t.slot].push({ component: t.component, order: t.order ?? 0 })
    }
    // Sort each slot
    for (const slot of ['left', 'center', 'right'] as const) {
      resolution.topbar[slot].sort((a, b) => a.order - b.order)
    }

    return resolution
  }
}
