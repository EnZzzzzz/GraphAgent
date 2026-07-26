5dfec5f Step 1.1: new theme/tokens.ts + theme/cssVariables.ts — design token single source of truth
---
 desktop/renderer/src/theme/cssVariables.test.ts | 123 ++++++++++++++++++++++++
 desktop/renderer/src/theme/cssVariables.ts      |  26 +++++
 desktop/renderer/src/theme/tokens.test.ts       |  82 ++++++++++++++++
 desktop/renderer/src/theme/tokens.ts            |  64 ++++++++++++
 4 files changed, 295 insertions(+)
---
diff --git a/desktop/renderer/src/theme/cssVariables.test.ts b/desktop/renderer/src/theme/cssVariables.test.ts
new file mode 100644
index 0000000..4b18735
--- /dev/null
+++ b/desktop/renderer/src/theme/cssVariables.test.ts
@@ -0,0 +1,123 @@
+import { describe, it, expect, beforeEach } from 'vitest'
+import { applyCssVariables } from './cssVariables'
+
+describe('applyCssVariables', () => {
+  beforeEach(() => {
+    // 清理上一轮测试写入的 CSS 变量
+    const root = document.documentElement
+    for (let i = root.style.length - 1; i >= 0; i--) {
+      const prop = root.style[i]
+      if (prop.startsWith('--ga-')) {
+        root.style.removeProperty(prop)
+      }
+    }
+  })
+
+  it('在 :root 上设置 CSS 变量，命名格式为 --ga-<域>-<kebab名>', () => {
+    applyCssVariables()
+
+    const style = document.documentElement.style
+
+    // 抽查 color 域
+    expect(style.getPropertyValue('--ga-color-primary')).toBe('#2ed3b0')
+    expect(style.getPropertyValue('--ga-color-text-base')).toBe('#1b1f27')
+    expect(style.getPropertyValue('--ga-color-bg-panel')).toBe('#ffffff')
+    expect(style.getPropertyValue('--ga-color-shell-gradient-from')).toBe('#e9ecf6')
+    expect(style.getPropertyValue('--ga-color-handle-hover')).toBe('rgba(46, 211, 176, 0.25)')
+
+    // 抽查 font 域
+    expect(style.getPropertyValue('--ga-font-size-base')).toBe('14')
+    expect(style.getPropertyValue('--ga-font-size-lg')).toBe('16')
+
+    // 抽查 radius 域
+    expect(style.getPropertyValue('--ga-radius-panel')).toBe('16')
+    expect(style.getPropertyValue('--ga-radius-control')).toBe('10')
+
+    // 抽查 spacing 域
+    expect(style.getPropertyValue('--ga-spacing-shell-gap')).toBe('12')
+
+    // 抽查 layout 域
+    expect(style.getPropertyValue('--ga-layout-topbar-height')).toBe('56')
+    expect(style.getPropertyValue('--ga-layout-sidebar-default')).toBe('232')
+  })
+
+  it('每个域都有对应 CSS 变量（全覆盖）', () => {
+    applyCssVariables()
+    const style = document.documentElement.style
+
+    // color 域 — 逐个验证
+    const colorVars = [
+      '--ga-color-primary',
+      '--ga-color-link',
+      '--ga-color-text-base',
+      '--ga-color-text-secondary',
+      '--ga-color-bg-layout',
+      '--ga-color-bg-panel',
+      '--ga-color-bg-panel-sunken',
+      '--ga-color-bg-active',
+      '--ga-color-shell-gradient-from',
+      '--ga-color-shell-gradient-via',
+      '--ga-color-shell-gradient-to',
+      '--ga-color-handle-hover',
+      '--ga-color-shadow-panel',
+      '--ga-color-shadow-menu-item',
+      '--ga-color-bg-bubble-ai',
+      '--ga-color-bg-bubble-user',
+      '--ga-color-border-subtle',
+      '--ga-color-bg-avatar'
+    ]
+    for (const v of colorVars) {
+      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
+    }
+
+    // font 域
+    const fontVars = [
+      '--ga-font-family',
+      '--ga-font-size-base',
+      '--ga-font-size-small',
+      '--ga-font-size-sm',
+      '--ga-font-size-md',
+      '--ga-font-size-lg'
+    ]
+    for (const v of fontVars) {
+      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
+    }
+
+    // radius 域
+    const radiusVars = [
+      '--ga-radius-panel',
+      '--ga-radius-control',
+      '--ga-radius-card',
+      '--ga-radius-avatar',
+      '--ga-radius-message',
+      '--ga-radius-handle'
+    ]
+    for (const v of radiusVars) {
+      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
+    }
+
+    // spacing 域
+    const spacingVars = [
+      '--ga-spacing-shell-gap',
+      '--ga-spacing-shell-padding'
+    ]
+    for (const v of spacingVars) {
+      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
+    }
+
+    // layout 域
+    const layoutVars = [
+      '--ga-layout-topbar-height',
+      '--ga-layout-sidebar-default',
+      '--ga-layout-sidebar-min',
+      '--ga-layout-sidebar-max',
+      '--ga-layout-auxiliary-default',
+      '--ga-layout-auxiliary-min',
+      '--ga-layout-auxiliary-max',
+      '--ga-layout-resize-handle-size'
+    ]
+    for (const v of layoutVars) {
+      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
+    }
+  })
+})
diff --git a/desktop/renderer/src/theme/cssVariables.ts b/desktop/renderer/src/theme/cssVariables.ts
new file mode 100644
index 0000000..2191504
--- /dev/null
+++ b/desktop/renderer/src/theme/cssVariables.ts
@@ -0,0 +1,26 @@
+import { tokens } from './tokens'
+
+/**
+ * 将 camelCase 字符串转换为 kebab-case。
+ * 如 'textBase' → 'text-base'，'shellGradientFrom' → 'shell-gradient-from'。
+ */
+function camelToKebab(str: string): string {
+  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
+}
+
+/**
+ * 把 tokens 拍平为 `--ga-<域>-<kebab名>` 格式的 CSS 自定义属性，
+ * 写入 `document.documentElement.style.setProperty(...)`。
+ *
+ * CSS 变量是插件消费的公开契约。
+ */
+export function applyCssVariables(): void {
+  const root = document.documentElement
+
+  for (const [domain, domainTokens] of Object.entries(tokens)) {
+    for (const [key, value] of Object.entries(domainTokens)) {
+      const varName = `--ga-${domain}-${camelToKebab(key)}`
+      root.style.setProperty(varName, String(value))
+    }
+  }
+}
diff --git a/desktop/renderer/src/theme/tokens.test.ts b/desktop/renderer/src/theme/tokens.test.ts
new file mode 100644
index 0000000..dc582f5
--- /dev/null
+++ b/desktop/renderer/src/theme/tokens.test.ts
@@ -0,0 +1,82 @@
+import { describe, it, expect } from 'vitest'
+import { tokens } from './tokens'
+
+describe('tokens', () => {
+  it('包含全部五个域', () => {
+    expect(tokens).toHaveProperty('color')
+    expect(tokens).toHaveProperty('font')
+    expect(tokens).toHaveProperty('radius')
+    expect(tokens).toHaveProperty('spacing')
+    expect(tokens).toHaveProperty('layout')
+  })
+
+  describe('color 域', () => {
+    it('包含所有必收颜色 token', () => {
+      const c = tokens.color
+      expect(c.primary).toBe('#2ed3b0')
+      expect(c.link).toBe('#12a98c')
+      expect(c.textBase).toBe('#1b1f27')
+      expect(c.textSecondary).toBe('#8a8f9c')
+      expect(c.bgLayout).toBe('#eef0f7')
+      expect(c.bgPanel).toBe('#ffffff')
+      expect(c.bgPanelSunken).toBe('#fafbfd')
+      expect(c.bgActive).toBe('#e4f7f1')
+      expect(c.shellGradientFrom).toBe('#e9ecf6')
+      expect(c.shellGradientVia).toBe('#f4f5fa')
+      expect(c.shellGradientTo).toBe('#eef7f4')
+      expect(c.handleHover).toBe('rgba(46, 211, 176, 0.25)')
+      expect(c.shadowPanel).toBe('rgba(30, 40, 80, 0.06)')
+      expect(c.shadowMenuItem).toBe('rgba(30, 40, 80, 0.08)')
+      expect(c.bgBubbleAi).toBe('#e9f7f3')
+      expect(c.bgBubbleUser).toBe('#f2f3f7')
+      expect(c.borderSubtle).toBe('#eceef4')
+      expect(c.bgAvatar).toBe('#e4e7f0')
+    })
+  })
+
+  describe('font 域', () => {
+    it('包含所有字号与字体族 token', () => {
+      const f = tokens.font
+      expect(f.family).toBe("-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif")
+      expect(f.sizeBase).toBe(14)
+      expect(f.sizeSmall).toBe(13)
+      expect(f.sizeSm).toBe(12)
+      expect(f.sizeMd).toBe(15)
+      expect(f.sizeLg).toBe(16)
+    })
+  })
+
+  describe('radius 域', () => {
+    it('包含所有圆角 token', () => {
+      const r = tokens.radius
+      expect(r.panel).toBe(16)
+      expect(r.control).toBe(10)
+      expect(r.card).toBe(16)
+      expect(r.avatar).toBe(8)
+      expect(r.message).toBe(12)
+      expect(r.handle).toBe(5)
+    })
+  })
+
+  describe('spacing 域', () => {
+    it('包含间距 token', () => {
+      const s = tokens.spacing
+      expect(s.shellGap).toBe(12)
+      expect(s.shellPadding).toBe(12)
+    })
+  })
+
+  describe('layout 域', () => {
+    it('包含所有布局尺寸 token', () => {
+      const l = tokens.layout
+      expect(l.topbarHeight).toBe(56)
+      expect(l.sidebarDefault).toBe(232)
+      expect(l.sidebarMin).toBe(180)
+      expect(l.sidebarMax).toBe(480)
+      expect(l.auxiliaryDefault).toBe(400)
+      expect(l.auxiliaryMin).toBe(280)
+      expect(l.auxiliaryMax).toBe(640)
+      expect(l.resizeHandleSize).toBe(10)
+    })
+  })
+})
diff --git a/desktop/renderer/src/theme/tokens.ts b/desktop/renderer/src/theme/tokens.ts
new file mode 100644
index 0000000..599bd59
--- /dev/null
+++ b/desktop/renderer/src/theme/tokens.ts
@@ -0,0 +1,64 @@
+/**
+ * 设计 token 唯一数据源。
+ * 分域组织，初值 = 代码库现状字面量（零视觉回归）。
+ * token 的 key 不带域前缀（如 color.primary），因为域已是上层 key。
+ */
+export const tokens = {
+  color: {
+    primary: '#2ed3b0',
+    link: '#12a98c',
+    textBase: '#1b1f27',
+    textSecondary: '#8a8f9c',
+    bgLayout: '#eef0f7',
+    bgPanel: '#ffffff',
+    bgPanelSunken: '#fafbfd',
+    bgActive: '#e4f7f1',
+    shellGradientFrom: '#e9ecf6',
+    shellGradientVia: '#f4f5fa',
+    shellGradientTo: '#eef7f4',
+    handleHover: 'rgba(46, 211, 176, 0.25)',
+    shadowPanel: 'rgba(30, 40, 80, 0.06)',
+    shadowMenuItem: 'rgba(30, 40, 80, 0.08)',
+    bgBubbleAi: '#e9f7f3',
+    bgBubbleUser: '#f2f3f7',
+    borderSubtle: '#eceef4',
+    bgAvatar: '#e4e7f0'
+  },
+
+  font: {
+    family:
+      "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif",
+    sizeBase: 14,
+    sizeSmall: 13,
+    sizeSm: 12,
+    sizeMd: 15,
+    sizeLg: 16
+  },
+
+  radius: {
+    panel: 16,
+    control: 10,
+    card: 16,
+    avatar: 8,
+    message: 12,
+    handle: 5
+  },
+
+  spacing: {
+    shellGap: 12,
+    shellPadding: 12
+  },
+
+  layout: {
+    topbarHeight: 56,
+    sidebarDefault: 232,
+    sidebarMin: 180,
+    sidebarMax: 480,
+    auxiliaryDefault: 400,
+    auxiliaryMin: 280,
+    auxiliaryMax: 640,
+    resizeHandleSize: 10
+  }
+} as const
+
+export type Tokens = typeof tokens
