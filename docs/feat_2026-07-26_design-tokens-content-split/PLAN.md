# PLAN — 设计 token 统一管理 + Workbench content 区域分屏布局

对应 SPEC：同目录 SPEC.md。评审通过后按 subagent-driven-development skill 执行。

## Phase 清单

| Phase | 目标 | 预计 Step 数 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| P1 | 设计 token 单一数据源 + 存量改造 | 4 | 无 | pending |
| P2 | content 分屏（声明 / service / 渲染 / 拖拽） | 5 | P1（ResizeHandle 改造基于 token 化的样式） | pending |
| P3 | 共享组件库 `ui/` + 存量迁移 | 4 | P1（组件默认值消费 token；与 P2 无强耦合，排在其后避免双方同改插件文件产生冲突） | pending |

---

## Phase 1 — 设计 token 单一数据源

**准入条件**：SPEC 评审通过。
**完成标准**：SPEC 第 5 条验收的前 2 项达成；test / typecheck / build 全绿；视觉零回归。

| Step | 内容 | 验收 | 状态 |
| --- | --- | --- | --- |
| 1.1 | 新建 `theme/tokens.ts`：按 SPEC 4.1 分域定义全部 token（初值=现状字面量）；新建 `theme/cssVariables.ts`（token 拍平为 `--ga-*` + `applyCssVariables()`） | - [x] 映射单测通过（每个 token 都有对应 CSS 变量，命名符合 `--ga-<域>-<名>`） | done |
| 1.2 | `main.tsx` 启动时调用 `applyCssVariables()`；新建 `theme/themeConfig.ts` 从 tokens 派生 antd 配置，删除旧 `theme.ts` | - [ ] 派生值与原配置逐字段等价的单测通过；typecheck 绿 | pending |
| 1.3 | `index.css` 全部设计值字面量改 `var(--ga-*)`；`PART_WIDTH_LIMITS` 移入 `tokens.layout`，`WorkbenchLayout.tsx` 改 import | - [ ] grep 硬编码色值/间距零命中（token 文件除外）；既有测试全绿 | pending |
| 1.4 | 业务组件内联样式改消费 token，范围=全部已盘点文件：`SessionContentView`、`ChatPanelView`、`SessionListView`、`SessionTopbarRight`（清单见 SPEC 4.1 存量改造）；更新 AGENTS.md「设计 token」章节（消费契约：CSS 变量优先，TS 可 import） | - [ ] 全量 test/typecheck/build 绿；grep `#[0-9a-fA-F]{3,8}` 在 src 零命中（tokens 及测试除外）；commit | pending |

---

## Phase 2 — content 分屏

**准入条件**：Phase 1 完成并验收。
**完成标准**：SPEC 第 5 条验收的第 3–6 项达成。

**已知中间断裂（评审裁决，无需特殊处理）**：Step 2.1 放宽 `Page.layout.content` 类型并调整 `resolvePage` 返回结构后，`WorkbenchLayout.tsx` 中 `resolution.content.view.component` 会编译失败，直到 Step 2.4 接入 `ContentSplit` 才恢复。故 2.1–2.3 期间 typecheck/build 允许红，**绿检查自 Step 2.4 起强制**；2.1–2.3 的验收以各自新增/适配的单测通过为准。

| Step | 内容 | 验收 | 状态 |
| --- | --- | --- | --- |
| 2.1 | `workbench/types.ts`：新增 `ContentLeaf` / `ContentSplit` / `ContentNode`，`Page.layout.content` 放宽为 `ContentNode`；`registry.resolvePage` 适配（content 不再预解析单 view，改为原样传递声明树） | - [ ] 类型单测 + registry 既有测试适配后全绿；旧 `{ viewId }` 声明编译通过 | pending |
| 2.2 | 新建 `workbench/contentLayoutService.ts`：初始化 / 按 pageId 缓存 / `splitLeaf` / `closeLeaf`（含 split 坍缩、禁止关闭最后 leaf）/ `setChildSizes` / `onDidChange`；未注册 viewId 抛错 | - [ ] service 单测覆盖全部 API 与边界（坍缩、缓存保留、错误分支） | pending |
| 2.3 | `ResizeHandle` 增加 `orientation` 属性（horizontal→col-resize/clientX，vertical→row-resize/clientY），现有调用方适配 | - [ ] handle 拖拽测试覆盖两个方向；sidebar / auxiliary 拖拽无回归 | pending |
| 2.4 | 新建 `workbench/ContentSplit.tsx`：递归渲染布局树（flex + sizes 权重 + min 尺寸约束 + divider 拖拽换算权重）；`WorkbenchLayout` content Part 接入 service + ContentSplit | - [ ] 渲染测试：嵌套树正确渲染、divider 拖动后 sizes 更新、min 约束生效 | pending |
| 2.5 | 导出的单例入口（`pageManagerInstance` 同模式）供插件使用；AGENTS.md 更新（分屏声明格式 + 运行时 API）；全量回归 + commit | - [ ] 全量 test/typecheck/build 绿；文档完整 | pending |

---

## Phase 3 — 共享组件库 `ui/`

**准入条件**：Phase 1 完成并验收（组件默认值依赖 token）。
**完成标准**：SPEC 第 5 条验收的最后一项达成；视觉零回归。

| Step | 内容 | 验收 | 状态 |
| --- | --- | --- | --- |
| 3.1 | 新建 `ui/` 目录骨架；基础包装 `Button` / `Typography` / `Avatar` / `Menu` / `Tooltip` / `Card` / `Empty`（透出 antd props）；`ui/icons` 统一 re-export `@ant-design/icons`；re-export `@ant-design/x` 的 `Bubble` / `Sender` | - [ ] 每个出口有渲染测试；typecheck 绿 | pending |
| 3.2 | 组合组件 `TopbarSearchInput`（样式消费 token / CSS 变量） | - [ ] 渲染 + 交互（输入/清空）测试通过 | pending |
| 3.3 | 迁移存量：`sessions` / `chat` / `sessionPage` 插件及 workbench 组件改为从 `ui/` 导入；仅 `ui/`、`main.tsx`、`theme/`（基础设施豁免）保留对 antd 系的直接 import | - [ ] grep 验证 import 约束达成；全量测试绿、视觉零回归 | pending |
| 3.4 | AGENTS.md 更新「组件库」章节（插件优先使用预置组件 + import 约束）；全量回归 + commit | - [ ] 全量 test/typecheck/build 绿；文档完整 | pending |
