# Step 1.1 brief — 引入 vitest 测试框架

## 任务

为项目引入测试框架：`vitest` + `@testing-library/react` + `jsdom`（均为 devDependency），配置 `test` script 与 vitest 配置（renderer 环境）。

## 背景与约束

- 项目根：`/Volumes/DataDrive/proj/my/GraphAgent`，Electron 应用，electron-vite 2.3.0 + Vite 5.4.8 + React 18.3.1 + TypeScript 5.6.3。先读 `package.json`、`electron.vite.config.ts`、`tsconfig.json` 了解现状。
- renderer 代码在 `desktop/renderer/src/`。本 Step 只搭测试设施，不改任何现有源码。
- 全局约束（SPEC 逐字）："新增 `vitest` + `@testing-library/react` + `jsdom`（devDependency）"；"除测试依赖外，不新增任何运行时依赖"。
- vitest 版本需与 Vite 5 兼容（vitest 2.x）。jsdom 环境用于 React 组件测试。
- vitest 配置独立成 `vitest.config.ts`（不与 electron-vite 配置耦合），`environment: 'jsdom'`，include 模式覆盖 `desktop/renderer/src/**/*.test.{ts,tsx}`，需要 `@vitejs/plugin-react` 处理 tsx。
- `package.json` scripts 增加 `"test": "vitest run"`（保留 watch 可用 `vitest`，不必单建 script）。
- 安装依赖用 `npm install -D`（项目用 npm，有 `package-lock.json` 和 `.npmrc`）。

## 验收标准（checkbox）

- [ ] `vitest`、`@testing-library/react`、`jsdom` 出现在 package.json devDependencies，lockfile 已更新
- [ ] 无新增运行时 dependencies
- [ ] `vitest.config.ts` 存在：jsdom 环境、react 插件、include 覆盖 `desktop/renderer/src/**/*.test.{ts,tsx}`
- [ ] `package.json` 有 `test` script
- [ ] 一个 smoke 测试（`desktop/renderer/src/smoke.test.tsx`：用 @testing-library/react 渲染一个临时 trivial 组件并断言文本存在）证明链路工作；该文件是设施验证，允许保留
- [ ] `npm run test` 通过
- [ ] `npm run typecheck` 通过（如 smoke 测试的类型不被现有 tsconfig 覆盖导致报错，调整 tsconfig include 或在 vitest.config 旁加必要类型声明，但不得削弱现有严格度）

## 完成标准之外不要做的

不改 `electron.vite.config.ts`；不加 coverage 配置；不引入 testing-library 的 jest-dom 之外的额外 matcher 库（如需 jest-dom 可装 @testing-library/jest-dom，但 smoke 测试不必用它）。
