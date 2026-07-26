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

### Step 1.4 — complete (commits facff64..88b7eed, review clean)

- pageManager.ts: activePageId / switchPage / clearPage / onDidChangePage
- pageManager.test.ts: 7 tests, zero deps on Registry

### Step 1.5 — complete (commits 88b7eed..a3114cd, review clean)

- pluginHost.ts: activateBuiltin(plugins) — PluginContext 构造、Disposable 聚合、错误隔离、逆序 dispose
- pluginHost.test.ts: 9 tests

### Step 1.6 — complete (commits a3114cd..89fb9c2, review clean)

- useContribution.ts: useObservable hook (useSyncExternalStore wrapper)
- WorkbenchLayout.tsx: 4-Part shell + topbar 3 slots + dual subscription + version-based snapshot
- WorkbenchLayout.test.tsx: 6 rendering tests
- Registry.version: added for snapshot stability

## Phase 1 Summary

**P1 complete**: 52 tests, typecheck clean, zero business imports. All 6 Steps done.

### Step 2.1 — complete (commits 85647f4..25eb234, review clean)

- sessions plugin: SessionListView + sessionStore + Plugin
- SessionListView.test.tsx: 4 tests
- test-setup.ts: matchMedia polyfill + auto-cleanup

### Steps 2.2-2.5 — complete (commits 25eb234..710e5fd, review clean)

- sessionPage plugin: page + topbar 3 slots + content view
- chat plugin: ChatPanelView (auxiliary), reads sessionId from store
- App.tsx: PluginHost + WorkbenchLayout
- Deleted components/ directory
- plugins/index.ts: BUILTIN_PLUGINS list

## Phase 2 Summary

**P2 complete**: 59 tests, typecheck clean, build passes. Old components fully migrated.

### Step 3.1 — complete (commits 710e5fd..7dbbf09, review clean)

- agents plugin: sidebar + content + topbar, no auxiliary
- pageManagerInstance.ts: shared singleton for page switching
- Page switching: SessionListView ↔ AgentsSidebarView (bidirectional)
- Build: electron-vite compiles 3126 modules cleanly

### Steps 3.2-3.3 — complete (regression + docs)

- npm run test: 59 passing
- npm run typecheck: clean
- npm run build: success
- AGENTS.md: architecture documentation
- Archive: docs/ → docs/archive/
