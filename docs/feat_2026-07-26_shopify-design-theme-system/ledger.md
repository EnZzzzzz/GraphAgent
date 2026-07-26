# SDD ledger — plan: docs/feat_2026-07-26_shopify-design-theme-system/PLAN.md

## Step 1.1: complete
- commits: a4cda02..80288c4
- ThemeTokens interface + layout constant + transitional export
- themes/teal.ts with light token set (zero visual regression)
- WorkbenchLayout.tsx → import { layout }
- tokens.test.ts 7/7, themeConfig.test.ts 4/4, typecheck clean
- cssVariables.test.ts 2 failures deferred to Step 1.2 (expected: layout vars + shadow rename)
