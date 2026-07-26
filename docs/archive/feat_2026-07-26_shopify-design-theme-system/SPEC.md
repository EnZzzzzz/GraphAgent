# SPEC — Shopify 设计语言引入与可切换主题系统

- 日期：2026-07-26
- 状态：待评审
- 设计依据：[Shopify DESIGN.md](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/shopify/DESIGN.md)（副本存于本目录 `DESIGN.shopify.md`）

## 背景

上一个 feature（`design-tokens-content-split`）已完成 token 单源化：`theme/tokens.ts` 唯一数据源 + `--ga-*` CSS 变量注入 + antd `themeConfig` 派生三层架构，且其 SPEC 明确将"暗色主题 / 多主题切换"列为非目标并为此留好结构位置。本 feature 是它的直接后续。

用户希望引入 Shopify DESIGN.md 的设计语言改善界面美观度。经分析，该文件描述的是**营销网站**设计语言（双轨画布、全出血摄影、96px 细体大标题），约一半内容在桌面工作台无落点；真正可迁移的是其设计 DNA：shade 灰阶、通用 spacing 标尺、阴影层级、pill 按钮、Inter 字体、mint 强调色、以及 `canvas-night` 深色轨对应的暗色模式。

## 目标

1. **可切换主题系统**：支持多套品牌主题，每套含 light / dark 双模式，运行时可切换并持久化。
2. **两套主题**：
   - `teal`：现有主题，light 模式**零视觉回归**；新增 dark 模式。
   - `shopify`：按 DESIGN.md 浅色交易轨（light）与 canvas-night 轨（dark）设计的新主题。
3. **token 模型扩展**：补齐 DESIGN.md 有而现有模型缺的结构——通用 spacing 标尺、font 字重/行高、独立 shadow 域、shade 灰阶、`radius.pill`。
4. **Inter Variable 字体打包**：woff2 随应用分发（Electron 离线可用），供 shopify 主题使用。
5. **pill 按钮**：shopify 主题下全部按钮为胶囊形（`borderRadius: 999`）。

## 非目标

- DESIGN.md 的营销站专属内容：cinematic 摄影、display 96px 排版、footer/pricing 卡片、响应式断点（桌面 App 定宽窗口，无落点）。
- teal 主题的任何视觉变更（含按钮形状——pill 仅是 shopify 主题特征；teal 保持现状）。
- 组件包装层改造（`ui/Button` 等维持 re-export，形状差异走 `themeConfig.components` per-theme 覆盖）。
- 组件内散落 px 间距的全面 token 化（约 20 处，见摸底报告；仅在新主题暴露问题时个别处理，不做专项清理）。
- Neue Haas Grotesk（商业字体）不引入；display 场景用 Inter Display / Inter Variable 替代。

## 设计要点

### 主题模型

两维：`ThemeId = 'teal' | 'shopify'` × `ThemeMode = 'light' | 'dark'`，共 4 个 token 集。

```
theme/
├── tokens.ts          # ThemeTokens 类型定义（五域扩展后）+ 布局等跨主题不变量
├── themes/
│   ├── teal.ts        # { light, dark }: ThemeTokens
│   └── shopify.ts     # { light, dark }: ThemeTokens
├── themeStore.ts      # 当前主题 state（emitter 模式，同 pageManager/sessionStore）
├── themeConfig.ts     # buildThemeConfig(tokens, mode, themeId): ThemeConfig
└── cssVariables.ts    # applyCssVariables(tokens)
```

### token 域扩展（ThemeTokens）

- `color`：保留现有语义槽位（`primary`/`textBase`/`bgPanel`/...），新增 shade 灰阶（`shade30`~`shade70`）与 `accent`（shopify = aloe mint `#c1fbd4`，teal = 现有 `bgActive` 系）。
- `font`：新增 `weightRegular`/`weightMedium`/`weightStrong`、`lineHeightBase`；`family` 按主题区分（teal = 现有系统栈；shopify = Inter Variable 优先）。
- `radius`：新增 `pill: 999`。
- `spacing`：新增通用标尺 `xxs:2, xs:4, sm:8, md:12, lg:16, xl:24, xxl:32, huge:64`；保留 `shellGap`/`shellPadding`。
- `shadow`：**独立成域**，值为完整 box-shadow 字符串（含几何），如 `--ga-shadow-panel: 0 4px 24px rgba(...)`。现有 `color.shadowPanel`/`shadowMenuItem`（仅 rgba 颜色）迁入此域，`index.css` 改为消费完整阴影变量——这使阴影几何也能随主题变化（Shopify 光轨用多层小阴影堆叠，暗轨用 inset 顶边高光）。
- `layout`：不变，跨主题同值。

CSS 变量契约不变：`--ga-<域>-<kebab名>`；`shadow` 域不加 px（字符串原样）。

### 切换管线

1. `themeStore`：`{ themeId, mode }` + `setTheme()` + `onDidChange`，localStorage 持久化（key：`ga-theme`）。模式默认值跟随 `prefers-color-scheme`。
2. 切换时：`applyCssVariables(当前token集)` 重放 `:root` 变量（112 处 CSS 变量消费者零改动）；React 侧通过订阅 store 重算 `buildThemeConfig(tokens, mode, themeId)` 传给 ConfigProvider（dark 模式叠加 `theme.darkAlgorithm`）。
3. **FOUC 防护**：`index.html` 内联小脚本，在 React 加载前读 localStorage，向 `<html>` 写 `data-theme`/`data-mode` 并设置背景色，避免暗模式首屏闪白。
4. **切换入口**：topbar 右侧 slot 加主题切换控件（主题 + 明暗），由一个小插件或 sessionPage 插件贡献。

### shopify 主题取值（摘选自 DESIGN.md）

- light：`canvas-light #ffffff` / `canvas-cream #fbfbf5` 底，`ink #000000` 文字，shade 灰阶，`hairline-light #e4e4e7` 边框，accent = `aloe-10 #c1fbd4`，主按钮黑底白字 pill，阴影用 Level 3 多层小阴影堆叠。
- dark：`canvas-night #000000` / `canvas-night-elevated #0a0a0a` 底，`on-primary #ffffff` 文字，`surface-elevated-dark #1e2c31`，阴影用 Level 1 inset 顶边高光，不用 drop shadow。
- 按钮一律 `rounded.pill`；输入框 `rounded.md (8px)`；卡片 `rounded.lg (12px)`。
- 字体：Inter Variable（body 420 / strong 550 / caption 500），全局 `font-feature-settings: "ss03"`。

### teal dark 取值

无外部依据，按语义槽位从 teal light 反推：保持 `primary #2ed3b0` 不变，背景/面板/文字/边框按常规暗色映射（深色底、浅色文字、降低阴影透明度）。具体值在 PLAN Step 中列出，验收以视觉走查为准。

### 测试重构（硬前置）

现有三个 theme 测试断言 teal 字面量，主题参数化后必须重构：

- `tokens.test.ts` → 按主题×模式分别断言关键值（teal light 保持原字面量回归；shopify light/dark 断言 DESIGN.md 值；teal dark 断言结构完整 + 对比度常识）。
- `themeConfig.test.ts` → 断言 `buildThemeConfig` 对两主题×两模式的派生正确性。
- `cssVariables.test.ts` → 断言 `applyCssVariables(任意token集)` 变量名格式 + 域覆盖 + shadow 域不加 px。
- 新增 `themeStore` 测试（持久化、切换通知）。

## 风险

- **antd 组件在 dark 下的覆盖不全**：Menu/Button/Card 已有 per-theme 覆盖，dark 叠加 darkAlgorithm 后需走查；Bubble/Sender（@ant-design/x）跟随 ConfigProvider，气泡底色已是 token，预期无碍。
- **shell 渐变背景**：`index.css` 的 `linear-gradient(135deg, 三色变量)` 结构固定；dark 模式下渐变三色换值即可，shopify 若需纯色底可将渐变起止色设为同值，不改 CSS 结构。
- **字体体积**：Inter Variable 通过 npm 包 `@fontsource-variable/inter` 引入（评审裁定 #3），vite 自动打包 woff2；仅引入所需字重/子集入口控制体积（约 300–800KB 量级）。
