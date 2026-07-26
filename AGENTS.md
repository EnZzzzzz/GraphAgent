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
│   └── useContribution.ts  # useSyncExternalStore 封装
├── plugins/                # 内置插件（业务）
│   ├── sessions/           # sidebar 会话列表
│   ├── sessionPage/        # 会话页：topbar + content
│   ├── chat/               # 右侧对话面板（auxiliary）
│   ├── agents/             # 示例第二页面：验证多页面架构
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
