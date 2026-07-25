# SDD ledger — plan: docs/refactor_2026-07-25_workbench-plugin-layout/PLAN.md

分支：refactor/workbench-plugin-layout（base: main c3e0991）
说明：Agent 工具不支持显式指定模型参数，子 Agent 均继承 session 模型。

## Steps

### Step 1.1 — complete (commits c3e0991..<pending>)

- 验收全部通过：vitest + @testing-library/react + jsdom 已安装，vitest.config.ts 配置正确，smoke 测试通过，typecheck 通过。
