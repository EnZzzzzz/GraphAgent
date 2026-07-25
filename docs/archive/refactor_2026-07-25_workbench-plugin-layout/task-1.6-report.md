# Step 1.6 Report — WorkbenchLayout + useContribution

## 实现了什么

- `desktop/renderer/src/workbench/useContribution.ts`：`useObservable<T>` hook（useSyncExternalStore 封装）
- `desktop/renderer/src/workbench/WorkbenchLayout.tsx`：
  - `usePageResolution` hook：双订阅（PageManager + Registry）+ 版本号对比
  - `WorkbenchLayout` 组件：4 Part shell（sidebar/topbar/content/auxiliary）
  - Topbar 三 slot（left/center/right）
- `Registry.version`：增量计数器，解决 useSyncExternalStore 对象引用无限循环

## TDD 证据

- RED: 测试先行，无限循环 + 模块缺失
- 修复：增加 Registry.version 避免 getSnapshot 每次返回新对象
- GREEN: 6/6 rendering tests pass

## 测试结果

```
✓ desktop/renderer/src/workbench/WorkbenchLayout.test.tsx (6 tests) 34ms
全量: 52 passing
```

## 改动文件

- `desktop/renderer/src/workbench/useContribution.ts`（新建）
- `desktop/renderer/src/workbench/WorkbenchLayout.tsx`（新建）
- `desktop/renderer/src/workbench/WorkbenchLayout.test.tsx`（新建）
- `desktop/renderer/src/workbench/registry.ts`（修改：加 version 属性）

## 疑虑

无。
