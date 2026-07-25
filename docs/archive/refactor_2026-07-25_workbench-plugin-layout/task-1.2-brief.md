# Step 1.2 brief — 核心类型 + Emitter/Disposable

## 任务

创建 `desktop/renderer/src/workbench/types.ts`（所有核心类型定义）和 `desktop/renderer/src/workbench/emitter.ts`（Emitter + Disposable），含单测。

## 背景

项目是 Electron + React 18 + TypeScript 5.6 + antd。已配好 vitest + jsdom（Step 1.1）。目标是把布局重构为插件化架构：布局壳 + 注册表 + 插件三层。

## 类型定义 (`workbench/types.ts`)

严格按 SPEC 4.1 定义以下类型，全部 export：

```ts
// 4 个布局区域
export type PartId = 'sidebar' | 'topbar' | 'content' | 'auxiliary'

// Topbar 内部 3 个子 slot
export type TopbarSlot = 'left' | 'center' | 'right'

// 可渲染的内容单元
export interface View {
  id: string
  title: string
  component: React.ComponentType   // 不是 ReactNode，是组件类型
}

// View 的容器，归属某个 Part（如 sidebar 里的"会话"容器）
export interface ViewContainer {
  id: string
  title: string
  part: PartId
  viewIds: string[]
}

// 页面：id + title + 各 Part 的内容装配声明
// 缺省的 Part 该页面下不渲染
export interface Page {
  id: string
  title: string
  layout: {
    sidebar?: { containerId: string }
    content?: { viewId: string }
    auxiliary?: { viewId: string }
  }
}

// Contribution Point 标识
export type ContributionPoint =
  | 'workbench.pages'
  | 'workbench.viewContainers'
  | 'workbench.views'
  | 'workbench.topbar'

// 页面贡献
export interface PageContribution {
  point: 'workbench.pages'
  page: Page
}

// ViewContainer 贡献
export interface ViewContainerContribution {
  point: 'workbench.viewContainers'
  container: ViewContainer
}

// View 贡献
export interface ViewContribution {
  point: 'workbench.views'
  view: View
}

// Topbar 贡献：直接声明属于哪个 page，不引入通用 when 表达式
export interface TopbarContribution {
  point: 'workbench.topbar'
  slot: TopbarSlot           // left | center | right
  pageId: string
  order?: number
  component: React.ComponentType
}

// 所有贡献的联合类型
export type Contribution =
  | PageContribution
  | ViewContainerContribution
  | ViewContribution
  | TopbarContribution

// 插件 activate 上下文：提供 registerContribution 方法
export interface PluginContext {
  registerContribution(contribution: Contribution): void
}

// 插件定义
export interface Plugin {
  id: string
  activate(ctx: PluginContext): Disposable | Disposable[] | void
  deactivate?(): void
}
```

## Emitter + Disposable (`workbench/emitter.ts`)

实现极简 `Emitter<T>`（仿 VS Code `Event` 模式）+ `Disposable` 接口：

```ts
// Disposable：表示可释放资源
export interface Disposable {
  dispose(): void
}

// Emitter<T>：类型安全的事件发射器
// - on(listener): 注册监听器，返回 Disposable
// - fire(event): 同步触发所有监听器
// - dispose(): 清除所有监听器
//
// 约束：
// - 同一 listener 重复注册是合法的（每次 on() 返回独立 Disposable，每个都生效）
// - fire() 期间 listener 自行 dispose 不影响当前遍历（先收集再调用）
// - fire() 期间新增的 listener 不在本次 fire 中调用
// - dispose() 后 on() 静默不注册（不抛异常），fire() 静默不触发
```

`Emitter` 类实现 `Disposable`。

## 文件结构

```
desktop/renderer/src/workbench/
├── types.ts       # 所有类型（无测试文件，纯类型定义）
├── emitter.ts     # Emitter + Disposable
├── emitter.test.ts  # Emitter 单测
```

## 验收标准（checkbox）

类型：
- [ ] `desktop/renderer/src/workbench/types.ts` 包含上述所有类型定义，全部 export
- [ ] 类型定义与 SPEC 4.1 完全一致（对照 SPEC 逐项确认）

Emitter 单测（`desktop/renderer/src/workbench/emitter.test.ts`），用 vitest：
- [ ] 注册 listener、fire 后 listener 被调用且收到正确参数
- [ ] 多个 listener 注册，fire 后全部被调用
- [ ] dispose listener 后不再收到事件
- [ ] 同一 listener 重复注册，每个 on() 返回的 Disposable 独立生效
- [ ] fire() 期间 listener 自行 dispose 不影响当前遍历（其他 listener 仍被调用）
- [ ] fire() 期间新增的 listener 不在本次 fire 中调用
- [ ] dispose Emitter 后 on() 不注册、fire() 不触发
- [ ] 所有测试通过（`npm run test`）

整体：
- [ ] `npm run typecheck` 通过
- [ ] workbench/ 模块不 import 任何业务代码（仅依赖 React 类型）

## 完成标准之外不要做的

- 不要实现 Registry、PageManager、PluginHost（那是后续 Step）
- 不要给 types.ts 写单测（纯类型定义，typecheck 就是验证）
- 不要在 emitter.ts 里添加延迟、异步、管道等超出需求的功能
- 不要修改任何 workbench/ 之外的文件
