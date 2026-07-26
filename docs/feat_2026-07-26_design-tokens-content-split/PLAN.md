# PLAN — 设计 token 统一管理 + Workbench content 区域分屏布局

对应 SPEC：同目录 SPEC.md。评审通过后按 subagent-driven-development skill 执行。

## Phase 清单

| Phase | 目标 | 预计 Step 数 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| P1 | 设计 token 单一数据源 + 存量改造 | 4 | 无 | done |
| P2 | content 分屏（声明 / service / 渲染 / 拖拽） | 5 | P1 | done |
| P3 | 共享组件库 `ui/` + 存量迁移 | 4 | P1 | done |

---

## Phase 1 — 设计 token 单一数据源

**准入条件**：SPEC 评审通过。
**完成标准**：SPEC 第 5 条验收的前 2 项达成；test / typecheck / build 全绿；视觉零回归。

| Step | 内容 | 验收 | 状态 |
| --- | --- | --- | --- |
| 1.1 | 新建 `theme/tokens.ts`：按 SPEC 4.1 分域定义全部 token（初值=现状字面量）；新建 `theme/cssVariables.ts`（token 拍平为 `--ga-*` + `applyCssVariables()`） | - [x] 映射单测通过（每个 token 都有对应 CSS 变量，命名符合 `--ga-<域>-<名>`） | done |
| 1.2 | `main.tsx` 启动时调用 `applyCssVariables()`；新建 `theme/themeConfig.ts` 从 tokens 派生 antd 配置，删除旧 `theme.ts` | - [x] 派生值与原配置逐字段等价的单测通过；typecheck 绿 | done |
| 1.3 | `index.css` 全部设计值字面量改 `var(--ga-*)`；`PART_WIDTH_LIMITS` 移入 `tokens.layout`，`WorkbenchLayout.tsx` 改 import | - [x] grep 硬编码色值/间距零命中（token 文件除外）；既有测试全绿 | done |
| 1.4 | `SessionContentView`、`ChatPanelView`、`SessionListView`、`SessionTopbarRight` 内联样式 → CSS 变量；AGENTS.md 添加「设计 token」章节 | - [x] 全量 test/typecheck/build 绿；grep 零命中 | done |

---

## Phase 2 — content 分屏

**准入条件**：Phase 1 完成并验收。
**完成标准**：SPEC 第 5 条验收的第 3–6 项达成。

**已知中间断裂（评审裁决，无需特殊处理）**：Step 2.1 放宽 `Page.layout.content` 类型并调整 `resolvePage` 返回结构后，`WorkbenchLayout.tsx` 中 `resolution.content.view.component` 会编译失败，直到 Step 2.4 接入 `ContentSplit` 才恢复。故 2.1–2.3 期间 typecheck/build 允许红，**绿检查自 Step 2.4 起强制**；2.1–2.3 的验收以各自新增/适配的单测通过为准。

| Step | 内容 | 验收 | 状态 |
| --- | --- | --- | --- |
| 2.1 | `workbench/types.ts`：新增 `ContentLeaf` / `ContentSplit` / `ContentNode`，`Page.layout.content` → `ContentNode`；`registry.resolvePage` content 原样传递 | - [x] 类型单测 4/4 + registry 既有 22/22 全绿；旧 `{ viewId }` 声明编译通过 | done |
| 2.2 | `contentLayoutService.ts`：全 API + 缓存 + 坍缩 + 边界 | - [x] 11/11 单测全绿 | done |
| 2.3 | `ResizeHandle` 增加 `orientation` 属性 | - [x] 7/7 测试全绿 | done |
| 2.4 | `ContentSplit.tsx` + `WorkbenchLayout` 接入 service | - [x] 96/96 全量 test + typecheck 绿 | done |
| 2.5 | 单例入口 + AGENTS.md 分屏文档 | - [x] 96/96 全量 test/typecheck 绿 | done |

---

## Phase 3 — 共享组件库 `ui/`

**准入条件**：Phase 1 完成并验收（组件默认值依赖 token）。
**完成标准**：SPEC 第 5 条验收的最后一项达成；视觉零回归。

| Step | 内容 | 验收 | 状态 |
| --- | --- | --- | --- |
| 3.1 | `ui/` 骨架：Button Typography Avatar Menu Tooltip Card Empty + icons + Bubble/Sender | - [x] 8/8 渲染测试；typecheck 绿 | done |
| 3.2 | `TopbarSearchInput` 组合组件 | - [x] 5/5 交互测试通过 | done |
| 3.3 | 存量迁移：插件 → `ui/` 导入 + import 约束 grep 验证 | - [x] 109/109 测试绿；grep 零违规 | done |
| 3.4 | AGENTS.md 组件库章节 | - [x] 文档完整；全量 test/typecheck 绿 | done |
