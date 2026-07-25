# PLAN — Workbench 插件化布局架构重构

对应 SPEC：`docs/refactor_2026-07-25_workbench-plugin-layout/SPEC.md`
日期：2026-07-25
状态：待评审

## Phase 清单

| Phase | 目标 | 预计 Step 数 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| P1 | Workbench 核心框架（类型 / Emitter / Registry / PageManager / PluginHost / 布局壳） | 6 | — | done |
| P2 | 现有 4 个区域迁移为内置插件，行为零回归 | 5 | P1 | pending |
| P3 | 示例第二页面验证「不同页面不同区域内容」+ 收尾 | 3 | P2 | pending |

---

## P1 — Workbench 核心框架

**准入条件**：SPEC 评审通过。
**完成标准**：`workbench/` 模块独立成立、不 import 任何业务代码；registry / pageManager / emitter 有单测且全绿；`npm run typecheck` 通过。

| Step | 内容 | 预估 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| 1.1 | 引入 vitest + @testing-library/react + jsdom，配置 `test` script 与 vitest 配置（renderer 环境） | 15min | — | done |
| 1.2 | `workbench/types.ts` + `workbench/emitter.ts`：PartId / View / ViewContainer / Page / Contribution / Plugin 类型；Emitter + Disposable，含单测 | 15min | 1.1 | done |
| 1.3 | `workbench/registry.ts`：registerContribution / onDidChange / 按 point + pageId 解析查询，含单测 | 20min | 1.2 | done |
| 1.4 | `workbench/pageManager.ts`：activePage 状态、switchPage、onDidChangePage，含单测 | 10min | 1.3 | done |
| 1.5 | `workbench/pluginHost.ts`：activateBuiltin(plugins) 统一 activate、Disposable 聚合，含单测 | 10min | 1.3 | done |
| 1.6 | `workbench/WorkbenchLayout.tsx` + `useContribution.ts`：4 Part slot 布局壳，渲染当前 page 解析结果（空数据时渲染空壳），含关键渲染测试 | 20min | 1.4 | done |

## P2 — 内置插件迁移

**准入条件**：P1 完成标准达成。
**完成标准**：现有 demo 全部行为（会话列表、会话切换、topbar 静态内容、ChatPanel mock 流式）由插件贡献实现且视觉/交互零回归；`App.tsx` 瘦身为 activate + `<WorkbenchLayout/>`；全量测试 + typecheck 通过。

| Step | 内容 | 预估 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| 2.1 | sessions 插件：sidebar ViewContainer「会话」+ 会话列表 view（迁移现 Sidebar，数据源 `mock.ts`），含测试 | 20min | P1 | pending |
| 2.2 | sessionPage 插件（上）：注册 session page + topbar left/center/right 三段贡献（迁移现 Topbar），含测试 | 20min | 2.1 | pending |
| 2.3 | sessionPage 插件（下）：content 主视图（迁移现 ContentArea） | 10min | 2.2 | pending |
| 2.4 | chat 插件：auxiliary 右侧面板（迁移现 ChatPanel，含 mock 流式、按 session 分桶），含测试 | 20min | 2.1 | pending |
| 2.5 | 收尾清理：`App.tsx` 瘦身、布局 CSS 从 `index.css` 迁入 workbench、删除 `components/` 旧文件，人工跑 `npm run dev` 验证视觉一致 | 15min | 2.2, 2.3, 2.4 | pending |

## P3 — 多页面验证与收尾

**准入条件**：P2 完成标准达成。
**完成标准**：agents 示例页面可切换，其 sidebar / topbar / content 与 session 页不同（auxiliary 不渲染）；全部测试、typecheck 通过；`ledger.md` 完整。

| Step | 内容 | 预估 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| 3.1 | agents 示例插件：注册 agents page + 各自的 sidebar view / topbar 贡献 / content view（简单占位内容），sidebar 增加页面切换入口，含测试 | 20min | P2 | pending |
| 3.2 | 全量回归：`npm run test`、`npm run typecheck`、`npm run dev` 人工验证两页面切换与各区域差异 | 15min | 3.1 | pending |
| 3.3 | 文档收尾：在项目根新增/更新 `AGENTS.md` 记录 workbench 架构与内置插件编写方式；归档准备 | 10min | 3.2 | pending |

## 执行约定

- 执行阶段遵循 subagent-driven-development skill：逐 Step 派发 implementer 子 Agent（遵守 TDD），每 Step 双重 review，5 轮熔断，ledger.md 记录执行细节。
- Step checkbox 只有验收通过后才标记 `done`，并随代码 commit。
