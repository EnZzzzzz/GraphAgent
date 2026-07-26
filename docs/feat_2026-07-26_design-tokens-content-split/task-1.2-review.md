c60f283 Step 1.2: applyCssVariables in main.tsx + themeConfig from tokens, delete old theme.ts
---
 desktop/renderer/src/main.tsx                      |   5 +-
 desktop/renderer/src/theme.ts                      |  34 ------
 desktop/renderer/src/theme/themeConfig.test.ts     |  46 ++++++++
 desktop/renderer/src/theme/themeConfig.ts          |  36 ++++++
 .../task-1.2-brief.md                              | 125 +++++++++++++++++++++
 5 files changed, 211 insertions(+), 35 deletions(-)
---
diff --git a/desktop/renderer/src/main.tsx b/desktop/renderer/src/main.tsx
index efd891a..9d739aa 100644
--- a/desktop/renderer/src/main.tsx
+++ b/desktop/renderer/src/main.tsx
@@ -1,15 +1,18 @@
 import React from 'react'
 import ReactDOM from 'react-dom/client'
 import { ConfigProvider } from 'antd'
 import zhCN from 'antd/locale/zh_CN'
 import App from './App'
-import { themeConfig } from './theme'
+import { themeConfig } from './theme/themeConfig'
+import { applyCssVariables } from './theme/cssVariables'
 import './index.css'
 
+applyCssVariables()
+
 ReactDOM.createRoot(document.getElementById('root')!).render(
   <React.StrictMode>
     <ConfigProvider locale={zhCN} theme={themeConfig}>
       <App />
     </ConfigProvider>
   </React.StrictMode>
 )
diff --git a/desktop/renderer/src/theme.ts b/desktop/renderer/src/theme.ts
deleted file mode 100644
index c5f2bc3..0000000
--- a/desktop/renderer/src/theme.ts
+++ /dev/null
@@ -1,34 +0,0 @@
-import type { ThemeConfig } from 'antd'
-
-// 设计 token 提取自 prototype/ 下的 HiAgents（2025 iF UX 获奖作品）界面：
-// 浅色通透基底 + 白色悬浮圆角面板 + 薄荷青主色 + 近黑深色强调。
-export const themeConfig: ThemeConfig = {
-  token: {
-    colorPrimary: '#2ed3b0',
-    colorInfo: '#2ed3b0',
-    colorLink: '#12a98c',
-    colorTextBase: '#1b1f27',
-    colorBgLayout: '#eef0f7',
-    borderRadius: 10,
-    fontSize: 14,
-    fontFamily:
-      "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif"
-  },
-  components: {
-    Menu: {
-      itemSelectedBg: '#ffffff',
-      itemSelectedColor: '#1b1f27',
-      itemColor: '#8a8f9c',
-      itemBorderRadius: 10,
-      itemMarginInline: 12,
-      itemHeight: 40
-    },
-    Button: {
-      borderRadius: 10,
-      controlHeight: 36
-    },
-    Card: {
-      borderRadiusLG: 16
-    }
-  }
-}
diff --git a/desktop/renderer/src/theme/themeConfig.test.ts b/desktop/renderer/src/theme/themeConfig.test.ts
new file mode 100644
index 0000000..6d51a2f
--- /dev/null
+++ b/desktop/renderer/src/theme/themeConfig.test.ts
@@ -0,0 +1,46 @@
+import { describe, it, expect } from 'vitest'
+import { themeConfig } from './themeConfig'
+
+describe('themeConfig', () => {
+  it('token 层派生值与旧 theme.ts 逐字段等价', () => {
+    const t = themeConfig.token!
+
+    expect(t.colorPrimary).toBe('#2ed3b0')
+    expect(t.colorInfo).toBe('#2ed3b0')
+    expect(t.colorLink).toBe('#12a98c')
+    expect(t.colorTextBase).toBe('#1b1f27')
+    expect(t.colorBgLayout).toBe('#eef0f7')
+    expect(t.borderRadius).toBe(10)
+    expect(t.fontSize).toBe(14)
+    expect(t.fontFamily).toBe(
+      "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif"
+    )
+  })
+
+  it('components.Menu 派生值等价', () => {
+    const m = themeConfig.components?.Menu
+
+    expect(m).toBeDefined()
+    expect(m!.itemSelectedBg).toBe('#ffffff')
+    expect(m!.itemSelectedColor).toBe('#1b1f27')
+    expect(m!.itemColor).toBe('#8a8f9c')
+    expect(m!.itemBorderRadius).toBe(10)
+    expect(m!.itemMarginInline).toBe(12)
+    expect(m!.itemHeight).toBe(40)
+  })
+
+  it('components.Button 派生值等价', () => {
+    const b = themeConfig.components?.Button
+
+    expect(b).toBeDefined()
+    expect(b!.borderRadius).toBe(10)
+    expect(b!.controlHeight).toBe(36)
+  })
+
+  it('components.Card 派生值等价', () => {
+    const c = themeConfig.components?.Card
+
+    expect(c).toBeDefined()
+    expect(c!.borderRadiusLG).toBe(16)
+  })
+})
diff --git a/desktop/renderer/src/theme/themeConfig.ts b/desktop/renderer/src/theme/themeConfig.ts
new file mode 100644
index 0000000..8a5785e
--- /dev/null
+++ b/desktop/renderer/src/theme/themeConfig.ts
@@ -0,0 +1,36 @@
+import type { ThemeConfig } from 'antd'
+import { tokens } from './tokens'
+
+/**
+ * antd ThemeConfig，从 tokens 派生。
+ * 替代旧的 `desktop/renderer/src/theme.ts`。
+ */
+export const themeConfig: ThemeConfig = {
+  token: {
+    colorPrimary: tokens.color.primary,
+    colorInfo: tokens.color.primary,
+    colorLink: tokens.color.link,
+    colorTextBase: tokens.color.textBase,
+    colorBgLayout: tokens.color.bgLayout,
+    borderRadius: tokens.radius.control,
+    fontSize: tokens.font.sizeBase,
+    fontFamily: tokens.font.family
+  },
+  components: {
+    Menu: {
+      itemSelectedBg: tokens.color.bgPanel,
+      itemSelectedColor: tokens.color.textBase,
+      itemColor: tokens.color.textSecondary,
+      itemBorderRadius: tokens.radius.control,
+      itemMarginInline: tokens.spacing.shellGap,
+      itemHeight: 40 // 纯组件内部尺寸，非设计基调，不映射 token
+    },
+    Button: {
+      borderRadius: tokens.radius.control,
+      controlHeight: 36 // 纯组件内部尺寸，保留硬编码
+    },
+    Card: {
+      borderRadiusLG: tokens.radius.panel
+    }
+  }
+}
diff --git a/docs/feat_2026-07-26_design-tokens-content-split/task-1.2-brief.md b/docs/feat_2026-07-26_design-tokens-content-split/task-1.2-brief.md
new file mode 100644
index 0000000..378a53b
--- /dev/null
+++ b/docs/feat_2026-07-26_design-tokens-content-split/task-1.2-brief.md
@@ -0,0 +1,125 @@
+# Task 1.2 Brief — applyCssVariables 集成 + themeConfig 派生
+
+## 来源
+
+PLAN Phase 1 Step 1.2
+
+## 内容
+
+### 1. `main.tsx` — 启动时调用 `applyCssVariables()`
+
+在 `desktop/renderer/src/main.tsx` 中，`ReactDOM.createRoot(...)` 之前调用：
+
+```ts
+import { applyCssVariables } from './theme/cssVariables'
+applyCssVariables()
+```
+
+### 2. 新建 `desktop/renderer/src/theme/themeConfig.ts`
+
+从 `tokens` 派生 antd `ThemeConfig`，完全替代当前 `desktop/renderer/src/theme.ts` 的内容。
+
+当前 `theme.ts` 的内容：
+
+```ts
+import type { ThemeConfig } from 'antd'
+
+export const themeConfig: ThemeConfig = {
+  token: {
+    colorPrimary: '#2ed3b0',
+    colorInfo: '#2ed3b0',
+    colorLink: '#12a98c',
+    colorTextBase: '#1b1f27',
+    colorBgLayout: '#eef0f7',
+    borderRadius: 10,
+    fontSize: 14,
+    fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif"
+  },
+  components: {
+    Menu: {
+      itemSelectedBg: '#ffffff',
+      itemSelectedColor: '#1b1f27',
+      itemColor: '#8a8f9c',
+      itemBorderRadius: 10,
+      itemMarginInline: 12,
+      itemHeight: 40
+    },
+    Button: {
+      borderRadius: 10,
+      controlHeight: 36
+    },
+    Card: {
+      borderRadiusLG: 16
+    }
+  }
+}
+```
+
+新的 `theme/themeConfig.ts` 必须从 `tokens` 对象引用值（而非硬编码字面量），保证派生等价：
+
+| 旧 theme.ts 字段 | 新来源 |
+|------------------|--------|
+| `colorPrimary: '#2ed3b0'` | `tokens.color.primary` |
+| `colorInfo: '#2ed3b0'` | `tokens.color.primary` |
+| `colorLink: '#12a98c'` | `tokens.color.link` |
+| `colorTextBase: '#1b1f27'` | `tokens.color.textBase` |
+| `colorBgLayout: '#eef0f7'` | `tokens.color.bgLayout` |
+| `borderRadius: 10` | `tokens.radius.control` |
+| `fontSize: 14` | `tokens.font.sizeBase` |
+| `fontFamily: ...` | `tokens.font.family` |
+| Menu `itemSelectedBg: '#ffffff'` | `tokens.color.bgPanel` |
+| Menu `itemSelectedColor: '#1b1f27'` | `tokens.color.textBase` |
+| Menu `itemColor: '#8a8f9c'` | `tokens.color.textSecondary` |
+| Menu `itemBorderRadius: 10` | `tokens.radius.control` |
+| Menu `itemMarginInline: 12` | `tokens.spacing.shellGap` |
+| Menu `itemHeight: 40` | 无对应 token，保留硬编码 40（纯组件内部尺寸，非设计基调） |
+| Button `borderRadius: 10` | `tokens.radius.control` |
+| Button `controlHeight: 36` | 无对应 token，保留硬编码 36 |
+| Card `borderRadiusLG: 16` | `tokens.radius.panel` |
+
+### 3. 删除旧 `theme.ts`
+
+删除 `desktop/renderer/src/theme.ts`，`main.tsx` 的 import 改为 `./theme/themeConfig`。
+
+### 4. 更新 `main.tsx` 的 import
+
+从：
+```ts
+import { themeConfig } from './theme'
+```
+改为：
+```ts
+import { themeConfig } from './theme/themeConfig'
+```
+
+## 测试要求
+
+### 测试文件：`desktop/renderer/src/theme/themeConfig.test.ts`
+
+验证 `themeConfig` 派生值与原 `theme.ts` 逐字段等价：
+
+- `themeConfig.token.colorPrimary` === `'#2ed3b0'`
+- `themeConfig.token.colorInfo` === `'#2ed3b0'`
+- `themeConfig.token.colorLink` === `'#12a98c'`
+- `themeConfig.token.colorTextBase` === `'#1b1f27'`
+- `themeConfig.token.colorBgLayout` === `'#eef0f7'`
+- `themeConfig.token.borderRadius` === 10
+- `themeConfig.token.fontSize` === 14
+- `themeConfig.token.fontFamily` === 原值
+- `themeConfig.components.Menu.itemSelectedBg` === `'#ffffff'`
+- `themeConfig.components.Menu.itemSelectedColor` === `'#1b1f27'`
+- `themeConfig.components.Menu.itemColor` === `'#8a8f9c'`
+- `themeConfig.components.Menu.itemBorderRadius` === 10
+- `themeConfig.components.Menu.itemMarginInline` === 12
+- `themeConfig.components.Menu.itemHeight` === 40
+- `themeConfig.components.Button.borderRadius` === 10
+- `themeConfig.components.Button.controlHeight` === 36
+- `themeConfig.components.Card.borderRadiusLG` === 16
+
+TDD 流程：先写测试 → RED（themeConfig 文件不存在）→ 实现 → GREEN。
+
+## 验收
+
+- [ ] 派生值与原配置逐字段等价的单测通过
+- [ ] typecheck 绿
+- [ ] 全量 test 绿（旧 `theme.ts` 删除后，main.tsx 等其他文件的 import 已正确更新）
