# PLAN — 删除 agents 示例页 + 布局区域宽度可拖拽调节

对应 SPEC：同目录 SPEC.md。单一 Phase，直接执行（主 Agent 实现，非 subagent——用户已表明偏好且改动集中）。

## Steps

| Step | 内容 | 验收 | 状态 |
| --- | --- | --- | --- |
| 1 | 删除 `plugins/agents/` 目录、`plugins/index.ts` 引用、`SessionListView.tsx` 切换入口（含多余 import） | grep 零命中；test/typecheck 绿 | done |
| 2 | workbench 新增 `ResizeHandle.tsx` + `index.css` handle 样式 | 组件渲染测试通过 | done |
| 3 | `WorkbenchLayout.tsx` 接入宽度 state + 两个 handle（sidebar / auxiliary），更新既有测试 | 拖拽调宽测试通过、全量测试绿 | done |
| 4 | 更新 `AGENTS.md`（移除 agents、记录 ResizeHandle）+ 全量回归（test/typecheck/build）+ commit | 全绿 | done |
