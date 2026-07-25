import type { ComponentType } from 'react'

// ── Part ────────────────────────────────────────────────
/** 4 个布局区域 */
export type PartId = 'sidebar' | 'topbar' | 'content' | 'auxiliary'

/** Topbar 内部 3 个子 slot */
export type TopbarSlot = 'left' | 'center' | 'right'

// ── View / ViewContainer ────────────────────────────────
/** 可渲染的内容单元 */
export interface View {
  id: string
  title: string
  component: ComponentType
}

/** View 的容器，归属某个 Part（如 sidebar 里的"会话"容器） */
export interface ViewContainer {
  id: string
  title: string
  part: PartId
  viewIds: string[]
}

// ── Page ────────────────────────────────────────────────
/** 页面：id + title + 各 Part 的内容装配声明。缺省的 Part 该页面下不渲染 */
export interface Page {
  id: string
  title: string
  layout: {
    sidebar?: { containerId: string }
    content?: { viewId: string }
    auxiliary?: { viewId: string }
  }
}

// ── Contribution Points ─────────────────────────────────
export type ContributionPoint =
  | 'workbench.pages'
  | 'workbench.viewContainers'
  | 'workbench.views'
  | 'workbench.topbar'

export interface PageContribution {
  point: 'workbench.pages'
  page: Page
}

export interface ViewContainerContribution {
  point: 'workbench.viewContainers'
  container: ViewContainer
}

export interface ViewContribution {
  point: 'workbench.views'
  view: View
}

/** Topbar 贡献：直接声明属于哪个 page，不引入通用 when 表达式 */
export interface TopbarContribution {
  point: 'workbench.topbar'
  slot: TopbarSlot
  pageId: string
  order?: number
  component: ComponentType
}

export type Contribution =
  | PageContribution
  | ViewContainerContribution
  | ViewContribution
  | TopbarContribution

// ── Plugin ──────────────────────────────────────────────
import type { Disposable } from './emitter'

export interface PluginContext {
  registerContribution(contribution: Contribution): void
}

export interface Plugin {
  id: string
  activate(ctx: PluginContext): Disposable | Disposable[] | void
  deactivate?(): void
}
