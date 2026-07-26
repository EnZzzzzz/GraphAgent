# SPEC — 设计 token 统一管理 + Workbench content 区域分屏布局

日期：2026-07-26
类型：feature
状态：待评审

## 1. 背景

当前 renderer 的设计值分散在多处、各自硬编码：

- `theme.ts`：antd `ThemeConfig`（主色、字体、圆角、组件覆盖）；
- `index.css`：壳层渐变底色、面板白底/圆角/投影、12px 间距、topbar 56px、handle 颜色等字面量；
- `WorkbenchLayout.tsx`：`PART_WIDTH_LIMITS`（sidebar / auxiliary 默认与拖拽范围）；
- 业务组件内联样式：如 `SessionContentView.tsx` 中的 `#1b1f27`、`#fafbfd`。

后续要做插件系统，插件 UI 必须能消费同一套设计基调，否则各插件样式会发散。因此需要**单一数据源的 token 体系**，同时供 antd 组件、手写 CSS、插件三方代码消费。

另外，content Part 目前只支持单 View（`Page.layout.content: { viewId }`），无法承载「文档 + 图表」「对话 + 产物」这类并置场景，需要支持左右 / 上下分屏。

## 2. 目标

1. **设计 token 单一数据源**：新建 `desktop/renderer/src/theme/` 模块，集中定义颜色 / 字体 / 圆角 / 间距 / 阴影 / 布局尺寸 token；antd `ThemeConfig` 从 token 派生；token 同时注入为 CSS 自定义属性（`--ga-*`），供 `index.css`、组件内联样式、未来插件消费。
2. **存量改造**：`index.css`、`WorkbenchLayout`、业务组件中的硬编码设计值全部改为消费 token，视觉零回归。
3. **content 分屏**：`Page.layout.content` 扩展为可嵌套的分屏树（`row` / `column` 方向，向后兼容现有 `{ viewId }` 写法）；分屏 divider 支持拖拽调节比例；提供运行时 layout service，支持动态拆分 / 关闭 pane。
4. **共享组件库**：新建 `desktop/renderer/src/ui/`，把项目用到的组件（按钮、菜单、卡片、顶部导航搜索框等）统一收口为预置组件，插件优先使用预置组件而非直接 import antd。对标 VS Code 的做法：内核用私有 widget toolkit（`vs/base/browser/ui`），扩展侧通过 `--vscode-*` CSS 变量 + 官方 Webview UI Toolkit 保证风格一致——对应本项目的 token 体系（目标 1）+ `ui/` 组件库（本目标）。

## 3. 非目标

- 暗色主题 / 多主题切换（token 结构为此留好位置，本期不实现）。
- 布局与宽度持久化（刷新后恢复默认，沿用既有决策）。
- pane 内 tab 栏、pane 间拖拽移动 View、最大化 pane。
- antd 组件库替换、视觉风格重设计（token 值沿用现状，只做集中化管理）。
- 插件沙箱 / 样式隔离机制（本期只提供 token 消费契约，插件系统本身不在范围）。
- 重新设计组件视觉（`ui/` 只做包装与默认值收口，不改外观）。
- 引入新组件库依赖（`ui/` 基于现有 antd / @ant-design/x / @ant-design/icons 包装）。
- ESLint `no-restricted-imports` 强制（本期靠约定 + code review 执行 import 约束，后续可补 lint 规则）。

## 4. 设计要点

### 4.1 Token 模块（`desktop/renderer/src/theme/`）

- `tokens.ts`：唯一数据源，plain TS 对象，分域组织。**token 集合必须覆盖代码库现存的全部设计值字面量（含各插件组件的内联样式），逐值语义命名**，不限于下列示例：
  - `color`：primary / link / textBase / textSecondary / bgLayout / bgPanel / bgPanelSunken / bgActive / shellGradient / handleHover / shadowPanel / shadowMenuItem（初值 = 现状字面量）；
  - 评审补充的必收值：`#e9f7f3`（AI 气泡背景）→ 如 `bgBubbleAi`；`#f2f3f7`（用户气泡背景）→ 如 `bgBubbleUser`；`#eceef4`（分割线）→ 如 `borderSubtle`；`#e4e7f0`（头像底色）→ 如 `bgAvatar`；shell 渐变三色 `#e9ecf6` / `#f4f5fa` / `#eef7f4` → 如 `shellGradientFrom/Via/To`（`shellGradient` 由其组合）；`#ffffff` → `bgPanel`；
  - 组件内联的 radius（8 / 10 / 12）、fontSize（13 / 16）等同样收拢进 `radius` / `font` 域；
  - `font`：family / sizeBase / sizeSmall；
  - `radius`：panel / control / card；
  - `spacing`：shellGap / shellPadding；
  - `layout`：topbarHeight、sidebar / auxiliary 的 default/min/max、resizeHandleSize。
- `cssVariables.ts`：把 token 拍平为 `--ga-<域>-<名>` 形式的 CSS 自定义属性，`applyCssVariables()` 在 `main.tsx` 启动时写入 `:root`（`document.documentElement.style`）。CSS 变量是插件消费的**公开契约**。
- `themeConfig.ts`：antd `ThemeConfig` 改为从 `tokens` 派生（替代现 `theme.ts`，原文件删除）。
- 存量改造（范围 = **所有文件的所有硬编码设计值**，非仅示例）：
  - `index.css` 中所有设计值字面量 → `var(--ga-*)`；
  - `PART_WIDTH_LIMITS` 从 `WorkbenchLayout.tsx` 移入 `tokens.layout`，布局组件改为 import token；
  - 业务组件内联样式全部改消费 CSS 变量或 token import，已盘点（grep 确认）：`SessionContentView`（`#1b1f27` / `#fafbfd`）、`ChatPanelView`（`#1b1f27` / `#2ed3b0` / `#e9f7f3` / `#f2f3f7`）、`SessionListView`（`#2ed3b0` / `#1b1f27` / `#eceef4` / `#e4e7f0` / `#8a8f9c`）、`SessionTopbarRight`（`#2ed3b0`）。
- 测试：token → CSS 变量映射的单元测试；`themeConfig` 派生值的单元测试。

### 4.2 content 分屏

- **布局声明**（`workbench/types.ts`）：

  ```ts
  export type ContentNode = ContentLeaf | ContentSplit
  export interface ContentLeaf { viewId: string }
  export interface ContentSplit {
    direction: 'row' | 'column'        // row = 左右分屏，column = 上下分屏
    children: ContentNode[]
    sizes?: number[]                    // flex-grow 权重，缺省全 1，长度须等于 children
  }
  ```

  `Page.layout.content` 类型由 `{ viewId }` 放宽为 `ContentNode`；现有 `{ viewId }` 写法天然兼容（单叶子）。

- **运行时 service**：新增 `workbench/contentLayoutService.ts` 单例：
  - 页面激活时用 Page 声明初始化该页布局树，为每个 leaf 生成稳定 `leafId`；
  - 布局按 `pageId` 缓存（Map），切走再切回时保留运行时的拆分结果；
  - API：`getLayout()` / `splitLeaf(leafId, direction, viewId)` / `closeLeaf(leafId)` / `setChildSizes(splitId, sizes)`，`onDidChange` Emitter 通知；viewId 必须在 Registry 已注册，否则抛错；
  - `closeLeaf` 收缩兄弟节点；只剩一个 leaf 的 split 自动坍缩；不允许关闭最后一个 leaf。
- **渲染**：新增 `workbench/ContentSplit.tsx`，递归渲染布局树：split → flex 容器（`flex-direction` 按 direction），children 按 `sizes` 分配 `flex-grow`，每个 leaf 有 `min-width`/`min-height`（如 120px）约束；相邻 child 之间插入 divider。`WorkbenchLayout` 的 content Part 改为渲染该组件。
- **拖拽**：扩展 `ResizeHandle` 增加 `orientation: 'horizontal' | 'vertical'` 属性（cursor 与取 clientX / clientY 的轴向），分屏 divider 复用它：拖动时按容器实际像素尺寸把位移换算为相邻两个 child 的 grow 权重调整，并施加最小尺寸 clamp。sidebar / auxiliary 现有调用不受影响。
- **插件入口**：service 以单例形式导出（与 `pageManagerInstance` 同模式），插件 import 后即可在运行时拆分 / 关闭 pane；文档记入 AGENTS.md。

### 4.3 共享组件库（`desktop/renderer/src/ui/`）

- **定位**：项目唯一的组件出口。内置视图与未来插件一律从 `ui/` 导入组件；**只有 `ui/`（及 `main.tsx` 的 ConfigProvider、`theme/` 的 token 派生配置——基础设施层，仅类型消费）允许直接 import `antd` / `@ant-design/x` / `@ant-design/icons`**。
- **内容**（基于现状盘点，只做包装 + 项目默认值，不改视觉）：
  - 基础包装：`Button` / `Typography` / `Avatar` / `Menu` / `Tooltip` / `Card` / `Empty`（薄包装，透出 antd 全部 props，必要时固化项目默认值）；
  - re-export：`@ant-design/x` 的 `Bubble` / `Sender`，icons 统一从 `ui/icons` 出口；
  - 组合组件：`TopbarSearchInput`（顶部导航搜索框，样式消费 token，作为组合组件的示范与插件示例）。
- **视觉一致性机制**：包装组件的默认值从 `themeConfig` / token 取；antd 主题已在 ConfigProvider 层由 token 派生（4.1），因此任何用 `ui/` 组件的插件自动跟随设计基调。

## 5. 验收标准

- [ ] 全部设计值字面量收拢进 `theme/tokens.ts`（grep `#[0-9a-fA-F]{3,8}` / `rgba?(` 在 `desktop/renderer/src` 零命中，`theme/tokens.ts` 及其测试除外；间距、圆角、字号字面量同理）
- [ ] antd 组件视觉零回归（themeConfig 派生值与原 `theme.ts` 等价，有测试保证）
- [ ] 页面可声明嵌套分屏布局并正确渲染；旧 `{ viewId }` 声明不受影响（现有页面零改动）
- [ ] 分屏 divider 可拖拽调节比例，最小尺寸约束生效；sidebar / auxiliary 拖拽无回归
- [ ] `contentLayoutService` 可运行时 splitLeaf / closeLeaf，切页返回后布局保留
- [ ] `npm run test` / `typecheck` / `build` 全绿；新增逻辑均有测试
- [ ] AGENTS.md 更新：token 消费契约 + content 分屏声明 / 运行时 API + 组件库使用契约
- [ ] `ui/` 覆盖现状全部组件用法；src 中对 `antd` / `@ant-design/x` / `@ant-design/icons` 的直接 import 仅存在于 `ui/`、`main.tsx` 与 `theme/`（`theme/` 属基础设施层：token 派生 antd 配置的类型消费，非组件 UI import；grep 验证）

## 6. 变更记录

| 日期 | 变更 |
| --- | --- |
| 2026-07-26 | 初稿 |
| 2026-07-26 | 评审裁决回写：① token 集合须覆盖全部现存字面量（补充气泡背景、分割线、头像底色、渐变三色等必收值）；② 存量改造范围明确为所有文件的全部硬编码设计值，附 grep 盘点清单；③ 验收 grep 改为全量模式 |
| 2026-07-26 | 评审新增目标 4：共享组件库 `ui/`（含 VS Code 对标说明、import 约束、盘点清单），附对应非目标与验收项 |
| 2026-07-26 | 评审裁决：import 约束豁免列表加入 `theme/`（基础设施层，token 派生 antd 配置的类型消费，非组件 UI import），同步修订 4.3 与验收项 |
