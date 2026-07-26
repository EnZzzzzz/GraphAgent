# Task 1.3 Report — index.css + WorkbenchLayout 存量改造

## 实现了什么

- `index.css`：17 处设计值字面量 → `var(--ga-*)`（gap/padding/background/border-radius/box-shadow/width/height/color/font-size）
- `WorkbenchLayout.tsx`：删除 `PART_WIDTH_LIMITS` 常量，改为 import `tokens.layout`，6 处引用替换

## 测试结果

全量 78/78 passing，typecheck 绿。

## TDD 证据

此 Step 为纯存量改造，无新增测试——既有 WorkbenchLayout.test.tsx（9 tests）和 ResizeHandle.test.tsx（4 tests）充当回归验证。改造前后测试全绿即验证等价。

## 改动的文件

- `desktop/renderer/src/index.css`（修改）
- `desktop/renderer/src/workbench/WorkbenchLayout.tsx`（修改）

## 自查发现

- `part-resize-handle` 的 `margin: 0 -11px` 保留硬编码——该值是 `(resizeHandleSize + shellGap)` 算术关系的计算结果，非独立设计值，不宜用 token
- `topbar` 的 `padding: 8px 12px 0` 保留硬编码——这些是内部微调值，非全局设计基调

## 疑虑

无。
