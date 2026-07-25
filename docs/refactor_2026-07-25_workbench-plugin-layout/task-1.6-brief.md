# Step 1.6 brief — WorkbenchLayout + useContribution

## 任务

创建 `desktop/renderer/src/workbench/useContribution.ts`（`useSyncExternalStore` 封装）和 `desktop/renderer/src/workbench/WorkbenchLayout.tsx`（4 Part slot 布局壳 + topbar 3 子 slot），含关键渲染测试。

## 背景

已有 types.ts / emitter.ts / registry.ts / pageManager.ts / pluginHost.ts。项目使用 React 18.3.1 + antd 5 + TypeScript。

现有 CSS 在 `desktop/renderer/src/index.css` 中：渐变色底 + 白色悬浮圆角面板（232px sidebar / 400px auxiliary / 56px topbar / content 自适应）。

## useContribution.ts

`useSyncExternalStore` 封装，让 React 组件订阅 Emitter 变化：

```ts
import { useSyncExternalStore } from 'react'
import type { Emitter } from './emitter'

/**
 * 订阅 Emitter 并在每次 fire 时重新获取快照。
 * emitter 参数可为 undefined（此时返回初始值，不报错）。
 */
export function useObservable<T>(emitter: Emitter<void> | undefined, getSnapshot: () => T): T {
  const subscribe = (callback: () => void) => {
    if (!emitter) return () => {}
    const d = emitter.on(callback)
    return () => d.dispose()
  }

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot // SSR snapshot same as client
  )
}
```

## WorkbenchLayout.tsx

```tsx
import { useObservable } from './useContribution'
import { Registry } from './registry'
import type { PageManager } from './pageManager'

interface WorkbenchLayoutProps {
  pageManager: PageManager
}

export function WorkbenchLayout({ pageManager }: WorkbenchLayoutProps): JSX.Element
```

### 渲染结构

```
<div className="app-shell">
  {/* Sidebar */}
  <aside className="panel panel-sidebar">
    {resolution?.sidebar && (
      /* 渲染 container 标题 + views（每个 view 渲染 view.component） */
    )}
  </aside>

  <div className="main-column">
    {/* Topbar */}
    <header className="topbar">
      <div className="topbar-left">
        {resolution.topbar.left.map(item => <item.component key=... />)}
      </div>
      <div className="topbar-center">
        {resolution.topbar.center.map(item => <item.component key=... />)}
      </div>
      <div className="topbar-right">
        {resolution.topbar.right.map(item => <item.component key=... />)}
      </div>
    </header>

    <div className="main-row">
      {/* Content */}
      <main className="panel panel-content">
        {resolution?.content && <resolution.content.view.component />}
      </main>

      {/* Auxiliary */}
      {resolution?.auxiliary && (
        <aside className="panel panel-chat">
          <resolution.auxiliary.view.component />
        </aside>
      )}
    </div>
  </div>
</div>
```

### 行为

- `useObservable` 订阅 `pageManager.onDidChangePage` 和 `Registry.instance.onDidChange`
- 在 getSnapshot 中重新 `Registry.instance.resolvePage(pageManager.activePageId ?? '')`
- activePageId 为 null → resolution 为 undefined → 渲染空壳（仅容器框，无内容）
- Part 声明了但 resolve 结果为空（如 sidebar.container 不存在）：不渲染该 Part 的内容区
- 顶层结构（app-shell > aside + main-column）始终渲染（即使空壳）
- layout CSS class 保持与现有 index.css 一致：不复制 CSS，复用已有 class

## 渲染测试

`desktop/renderer/src/workbench/WorkbenchLayout.test.tsx`，用 @testing-library/react + vitest：

- [ ] 无 active page 时渲染空壳（app-shell 存在）
- [ ] 有 active page 时渲染 sidebar / content / auxiliary / topbar 内容
- [ ] sidebar 渲染 container 标题 + views 的 component
- [ ] auxiliary 缺失时 panel-chat 不渲染
- [ ] topbar 按 slot 分组渲染

测试策略：
- 注册测试用的 page/container/view/topbar 到 Registry.instance
- 创建 PageManager，switchPage 到测试页面
- 用 render() 渲染 WorkbenchLayout
- 用 screen.getByText / queryByText 验证各区域内容

**注意**：每个测试前清理 Registry 状态（与 pluginHost.test.ts 同样方式），避免测试间污染。测试用简单文本组件（如 `() => <span>SidebarView</span>`），不用 antd 组件。

## 验收标准

- [ ] `npm run test` 全量通过（含新渲染测试）
- [ ] `npm run typecheck` 通过
- [ ] workbench/ 模块不 import 业务代码（只依赖 React + antd 类型）
- [ ] 现有 index.css 不修改（P2 才迁移 CSS）

## 完成标准之外不要做的

- 不要修改 index.css
- 不要改 App.tsx
- 不要给 WorkbenchLayout 加尺寸拖拽、面板切换动画等高级能力
