# PLAN — Shopify 设计语言引入与可切换主题系统

- 对应 SPEC：同目录 `SPEC.md`
- 状态：待评审

## Phase 清单

| Phase | 目标 | 预计 Step 数 | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| P1 | token 模型扩展 + teal 双主题 | 4 | 无 | pending |
| P2 | 主题切换机制（store / 管线 / FOUC / 入口） | 5 | P1 | pending |
| P3 | shopify 主题（token 集 / Inter 字体 / pill） | 5 | P2 | pending |
| P4 | 收尾（AGENTS.md / 全量验证 / 归档） | 2 | P3 | pending |

---

## P1 — token 模型扩展 + teal 双主题

**准入条件**：SPEC 评审通过。
**完成标准**：`ThemeTokens` 类型落地；teal light 视觉零回归（原字面量原样保留）；teal dark token 集定义完成；三个 theme 测试重构为参数化并全绿；`npm run test` / `typecheck` 通过。

### Step 1.1 — ThemeTokens 类型与 teal light 迁移
- 内容：`theme/tokens.ts` 改为导出 `ThemeTokens` 接口 + 跨主题不变的 `layout` 常量；新建 `theme/themes/teal.ts`，`light` 原样迁移现有五域字面量，并按 SPEC 补齐新增字段（spacing 标尺、`radius.pill`、font weight/lineHeight、shade 灰阶、`accent`、shadow 域）。
- **过渡兼容（评审裁定 #1，方案 A）**：`tokens.ts` 在 P1 期间保留 `export const tokens = teal.light`，供 `themeConfig.ts`（2.3 才改）与 `cssVariables.ts`（1.2/2.2 改）继续编译；`WorkbenchLayout.tsx` 只消费 `tokens.layout.*`，本 Step 内同步改为 `import { layout } from '../theme/tokens'`；过渡导出在 Step 2.3 移除。
- 交付物：`tokens.ts`、`themes/teal.ts`（light 部分）、`WorkbenchLayout.tsx` import 修改。
- 验收：
  - [x] teal light 的所有原有 token 值与迁移前逐一相等（零回归）
  - [x] 新增域/字段类型完整，`npm run typecheck` 通过（无悬挂 import）
- 预估：15min | 依赖：无 | 状态：done

### Step 1.2 — shadow 域迁移与 index.css 改造
- 内容：`color.shadowPanel`/`shadowMenuItem` 迁入 `shadow` 域（值变为完整 box-shadow 字符串）；`cssVariables.ts` 支持 shadow 域（字符串原样、不加 px）；`index.css` 的 `box-shadow: 0 4px 24px var(--ga-color-shadow-panel)` 等改为 `box-shadow: var(--ga-shadow-panel)`。
- 交付物：`cssVariables.ts`、`index.css`、teal.ts 的 shadow 域。
- 验收：
  - [x] index.css 中不再引用 `--ga-color-shadow-*`
  - [x] 渲染阴影视觉与迁移前一致（走查 sidebar 面板/菜单项）
- 预估：15min | 依赖：1.1 | 状态：done

### Step 1.3 — teal dark token 集
- 内容：定义 teal dark：`primary`/`link` 保持 `#2ed3b0`/`#12a98c`；背景 `bgLayout`/`bgPanel`/`bgPanelSunken` 深色化（如 `#16181d`/`#1e2128`/`#191b21`，以走查微调）；文字/边框/气泡/头像/渐变三色/阴影按暗色映射。
- 交付物：`themes/teal.ts` 的 `dark`。
- 验收：
  - [x] ThemeTokens 全字段有值，无遗漏
  - [x] 文字与背景对比度目测可读（走查记录于 ledger）
- 预估：15min | 依赖：1.1 | 状态：done

### Step 1.4 — 三个 theme 测试参数化重构
- 内容：`tokens.test.ts` → teal light 保留原字面量断言 + teal dark 结构完整性断言；`themeConfig.test.ts` → 改为断言 `buildThemeConfig(themes.teal.light, 'light')` 派生值；`cssVariables.test.ts` → 断言对任意 token 集的变量名格式、域覆盖、shadow 不加 px。
- 交付物：三个测试文件。
- 验收：
  - [x] `npm run test` 全绿
  - [x] teal light 的原字面量断言全部保留（防回归）
- 预估：15min | 依赖：1.2、1.3 | 状态：done

---

## P2 — 主题切换机制

**准入条件**：P1 完成。
**完成标准**：运行时可在 teal light/dark 间切换并持久化；刷新后主题恢复且无闪白；ConfigProvider 受控化；topbar 有切换入口；themeStore 测试通过。

### Step 2.1 — themeStore
- 内容：`theme/themeStore.ts`（emitter 模式，仿 `pageManager.ts`）：`getTheme()`/`setTheme(themeId, mode)`/`onDidChange`；localStorage 持久化（key `ga-theme`）；mode 缺省跟随 `prefers-color-scheme`。
- 交付物：`themeStore.ts` + 单测。
- 验收：
  - [ ] setTheme 触发订阅通知；刷新后从 localStorage 恢复
  - [ ] 无存储记录时 mode = 系统偏好
- 预估：15min | 依赖：P1 | 状态：pending

### Step 2.2 — applyCssVariables 参数化
- 内容：`applyCssVariables(tokens)` 接收 token 集；提供 `applyCurrentTheme()` 从 store 取当前 token 集重放；`main.tsx` 改为启动时 `applyCurrentTheme()`。
- 交付物：`cssVariables.ts`、`main.tsx`。
- 验收：
  - [ ] 切换主题后 `:root` 变量全量更新（DevTools 验证）
  - [ ] 112 处 CSS 变量消费者无改动、显示正确
- 预估：10min | 依赖：2.1 | 状态：pending

### Step 2.3 — ConfigProvider 受控化
- 内容：`themeConfig.ts` 改为 `buildThemeConfig(tokens, mode, themeId)`（dark 叠加 `theme.darkAlgorithm`；`themeId` 为评审裁定 #2 方案 A，供 3.4 按主题输出组件覆盖）；新建 `ThemeProvider` 组件（订阅 themeStore，useMemo 算 config，渲染 ConfigProvider）；`main.tsx` 用 ThemeProvider 包住 App。**同步移除 1.1 的过渡导出 `tokens`**，确认无残留消费方。
- 交付物：`themeConfig.ts`、`ThemeProvider.tsx`、`main.tsx`、`tokens.ts` 清理。
- 验收：
  - [ ] 切换 light/dark 时 antd 组件（Menu/Button/Card/Bubble）随动
  - [ ] `npm run test` 全绿（含 1.4 重构后的 themeConfig 测试）
- 预估：15min | 依赖：2.2 | 状态：pending

### Step 2.4 — index.html FOUC 恢复脚本
- 内容：`desktop/renderer/index.html` `<head>` 内联脚本：读 `ga-theme`，写 `<html data-theme data-mode>` 并预设 `background`；`index.css` 让 `body` 背景跟随 token。
- 交付物：`index.html`、`index.css`。
- 验收：
  - [ ] dark 模式下刷新无白闪（慢放/多次刷新走查）
- 预估：10min | 依赖：2.2 | 状态：pending

### Step 2.5 — 主题切换入口（topbar 右侧）
- 内容：topbar 右侧 slot 增加切换控件（主题下拉 + 明暗 toggle，或一个四选一下拉）；由 sessionPage 插件或新建微插件贡献；消费 `themeStore`。
- 交付物：控件组件 + 插件注册。
- 验收：
  - [ ] 界面可完成 theme × mode 四种组合切换，即时生效
  - [ ] 控件本身样式消费 `--ga-*` 变量
- 预估：15min | 依赖：2.3 | 状态：pending

---

## P3 — shopify 主题

**准入条件**：P2 完成（切换机制可用，teal 双模式可切）。
**完成标准**：shopify light/dark 可选且视觉符合 DESIGN.md 浅色交易轨/canvas-night 轨；Inter 字体离线生效；全部按钮 pill；走查记录入 ledger。

### Step 3.1 — shopify light token 集
- 内容：按 DESIGN.md 浅色交易轨定义：`bgPanel #ffffff`、`bgLayout #fbfbf5`(cream)、`textBase #000000`(ink)、shade 灰阶、`borderSubtle #e4e4e7`、`accent #c1fbd4`(aloe)、`primary #000000`（黑主按钮）、阴影 = Level 3 多层小阴影堆叠；spacing/font/radius 按 DESIGN.md 标尺。
- 交付物：`themes/shopify.ts` 的 `light`。
- 验收：
  - [ ] 关键值与 DESIGN.md 一致（颜色逐个对照）
  - [ ] tokens 测试新增 shopify light 断言并全绿
- 预估：15min | 依赖：P2 | 状态：pending

### Step 3.2 — shopify dark token 集
- 内容：canvas-night 轨：`bgLayout #000000`、`bgPanel #0a0a0a`、`textBase #ffffff`、`surface-elevated #1e2c31`、阴影 = Level 1 inset 顶边高光（无 drop shadow）；不用 aloe/pistachio（DESIGN.md 禁令：绿色不上暗轨）。
- 交付物：`themes/shopify.ts` 的 `dark`。
- 验收：
  - [ ] 关键值与 DESIGN.md 一致；暗轨无绿色强调
  - [ ] tokens 测试断言全绿
- 预估：15min | 依赖：3.1 | 状态：pending

### Step 3.3 — Inter Variable 字体打包
- 内容：安装 npm 包 `@fontsource-variable/inter`（评审裁定 #3：vite 构建自动打包 woff2，Electron 离线可用；仅引入 latin 所需 CSS 入口以控制体积）；`index.css` 添加 `@font-face`/import；shopify 主题 `font.family` 指向 Inter；shopify 主题下全局 `font-feature-settings: "ss03"`（按 `data-theme` 选择器挂载）。
- 交付物：`package.json` 依赖、`index.css`、shopify.ts font 域。
- 验收：
  - [ ] 断网/打包后字体仍生效（`npm run build` 产物包含 woff2）
  - [ ] DevTools 确认 shopify 主题正文渲染为 Inter
- 预估：15min | 依赖：3.1 | 状态：pending

### Step 3.4 — pill 按钮与组件级覆盖
- 内容：`buildThemeConfig` 凭 `themeId` 输出 per-theme 组件覆盖（评审裁定 #2）：shopify 主题 `Button.borderRadius = 999`（全按钮 pill）、`Card.borderRadiusLG = 12`、输入框 8px；teal 主题保持现状值。走查 Menu 选中态、Bubble、Sender 在 shopify 双模式下的表现，必要时补 token。
- 交付物：`themeConfig.ts`、可能的 token 增补。
- 验收：
  - [ ] shopify 主题下所有 Button 为胶囊形；teal 主题按钮形状不变
  - [ ] themeConfig 测试覆盖两主题差异断言
- 预估：15min | 依赖：3.1、3.2 | 状态：pending

### Step 3.5 — 四组合视觉走查
- 内容：`npm run dev` 下逐一切换 teal light / teal dark / shopify light / shopify dark，走查 sidebar、topbar、会话页、chat 面板、分屏、ResizeHandle；截图存档至 ledger；发现的问题能当场修则修，超出范围按 issue-create 开 issue。
- 交付物：走查记录（ledger.md）。
- 验收：
  - [ ] 四组合均无破版、无不可读文字、无未跟随主题的残留色
- 预估：15min | 依赖：3.3、3.4 | 状态：pending

---

## P4 — 收尾

**准入条件**：P3 完成。
**完成标准**：文档与代码一致；全量验证通过；目录归档。

### Step 4.1 — 更新 AGENTS.md
- 内容：更新"设计 Token"一节（新域、ThemeTokens、多主题结构、themeStore 用法、新增主题的方法）；更新 ui/ 相关描述（如需）。
- 交付物：`AGENTS.md`。
- 验收：
  - [ ] AGENTS.md 描述与代码实际结构一致
- 预估：10min | 依赖：P3 | 状态：pending

### Step 4.2 — 全量验证与归档
- 内容：`npm run test`、`npm run typecheck`、`npm run build` 全过；ledger.md 补全；本目录移至 `docs/archive/`。
- 交付物：归档目录。
- 验收：
  - [ ] 三条命令全绿
  - [ ] `docs/` 下无本 feature 残留目录
- 预估：10min | 依赖：4.1 | 状态：pending
