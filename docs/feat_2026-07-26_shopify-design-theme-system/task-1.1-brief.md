# Step 1.1 — ThemeTokens 类型与 teal light 迁移

## 在项目中的位置

Phase 1 / Step 1，是主题系统的基础设施。建立 `ThemeTokens` 类型、`layout` 跨主题常量，把现有 token 字面量迁入 `teal.light` 主题。后续 Step 将依赖这个类型和文件结构。

## 任务

### 1. `desktop/renderer/src/theme/tokens.ts` — 重构为类型定义 + layout 常量 + 过渡导出

当前内容：一个 `tokens` 对象，`as const`，五域。改为：

```ts
// ThemeTokens — 五域（扩展后）的类型定义
export interface ThemeTokens {
  color: { ... }      // 见下方字段清单
  font: { ... }
  radius: { ... }
  spacing: { ... }
  shadow: { ... }     // 新域：完整 box-shadow 字符串
}

// layout — 跨主题不变量（独立常量）
export const layout = { ... }  // 原 tokens.layout，值不变

// 过渡兼容（P1 期间保留，Step 2.3 移除）
import { teal } from './themes/teal'
export const tokens = teal.light
```

### 2. Color 域字段（ThemeTokens.color）

保留所有现有字段，**移除** `shadowPanel` / `shadowMenuItem`（已迁入 shadow 域），新增：

```
shade30: string
shade40: string
shade50: string
shade60: string
shade70: string
accent: string
```

### 3. Font 域字段（ThemeTokens.font）

保留现有字段，新增：

```
weightRegular: 400 | number
weightMedium: 500 | number
weightStrong: 600 | number  (或 550 for shopify)
lineHeightBase: number
```

### 4. Radius 域字段（ThemeTokens.radius）

保留现有字段，新增：

```
pill: number
```

### 5. Spacing 域字段（ThemeTokens.spacing）

保留现有 `shellGap`、`shellPadding`，新增通用间距标尺：

```
xxs: number
xs: number
sm: number
md: number
lg: number
xl: number
xxl: number
huge: number
```

### 6. Shadow 域（ThemeTokens.shadow）— 新域

```
panel: string        // 完整 box-shadow 字符串（含几何 + rgba）
menuItem: string     // 完整 box-shadow 字符串
```

### 7. `desktop/renderer/src/theme/themes/teal.ts` — 新建

```ts
import type { ThemeTokens } from '../tokens'

export const teal: { light: ThemeTokens; dark: ThemeTokens } = {
  light: { ... },  // 本 Step 完成（见下方值清单）
  dark: { ... }    // 留空占位（Step 1.3 定义；本 Step 用 `{} as ThemeTokens` 占位以保证编译通过）
}
```

### 8. teal light 值清单

**color**（原样迁移现有值，新增 shade/accent）：
```
primary: '#2ed3b0'
link: '#12a98c'
textBase: '#1b1f27'
textSecondary: '#8a8f9c'
bgLayout: '#eef0f7'
bgPanel: '#ffffff'
bgPanelSunken: '#fafbfd'
bgActive: '#e4f7f1'
shellGradientFrom: '#e9ecf6'
shellGradientVia: '#f4f5fa'
shellGradientTo: '#eef7f4'
handleHover: 'rgba(46, 211, 176, 0.25)'
bgBubbleAi: '#e9f7f3'
bgBubbleUser: '#f2f3f7'
borderSubtle: '#eceef4'
bgAvatar: '#e4e7f0'
// 新增：
shade30: '#d4d4d8'
shade40: '#a1a1aa'
shade50: '#71717a'
shade60: '#52525b'
shade70: '#3f3f46'
accent: '#e4f7f1'  // = 现有 bgActive（teal 无独立 accent，用 bgActive 系填充）
```

**font**（保留现有 + 新增）：
```
family: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif"
sizeBase: 14
sizeSmall: 13
sizeSm: 12
sizeMd: 15
sizeLg: 16
// 新增：
weightRegular: 400
weightMedium: 500
weightStrong: 600
lineHeightBase: 1.5
```

**radius**（保留现有 + 新增 pill）：
```
panel: 16
control: 10
card: 16
avatar: 8
message: 12
handle: 5
pill: 999
```

**spacing**（保留现有 + 新增通用标尺）：
```
shellGap: 12
shellPadding: 12
xxs: 2
xs: 4
sm: 8
md: 12
lg: 16
xl: 24
xxl: 32
huge: 64
```

**shadow**（新域，完整 box-shadow 字符串——几何从 index.css 提取）：
```
panel: '0 4px 24px rgba(30, 40, 80, 0.06)'
menuItem: '0 2px 10px rgba(30, 40, 80, 0.08)'
```

teal dark 占位：
```ts
dark: {} as ThemeTokens
```

### 9. `desktop/renderer/src/workbench/WorkbenchLayout.tsx` — 修改 import

当前：
```ts
import { tokens } from '../theme/tokens'
```
改为：
```ts
import { layout } from '../theme/tokens'
```

并将所有 `tokens.layout.xxx` 改为 `layout.xxx`（共 6 处引用：sidebarDefault、auxiliaryDefault、sidebarMin、sidebarMax、auxiliaryMin、auxiliaryMax）。

## 验收标准

- [ ] `ThemeTokens` 类型包含所有五域 + 扩展字段，`npm run typecheck` 通过
- [ ] teal.light 的所有原有 token 值与迁移前逐一相等（零回归——逐值与现有 `tokens.test.ts` 断言比较；shadow 值虽变为完整字符串，但颜色部分 `rgba(30,40,80,0.06)` / `rgba(30,40,80,0.08)` 与原值一致）
- [ ] `WorkbenchLayout.tsx` 使用 `layout.xxx` 替代 `tokens.layout.xxx`，无残留 `tokens.` 调用
- [ ] `tokens.ts` 保留 `export const tokens = teal.light` 过渡导出
- [ ] 无悬挂 import / 编译错误

## 文件清单

| 文件 | 操作 |
|---|---|
| `desktop/renderer/src/theme/tokens.ts` | 重构 |
| `desktop/renderer/src/theme/themes/teal.ts` | 新建 |
| `desktop/renderer/src/workbench/WorkbenchLayout.tsx` | 修改 import + 使用点 |
