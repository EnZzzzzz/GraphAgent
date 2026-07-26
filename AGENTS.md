# GraphAgent — Agent 开发指南

## 项目概览

GraphAgent 是一个基于 Electron + React + TypeScript + Ant Design 的桌面 Agent 客户端。

## 前端架构：Workbench 插件系统

前端采用 VS Code 风格的 **布局壳 + 贡献点注册表 + 插件** 三层架构：

```
desktop/renderer/src/
├── workbench/              # 框架层（不依赖业务）
│   ├── types.ts            # PartId, View, ViewContainer, Page, Contribution, Plugin
│   ├── emitter.ts          # Emitter<T> + Disposable（VS Code Event 风格）
│   ├── registry.ts         # Registry 单例：registerContribution / resolvePage
│   ├── pageManager.ts      # activePage 状态管理 + 切换
│   ├── pluginHost.ts       # activateBuiltin() + Disposable 聚合
│   ├── WorkbenchLayout.tsx # 布局壳：sidebar / topbar(left/center/right) / content / auxiliary
│   ├── ResizeHandle.tsx    # Part 边缘拖拽调宽手柄（sidebar / auxiliary，content flex 随动）
│   └── useContribution.ts  # useSyncExternalStore 封装
├── plugins/                # 内置插件（业务）
│   ├── sessions/           # sidebar 会话列表
│   ├── sessionPage/        # 会话页：topbar + content
│   ├── chat/               # 右侧对话面板（auxiliary）
│   └── index.ts            # BUILTIN_PLUGINS
├── App.tsx                 # 入口：PluginHost.activateBuiltin() + <WorkbenchLayout/>
├── pageManagerInstance.ts  # 全局 PageManager 单例
└── mock.ts                 # Mock 数据（保留）
```

## 核心概念

| 概念 | 说明 |
| --- | --- |
| **Part** | 4 个布局区域：`sidebar` / `topbar` / `content` / `auxiliary`。topbar 内分 `left`/`center`/`right` 三个 slot |
| **View** | 可渲染内容单元：`{ id, title, component }` |
| **ViewContainer** | View 容器，归属于某个 Part |
| **Page** | 页面：声明各 Part 装配内容 |
| **Contribution** | 插件贡献：`workbench.pages` / `workbench.viewContainers` / `workbench.views` / `workbench.topbar` |
| **Plugin** | `{ id, activate(ctx), deactivate?() }` |

## 如何新建一个内置插件

```ts
// plugins/myPlugin/index.ts
import type { Plugin } from '../../workbench/types'
import { MyView } from './MyView'

export const myPlugin: Plugin = {
  id: 'builtin.myPlugin',
  activate(ctx) {
    // 注册 page（如果这是新页面）
    ctx.registerContribution({
      point: 'workbench.pages',
      page: { id: 'my-page', title: 'My Page', layout: { content: { viewId: 'my-view' } } }
    })
    // 注册 view
    ctx.registerContribution({
      point: 'workbench.views',
      view: { id: 'my-view', title: 'My View', component: MyView }
    })
  }
}

// 加到 plugins/index.ts 的 BUILTIN_PLUGINS 数组中
```

## 页面切换

```ts
import { getPageManager } from '../pageManagerInstance'
getPageManager().switchPage('my-page')
```

## 测试

- 框架：`vitest` + `@testing-library/react` + `jsdom`
- 运行：`npm run test`
- 类型检查：`npm run typecheck`
- 构建：`npm run build`
- 开发：`npm run dev`

## 设计 Token

项目使用 `desktop/renderer/src/theme/tokens.ts` 作为设计值的**唯一数据源**，分 `color` / `font` / `radius` / `spacing` / `layout` 五域。Token 同时注入为 CSS 自定义属性（`--ga-*`），供 CSS、组件内联样式与未来插件消费。

### 消费方式

```ts
// CSS（推荐）—— 插件可跨技术栈消费
.panel { background: var(--ga-color-bg-panel); }

// TypeScript —— 类型安全的直接引用
import { tokens } from '../theme/tokens'
const c = tokens.color.primary

// 内联样式 —— CSS 变量优先
<div style={{ color: 'var(--ga-color-text-base)' }} />
```

**原则**：CSS 变量优先。TS import 用于需要编程计算值（如 ResizeHandle 的 clamp 范围）或 token 引用不可省略的场景（如 themeConfig 派生）。

### Token 命名规范

CSS 变量格式：`--ga-<域>-<kebab名>`。如 `tokens.color.textBase` → `--ga-color-text-base`。

## Content 分屏

Content 区域支持声明式嵌套分屏布局，由 `ContentNode` 类型描述：

```ts
type ContentNode = ContentLeaf | ContentSplit

interface ContentLeaf { viewId: string }
interface ContentSplit {
  direction: 'row' | 'column'  // row=左右分屏，column=上下分屏
  children: ContentNode[]
  sizes?: number[]              // flex-grow 权重，缺省全 1
}
```

### 声明分屏

在 Page 声明中使用嵌套 `ContentNode`：

```ts
ctx.registerContribution({
  point: 'workbench.pages',
  page: {
    id: 'my-page',
    title: 'My Page',
    layout: {
      content: {
        direction: 'row',
        children: [
          { viewId: 'left-panel' },
          { viewId: 'right-panel' }
        ],
        sizes: [1, 2]
      }
    }
  }
})
```

旧 `{ viewId }` 写法仍兼容（等价于单叶子 `ContentLeaf`）。

### 运行时分屏

通过 `getContentLayoutService()` 单例在运行时拆分/关闭 pane：

```ts
import { getContentLayoutService } from '../contentLayoutServiceInstance'

const svc = getContentLayoutService()
// 拆分 leaf 为左右分屏
svc.splitLeaf(leafId, 'row', 'new-view-id')
// 关闭 leaf（最后一个 leaf 不可关闭）
svc.closeLeaf(leafId)
// 调整分屏权重
svc.setChildSizes(splitId, [1, 2, 1])
// 订阅布局变更
svc.onDidChange(() => { /* re-render */ })
```

分屏 divider 可拖拽调节比例，每个 leaf 有 120px 最小尺寸约束。
