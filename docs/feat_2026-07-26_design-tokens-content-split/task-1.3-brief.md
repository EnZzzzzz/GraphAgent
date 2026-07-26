# Task 1.3 Brief — index.css + WorkbenchLayout 存量改造

## 来源

PLAN Phase 1 Step 1.3

## 内容

### 1. `index.css` — 全部设计值字面量 → `var(--ga-*)`

逐行替换：

| 原值 | CSS 变量 |
|------|----------|
| `gap: 12px` (`.app-shell`, `.main-column`, `.main-row`) | `var(--ga-spacing-shell-gap)` |
| `padding: 12px` (`.app-shell`) | `var(--ga-spacing-shell-padding)` |
| `background: linear-gradient(135deg, #e9ecf6 0%, #f4f5fa 60%, #eef7f4 100%)` | `linear-gradient(135deg, var(--ga-color-shell-gradient-from) 0%, var(--ga-color-shell-gradient-via) 60%, var(--ga-color-shell-gradient-to) 100%)` |
| `background: #ffffff` (`.panel`) | `var(--ga-color-bg-panel)` |
| `border-radius: 16px` (`.panel`) | `var(--ga-radius-panel)` |
| `box-shadow: 0 4px 24px rgba(30, 40, 80, 0.06)` | `0 4px 24px var(--ga-color-shadow-panel)` |
| `width: 232px` (`.panel-sidebar`) | `var(--ga-layout-sidebar-default)` |
| `box-shadow: 0 2px 10px rgba(30, 40, 80, 0.08)` (`.ant-menu-item-selected`) | `0 2px 10px var(--ga-color-shadow-menu-item)` |
| `color: #2ed3b0` (`.ant-menu-item-selected .anticon`) | `var(--ga-color-primary)` |
| `height: 56px` (`.topbar`) | `var(--ga-layout-topbar-height)` |
| `color: #8a8f9c` (`.step`) | `var(--ga-color-text-secondary)` |
| `font-size: 13px` (`.step`) | `var(--ga-font-size-small)` |
| `background: #e4f7f1` (`.step-active`) | `var(--ga-color-bg-active)` |
| `color: #12a98c` (`.step-active`) | `var(--ga-color-link)` |
| `width: 400px` (`.panel-chat`) | `var(--ga-layout-auxiliary-default)` |
| `width: 10px` (`.part-resize-handle`) | `var(--ga-layout-resize-handle-size)` |
| `margin: 0 -11px` (`.part-resize-handle`) | **保留硬编码**（计算值：`(10 + 12 - 22 + 12 = 12)`，由 `resizeHandleSize` 和 `shellGap` 的算术关系决定，不适宜直接 token 替代） |
| `border-radius: 5px` (`.part-resize-handle`) | `var(--ga-radius-handle)` |
| `background: rgba(46, 211, 176, 0.25)` (`.part-resize-handle:hover`) | `var(--ga-color-handle-hover)` |

### 2. `WorkbenchLayout.tsx` — PART_WIDTH_LIMITS → tokens.layout

- 删除 `export const PART_WIDTH_LIMITS = { ... }`
- 添加 `import { tokens } from '../theme/tokens'`
- 将所有 `PART_WIDTH_LIMITS.sidebar.*` 替换为 `tokens.layout.sidebar*`
- 将所有 `PART_WIDTH_LIMITS.auxiliary.*` 替换为 `tokens.layout.auxiliary*`

具体映射：
- `PART_WIDTH_LIMITS.sidebar.default` → `tokens.layout.sidebarDefault`
- `PART_WIDTH_LIMITS.sidebar.min` → `tokens.layout.sidebarMin`
- `PART_WIDTH_LIMITS.sidebar.max` → `tokens.layout.sidebarMax`
- `PART_WIDTH_LIMITS.auxiliary.default` → `tokens.layout.auxiliaryDefault`
- `PART_WIDTH_LIMITS.auxiliary.min` → `tokens.layout.auxiliaryMin`
- `PART_WIDTH_LIMITS.auxiliary.max` → `tokens.layout.auxiliaryMax`

## 验证

- 不需要新增测试（既有 WorkbenchLayout.test.tsx 和 ResizeHandle.test.tsx 应全部通过，因为 token 值 = 原常量值）
- 全量 test/typecheck 绿
- grep `#[0-9a-fA-F]{3,8}` 在 `index.css` 零命中
