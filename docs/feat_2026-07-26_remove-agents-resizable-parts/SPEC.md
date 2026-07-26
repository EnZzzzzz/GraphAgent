# SPEC — 删除 agents 示例页 + 布局区域宽度可拖拽调节

日期：2026-07-26
类型：feature/refactor
状态：已评审（用户对话中确认）

## 1. 背景

`plugins/agents/` 是上一阶段为验证多页面架构而建的示例页，用户确认是测试用途，需要移除。同时，workbench 布局壳的 4 个 Part 中，sidebar（232px 固定）与 auxiliary（400px 固定）宽度写死，需要支持拖拽调节；content 为 flex:1 随动；topbar 是高度方向，不在范围内。

## 2. 目标

1. 删除 agents 插件及其一切引用（含 sidebar 底部"切换到 Agents 页"入口）。删除后 session 页成为唯一页面，同时消除了上一轮终审发现的「启动默认打开 agents 页」问题（Critical 1）。
2. sidebar 与 auxiliary 面板支持鼠标拖拽边缘调宽，content 区随 flex 布局自动伸缩。

## 3. 非目标

- 宽度持久化（刷新后恢复默认值，后续需要再做）。
- topbar 高度调节、面板折叠/展开按钮、双击复位。
- 上一轮终审发现的其余项（Critical 2、Important 3-6）不在本次范围。

## 4. 设计要点

- **删除**：`plugins/agents/` 整目录、`plugins/index.ts` 中的引用、`SessionListView.tsx` 中的切换入口菜单块。agents 只被这 3 处引用（已 grep 确认）。
- **拖拽**：workbench 新增 `ResizeHandle.tsx` 组件——10px 透明热区，负 margin 重叠在 12px flex gap 上（不改变现有视觉间距），`cursor: col-resize`。mousedown 时记录起始位置与起始宽度，document 级 mousemove/mouseup 驱动，带 min/max clamp。拖拽期间 body cursor 锁定为 col-resize。
- **宽度状态**：`WorkbenchLayout` 持有 `sidebarWidth`（默认 232，min 180 / max 480）与 `auxiliaryWidth`（默认 400，min 280 / max 640），inline style 覆盖 CSS 默认宽度。auxiliary 仅在当前 page 声明了它时才渲染，handle 同理。
- 宽度默认值保留在 `index.css`（作为无 JS 时的 fallback），inline style 优先。

## 5. 验收标准

- [ ] `grep -r agents desktop/renderer/src` 零命中
- [ ] `npm run test` / `typecheck` / `build` 全绿；新增拖拽行为测试
- [ ] 启动即 session 页（原 Critical 1 消除）
- [ ] sidebar / auxiliary 边缘可拖拽调宽，min/max 生效，content 随动，视觉间距不变

## 6. 变更记录

| 日期 | 变更 |
| --- | --- |
| 2026-07-26 | 初稿 |
