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

## Step 2.1: complete
- commits: a65d18f..29c44da
- themeStore.ts: ThemeStore class with emitter pattern + localStorage persistence
- themeStore.test.ts: 9 tests (persistence, notification, corruption, singleton)
- 126/126 tests passing, typecheck clean

## Step 2.2: complete
- commits: 29c44da..12becba
- applyCssVariables(tokens: ThemeTokens) parameterized
- applyCurrentTheme() reads themeStore + resolves tokens
- resolveTokens() maps (themeId, mode) → ThemeTokens
- main.tsx uses applyCurrentTheme()
- cssVariables.test.ts: parameterized tests + dark token set verification
- 127/127 tests passing, typecheck clean

## Step 2.3: complete
- commits: 12becba..d28d25a
- buildThemeConfig(tokens, mode, themeId) with darkAlgorithm for dark
- ThemeProvider.tsx: useSyncExternalStore + useMemo config + ConfigProvider
- main.tsx: ThemeProvider wrapping App
- tokens.ts: transitional export removed; all consumers migrated
- themeConfig.test.ts: buildThemeConfig + darkAlgorithm tests
- 129/129 tests passing, typecheck clean

## Step 2.4: complete
- commits: d28d25a..076bb14
- index.html: FOUC inline script (data-theme/data-mode + dark bg)
- index.css: body bg = var(--ga-color-bg-layout); [data-mode='dark'] fallback

## Step 2.5: complete
- commits: d28d25a..076bb14
- ThemeSwitcher.tsx: cycles 4 theme×mode combos in topbar right
- ui/icons: BgColorsOutlined added
- 129/129 tests passing, typecheck clean
