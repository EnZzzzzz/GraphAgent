# SDD ledger — plan: docs/refactor_2026-07-25_workbench-plugin-layout/PLAN.md

分支：refactor/workbench-plugin-layout（base: main c3e0991）
说明：Agent 工具不支持显式指定模型参数，子 Agent 均继承 session 模型。

## Steps

### Step 1.1 — complete (commits c3e0991..ec62659, review clean)

- 验收全部通过：vitest + @testing-library/react + jsdom 已安装，vitest.config.ts 配置正确，smoke 测试通过，typecheck 通过。

### Step 1.2 — complete (commits ec62659..b744110, review clean)

- types.ts: 所有核心类型（PartId/View/ViewContainer/Page/Contribution/Plugin）
- emitter.ts: Disposable + Emitter<T>（7 条约束全部实现）
- emitter.test.ts: 7 tests all pass, typecheck clean, zero business imports

### Step 1.3 — complete (commits b744110..facff64, review clean)

- registry.ts: 单例 Registry（registerContribution/onDidChange/查询/resolvePage）
- registry.test.ts: 22 tests, typecheck clean, zero business imports
