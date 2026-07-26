# SDD ledger — plan: docs/feat_2026-07-26_shopify-design-theme-system/PLAN.md

## Step 1.1: complete
- commits: a4cda02..80288c4
- ThemeTokens interface + layout constant + transitional export
- themes/teal.ts with light token set (zero visual regression)
- WorkbenchLayout.tsx → import { layout }
- tokens.test.ts 7/7, themeConfig.test.ts 4/4, typecheck clean
- cssVariables.test.ts 2 failures deferred to Step 1.2 (expected: layout vars + shadow rename)

## Step 1.2: complete
- commits: 9624ff8..a823c9e
- cssVariables.ts: layout constant added, shadow domain string passthrough
- index.css: shadow vars migrated (--ga-color-shadow-* → --ga-shadow-*)
- cssVariables.test.ts: updated for shadow/layout/extended fields
- 116/116 tests passing, typecheck clean

## Step 1.3: complete
- commits: a823c9e..a65d18f
- teal dark token set: deep backgrounds, light text, primary unchanged
- tokens.test.ts: teal dark structure completeness + contrast assertions
- 117/117 tests passing, typecheck clean

## Step 1.4: complete
- commits: a65d18f
- tokens.test.ts: teal light literal assertions preserved + teal dark structure test ✅
- cssVariables.test.ts: variable name format + domain coverage + shadow no-px ✅
- themeConfig.test.ts: existing assertions pass with transitional tokens export; buildThemeConfig() refactor deferred to Step 2.3
- 117/117 tests passing, typecheck clean
