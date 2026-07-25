# Step 1.3 brief — Registry 注册表

## 任务

创建 `desktop/renderer/src/workbench/registry.ts`：单例 Registry，管理所有 Contribution 的注册、查询、按 pageId 解析。含单测。

## 背景

项目已有 types.ts（所有类型）和 emitter.ts（Emitter + Disposable），均位于 `desktop/renderer/src/workbench/`。

## Registry API 设计

```ts
import { Emitter, Disposable } from './emitter'
import type {
  Contribution, Page, ViewContainer, View,
  TopbarContribution, PartId, TopbarSlot
} from './types'

// 页面解析结果：布局壳据此渲染各 Part
export interface PageResolution {
  pageId: string
  sidebar?: { container: ViewContainer; views: View[] }
  content?: { view: View }
  auxiliary?: { view: View }
  topbar: {
    left: Array<{ component: React.ComponentType; order: number }>
    center: Array<{ component: React.ComponentType; order: number }>
    right: Array<{ component: React.ComponentType; order: number }>
  }
}

export class Registry {
  static readonly instance = new Registry()

  private _pages = new Map<string, Page>()
  private _viewContainers = new Map<string, ViewContainer>()
  private _views = new Map<string, View>()
  private _topbarContribs: TopbarContribution[] = []

  private _emitter = new Emitter<void>()

  /** 注册一个贡献，返回 Disposable 用于取消注册 */
  registerContribution(contribution: Contribution): Disposable

  /** 变化时通知（页面切换用 pageManager，这里用注册变化） */
  onDidChange(listener: () => void): Disposable

  // ── 查询 ──
  getPages(): Page[]
  getPage(pageId: string): Page | undefined
  getViewContainers(part?: PartId): ViewContainer[]
  getViews(): View[]
  getView(viewId: string): View | undefined
  getTopbarContributions(pageId: string, slot?: TopbarSlot): TopbarContribution[]

  /** 解析一个页面：返回该 pageId 下所有 Part 应渲染的内容 */
  resolvePage(pageId: string): PageResolution | undefined
}
```

### 解析规则（resolvePage）

1. 找 Page：`getPage(pageId)`，不存在返回 undefined
2. **sidebar**：若 `page.layout.sidebar` 存在 → 找 container → 找 container.viewIds 对应的 views。container 不存在或 view 缺失 → sidebar 为空（不抛异常，静默降级）
3. **content**：若 `page.layout.content` 存在 → 找 view。view 缺失 → content 为空
4. **auxiliary**：若 `page.layout.auxiliary` 存在 → 找 view。view 缺失 → auxiliary 为空
5. **topbar**：收集所有 `pageId` 匹配的 TopbarContribution，按 slot 分组，各组按 `order` 升序（order 缺省视为 0）

### registerContribution 行为

- 按 point 分发存储：
  - `workbench.pages` → 存入 `_pages` map（key = page.id）
  - `workbench.viewContainers` → 存入 `_viewContainers` map（key = container.id）
  - `workbench.views` → 存入 `_views` map（key = view.id）
  - `workbench.topbar` → push 到 `_topbarContribs` 数组
- 注册成功后 fire `_emitter`
- 返回的 Disposable.dispose() 从内部移除该贡献，并 fire `_emitter`
- 重复注册同一 id 的 page/container/view：后者覆盖前者（不抛异常）

## 单测文件

`desktop/renderer/src/workbench/registry.test.ts`

至少覆盖：
- [ ] 注册 page、查询 getPages / getPage
- [ ] 注册 viewContainer、按 part 过滤查询
- [ ] 注册 view、按 id 查询
- [ ] 注册 topbar contribution、按 pageId + slot 查询、order 排序
- [ ] resolvePage：完整解析（sidebar + content + auxiliary + topbar）
- [ ] resolvePage：缺省 Part 不渲染（page.layout 中无该 key 时对应字段为 undefined）
- [ ] resolvePage：引用的 container/view 不存在时静默降级（不抛异常，对应字段为 undefined 或空）
- [ ] resolvePage：pageId 不存在返回 undefined
- [ ] dispose 取消注册：page/container/view/topbar 被移除后查询不到
- [ ] onDidChange：注册和取消注册都触发 listener
- [ ] 重复注册同一 id 后者覆盖，且 fire onDidChange

## 验收标准

- [ ] 所有单测通过
- [ ] `npm run typecheck` 通过
- [ ] `npm run test` 全量通过
- [ ] registry.ts 不 import 任何 workbench/ 之外的业务代码（emitter/types 除外）

## 完成标准之外不要做的

- 不要实现 PageManager、PluginHost（后续 Step）
- 不要给 Registry 添加缓存、防抖、去重等超出需求的逻辑
- 不要修改 workbench/ 之外的文件
