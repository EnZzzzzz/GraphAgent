# SPEC — Workbench 插件化布局架构重构

日期：2026-07-25
类型：refactor
状态：待评审

## 1. 背景

`desktop/renderer` 当前是一个单页三栏 demo：布局骨架（左侧 Sidebar、顶部 Topbar、中间 ContentArea、右侧 ChatPanel）完全硬编码在 `App.tsx` + `index.css` 中，无路由、无状态管理、无任何扩展机制。后续要支持插件系统：插件可以自定义左侧、右侧、中间内容区域以及顶部导航栏的内容，且不同页面下各区域显示的内容可以不同。

## 2. 目标

参考 VS Code 的 workbench / contribution point 设计，把前端重构为「布局壳 + 贡献点注册表 + 插件」三层架构：

- **布局区域可扩展**：左侧栏、顶部栏、中间内容区、右侧面板均为动态 slot，内容由插件注册，布局壳不关心具体内容。
- **页面化**：引入 page 概念，不同 page 下各区域显示的内容可以不同。
- **现有功能等价迁移**：现有 4 个组件（Sidebar / Topbar / ContentArea / ChatPanel）迁移为内置插件，行为与视觉保持不变。

## 3. 非目标（本期明确不做）

- 第三方插件的动态加载（manifest 发现、动态 import、沙箱、远程代码）。本期插件均为静态 import 的内置插件，但框架预留 `Plugin` 接口与 activate/deactivate 生命周期。
- URL 路由（不引入 react-router；Electron 单窗口应用不需要 URL 可分享）。
- 布局尺寸拖拽调整、view 在容器间拖拽移动、面板最大化等高级 workbench 能力。
- 后端 `server/` 集成、IPC 通道建设。
- 复杂的 `when` 上下文表达式求值（本期只用 pageId 做可见性匹配）。

## 4. 设计要点

### 4.1 核心概念（对齐 VS Code 术语）

| 概念 | 说明 |
| --- | --- |
| **Part** | 布局区域，共 4 个：`sidebar`（左）、`topbar`（上）、`content`（中）、`auxiliary`（右）。Topbar 内部再分 `left` / `center` / `right` 三个 slot。 |
| **View** | 可渲染的内容单元：`{ id, title, component }`，注册到某个 ViewContainer。 |
| **ViewContainer** | View 的容器，归属某个 Part（如 sidebar 里的「会话」容器）。 |
| **Page** | 页面：`{ id, title }` + 各 Part 的内容装配声明。同一时刻只有一个 active page。 |
| **Contribution Point** | 插件可贡献的扩展点：`workbench.pages`、`workbench.viewContainers`、`workbench.views`、`workbench.topbar`。 |
| **Plugin** | `{ id, activate(ctx), deactivate?() }`。`activate` 中通过 `ctx.contributions` 注册贡献，返回 Disposable 集合。 |

### 4.2 页面与区域内容的解析规则（KISS 版）

- Page 声明自己的装配：`{ sidebar?: { containerId }, content?: { viewId }, auxiliary?: { viewId } }`；缺省的 Part 该页面下不渲染。
- `workbench.topbar` 贡献形如 `{ slot: 'left'|'center'|'right', pageId: string, order?: number, component }`——直接声明属于哪个 page，当前 page 切换时 topbar 三个 slot 重新解析。不引入通用 when 表达式。
- 布局壳（WorkbenchLayout）只负责：渲染 4 个 Part 的容器框（含现有视觉：悬浮圆角面板、尺寸、拖拽区），各 Part 内容向 Registry 查询当前 page 的解析结果并渲染。

### 4.3 状态与响应式

- 不引入第三方状态库。自研极简 `Emitter<T>`（仿 VS Code `Event`）+ `useSyncExternalStore` hook，Registry / PageManager 的变化驱动 React 重渲染。
- Registry 为模块级单例（`Registry.instance`），PluginHost 在应用启动时 activate 全部内置插件。

### 4.4 目录结构（目标态）

```
desktop/renderer/src/
├── workbench/                  # 框架层：不依赖任何业务
│   ├── types.ts                # PartId / View / ViewContainer / Page / Contribution / Plugin
│   ├── emitter.ts              # Emitter + Disposable
│   ├── registry.ts             # Registry 单例：registerContribution / onDidChange / resolve
│   ├── pluginHost.ts           # activate 内置插件列表，统一管理 Disposable
│   ├── pageManager.ts          # activePage 状态 + 切换
│   ├── WorkbenchLayout.tsx     # 布局壳：4 Part slot + topbar 3 子 slot
│   └── useContribution.ts      # useSyncExternalStore 封装
├── plugins/                    # 内置插件（业务）
│   ├── sessions/               # sidebar 会话容器 + 会话列表 view
│   ├── sessionPage/            # session 页：topbar 贡献 + content 主视图
│   ├── chat/                   # auxiliary 右侧面板（现 ChatPanel）
│   └── index.ts                # BUILTIN_PLUGINS 列表
├── App.tsx                     # 瘦身为：activate 插件 + <WorkbenchLayout/>
├── main.tsx / theme.ts / env.d.ts / index.css（保留，布局相关 CSS 迁入 workbench）
```

### 4.5 迁移约束

- 现有视觉与交互零回归：面板尺寸（232px / 400px / 56px）、薄荷青主题、macOS 无边框拖拽区、ChatPanel 的 mock 流式输出、会话切换行为。
- `mock.ts` 保留，作为 sessions 插件的数据源。
- 页面切换后各区域内容不同这一点，用一个示例第二页面（如 agents 页）验证。

## 5. 技术选型

- 测试框架：新增 `vitest` + `@testing-library/react` + `jsdom`（devDependency），框架层（registry / pageManager / emitter）必须有单测；组件层做关键渲染测试。
- 除测试依赖外，不新增任何运行时依赖。

## 6. 变更记录

| 日期 | 变更 |
| --- | --- |
| 2026-07-25 | 初稿，待评审 |
