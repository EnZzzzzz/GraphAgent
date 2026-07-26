# Task 1.2 Report — applyCssVariables 集成 + themeConfig 派生

## 实现了什么

- `theme/themeConfig.ts`：从 tokens 派生 antd ThemeConfig，逐字段等价旧 `theme.ts`
- `main.tsx`：启动时调用 `applyCssVariables()`，import 路径改为 `./theme/themeConfig`
- 删除 `desktop/renderer/src/theme.ts`

## 测试结果

```
✓ theme/themeConfig.test.ts (4 tests)
✓ theme/tokens.test.ts (6 tests)
✓ theme/cssVariables.test.ts (2 tests)
Test Files  3 passed, Tests  12 passed
```

全量：78/78 passing，typecheck 绿。

## TDD 证据

### RED — 实现前

`npx vitest run desktop/renderer/src/theme/themeConfig.test.ts`：
- `Failed to resolve import "./themeConfig"` — 文件不存在，预期失败

### GREEN — 实现后

运行同命令：4/4 passing。typecheck 修复了 `token` 可选类型断言（`!`）。

## 改动的文件

- `desktop/renderer/src/theme/themeConfig.ts`（新建）
- `desktop/renderer/src/theme/themeConfig.test.ts`（新建）
- `desktop/renderer/src/main.tsx`（修改：add applyCssVariables + import path）
- `desktop/renderer/src/theme.ts`（删除）

## 疑虑

无。
