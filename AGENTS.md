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

项目使用 `desktop/renderer/src/theme/tokens.ts` 定义 `ThemeTokens` 接口（`color` / `font` / `radius` / `spacing` / `shadow` 五域）与跨主题不变的 `layout` 常量。Token 同时注入为 CSS 自定义属性（`--ga-*`），供 CSS、组件内联样式与未来插件消费。

### 多主题结构

```
theme/
├── tokens.ts          # ThemeTokens 类型定义 + layout 常量
├── themes/
│   ├── teal.ts        # { light, dark }: ThemeTokens
│   └── shopify.ts     # { light, dark }: ThemeTokens
├── themeStore.ts      # 当前主题 state（emitter 模式，同 pageManager）
├── themeConfig.ts     # buildThemeConfig(tokens, mode, themeId): ThemeConfig
├── ThemeProvider.tsx   # 订阅 store → ConfigProvider
└── cssVariables.ts    # applyCssVariables(tokens) + applyCurrentTheme()
```

两套主题 × 双模式 = 4 个 token 集：`teal { light, dark }` 与 `shopify { light, dark }`。
`layout` 域跨主题不变，单独导出。

### themeStore 用法

```ts
import { getThemeStore } from '../theme/themeStore'

const store = getThemeStore()
store.getTheme()           // { themeId: 'teal', mode: 'light' }
store.setTheme('shopify', 'dark')
store.onDidChange((s) => { /* s: ThemeState */ })
```

localStorage key `ga-theme` 持久化；mode 缺省跟随 `prefers-color-scheme`。

### 新增主题

1. 在 `themes/` 下新建 `<name>.ts`，导出 `{ light: ThemeTokens, dark: ThemeTokens }`
2. 在 `cssVariables.ts` 的 `resolveTokens()` 增加分支
3. 更新 `ThemeId` 类型（`themeStore.ts`）
4. 在 `ThemeSwitcher.tsx` 的 `THEME_CYCLE` 中加入

### 消费方式

```ts
// CSS（推荐）—— 插件可跨技术栈消费
.panel { background: var(--ga-color-bg-panel); }

// TypeScript —— 类型安全的直接引用
import { layout } from '../theme/tokens'
import { teal } from '../theme/themes/teal'
const c = teal.light.color.primary

// 内联样式 —— CSS 变量优先
<div style={{ color: 'var(--ga-color-text-base)' }} />
```

**原则**：CSS 变量优先。TS import 用于需要编程计算值（如 ResizeHandle 的 clamp 范围）或 token 引用不可省略的场景（如 themeConfig 派生）。

### Token 命名规范

CSS 变量格式：`--ga-<域>-<kebab名>`。如 `shadow.panel` → `--ga-shadow-panel`；`layout.topbarHeight` → `--ga-layout-topbar-height`。`shadow` 域为完整 box-shadow 字符串，不加 px。

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

## 组件库 `ui/`

项目内置共享组件库 `desktop/renderer/src/ui/`，是项目唯一的 UI 组件出口。插件应优先从 `ui/` 导入预置组件，而非直接 import antd。

### 导入方式

```ts
// 从统一入口导入（推荐）
import { Button, Card, Typography } from '../../ui'

// 图标从 ui/icons 统一出口
import { RobotOutlined, PlusOutlined } from '../../ui/icons'

// @ant-design/x 组件
import { Bubble, Sender } from '../../ui'
```

### 可用组件

| 组件 | 说明 |
| --- | --- |
| `Button` | 薄包装 antd Button，透出全部 props |
| `Typography` | antd Typography |
| `Avatar` | antd Avatar |
| `Menu` | antd Menu |
| `Tooltip` | antd Tooltip |
| `Card` | antd Card |
| `Empty` | antd Empty |
| `TopbarSearchInput` | 组合组件：顶部搜索框（示范消费 token + 组合 antd Input + icons） |
| `Bubble` / `Sender` | 从 @ant-design/x re-export |
| `ui/icons` | 常用 @ant-design/icons 统一出口 |

### Import 约束

只有 `ui/`、`main.tsx`（ConfigProvider）、`theme/`（基础设施层 token 派生配置）允许直接 import `antd` / `@ant-design/x` / `@ant-design/icons`。
