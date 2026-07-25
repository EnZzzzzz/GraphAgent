# Step 1.4 brief — PageManager

## 任务

创建 `desktop/renderer/src/workbench/pageManager.ts`：管理 activePage 状态、切换页面、变化通知。含单测。

## 背景

已有 `workbench/types.ts`（Page 类型）、`workbench/emitter.ts`（Emitter/Disposable）、`workbench/registry.ts`（Registry 单例）。

## API 设计

```ts
import { Emitter, Disposable } from './emitter'

export class PageManager {
  private _activePageId: string | null = null
  private _emitter = new Emitter<string | null>()

  /** 当前 active pageId，无页面时为 null */
  get activePageId(): string | null

  /** 切换到指定页面。pageId 不存在于任何已注册 page 中也允许（延迟校验，由布局壳处理） */
  switchPage(pageId: string): void

  /** 清空 active page */
  clearPage(): void

  /** activePage 变化时通知，参数为新 pageId（null 表示清空） */
  onDidChangePage(listener: (pageId: string | null) => void): Disposable
}
```

### 行为约束

- `switchPage(id)`：设置 `_activePageId = id`，fire emitter（参数 = id）
- `switchPage` 切换到相同 pageId 时：仍然 fire（不静默跳过）—— 由消费方用 React 的 `useSyncExternalStore` 自行去重
- `clearPage()`：设置 `_activePageId = null`，fire emitter（参数 = null）
- 初始状态 `activePageId === null`
- PageManager 不依赖 Registry（不 import registry），它只管理"当前 pageId 是什么"，由布局壳把 pageId 传给 Registry.resolvePage()

## 单测

`desktop/renderer/src/workbench/pageManager.test.ts` 至少覆盖：

- [ ] 初始 activePageId 为 null
- [ ] switchPage 更新 activePageId
- [ ] switchPage 触发 onDidChangePage listener，参数正确
- [ ] 切换到同一 pageId 仍然触发 listener
- [ ] clearPage 将 activePageId 重置为 null，触发 listener 参数为 null
- [ ] onDidChangePage dispose 后不再收到通知

## 验收标准

- [ ] 所有单测通过
- [ ] `npm run typecheck` 通过
- [ ] `npm run test` 全量通过
- [ ] pageManager.ts 不 import Registry（独立性）

## 完成标准之外不要做的

- 不要给 PageManager 加 URL hash sync、localStorage 持久化
- 不要在 PageManager 里校验 pageId 是否存在（布局壳负责）
