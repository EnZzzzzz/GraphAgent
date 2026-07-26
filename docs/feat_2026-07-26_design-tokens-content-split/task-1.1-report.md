# Task 1.1 Report — theme/tokens.ts + theme/cssVariables.ts

## 实现了什么

- `desktop/renderer/src/theme/tokens.ts`：设计 token 唯一数据源，5 个域（color/font/radius/spacing/layout），初值=现状字面量
- `desktop/renderer/src/theme/cssVariables.ts`：`applyCssVariables()` 将 tokens 拍平为 `--ga-<域>-<kebab名>` CSS 自定义属性写入 `:root`

## 测试结果

```
 ✓ desktop/renderer/src/theme/tokens.test.ts (6 tests)
 ✓ desktop/renderer/src/theme/cssVariables.test.ts (2 tests)
 Test Files  2 passed (2)
      Tests  8 passed (8)
```

全量测试：74/74 passing（11 files），无回归。

## TDD 证据

### RED — 实现前

运行 `npx vitest run desktop/renderer/src/theme/`：
- `tokens.test.ts`：`Failed to resolve import "./tokens"` — 文件不存在，预期失败
- `cssVariables.test.ts`：`Failed to resolve import "./cssVariables"` — 文件不存在，预期失败

这两个失败符合预期：测试引用了尚未创建的文件。

### GREEN — 实现后

运行 `npx vitest run desktop/renderer/src/theme/`：8/8 通过，输出干净无 warning。

## 改动的文件

- `desktop/renderer/src/theme/tokens.ts`（新建）
- `desktop/renderer/src/theme/tokens.test.ts`（新建）
- `desktop/renderer/src/theme/cssVariables.ts`（新建）
- `desktop/renderer/src/theme/cssVariables.test.ts`（新建）

## 自查发现

1. `radius.card` 与 `radius.panel` 均为 16。按 brief 建议未合并——前者供 Card 组件引用，后者供 .panel CSS 类引用，语义不同。
2. `font.sizeMd` / `font.sizeSm` 命名按"比 base（14）的方向"：sm=12（更小），md=15（略大），lg=16（最大）。命名可能不够直观，但 brief 给出了固定清单，照实实现。
3. `applyCssVariables()` 中数值 token（font size、radius、spacing、layout）统一 `String(value)` 转换，CSS 变量存储字符串后使用时需带单位（下游使用时自行拼接单位，这是 CSS 变量的常规做法）。

## 疑虑

无。
