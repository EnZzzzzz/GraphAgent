# Step 2.1 brief — sessions 插件

## 任务

创建 `desktop/renderer/src/plugins/sessions/` 目录：内置插件，注册 sidebar ViewContainer「会话」+ 会话列表 view。数据源 `mock.ts`，迁移现 `Sidebar.tsx`。含测试。

## 背景

- 框架层 P1 已完成：`workbench/` 模块（types/emitter/registry/pageManager/pluginHost/WorkbenchLayout/useContribution）
- 现有 `Sidebar.tsx` 渲染：Logo + 标题、新建会话按钮、antd Menu（MOCK_SESSIONS）、底部用户信息
- `mock.ts` 保留不动，作为 sessions 插件数据源
- 插件通过 `activate(ctx)` 注册贡献

## 架构设计

### 会话状态管理

Sidebar 选的 session 需要传递给 ContentArea 和 ChatPanel。采用插件内部模块级状态：

```ts
// plugins/sessions/sessionStore.ts
// 简单的模块级状态：当前选中的 sessionId
// 各 view 组件通过 import 共享

export function useActiveSessionId(): [string, (id: string) => void]
```

这不是 workbench 框架的一部分——只是 sessions 插件内部的状态共享。

### 插件结构

```
desktop/renderer/src/plugins/sessions/
├── index.ts              # Plugin 导出
├── sessionStore.ts       # 模块级 session 状态
├── SessionListView.tsx   # 会话列表 view 组件
└── SessionListView.test.tsx
```

### SessionListView.tsx

迁移自 `Sidebar.tsx`，去掉外层布局（panel-sidebar 容器壳），只保留内容：

```tsx
export function SessionListView(): JSX.Element {
  // 渲染：Logo+标题、新建会话按钮、antd Menu(MOCK_SESSIONS)、底部用户信息
  // onSelect → useActiveSessionId()[1]
}
```

视觉零回归：所有 antd 组件 + 内联样式保持不变。

### index.ts — Plugin

```ts
export const sessionsPlugin: Plugin = {
  id: 'builtin.sessions',
  activate(ctx) {
    ctx.registerContribution({
      point: 'workbench.viewContainers',
      container: {
        id: 'sessions-container',
        title: '会话',
        part: 'sidebar',
        viewIds: ['session-list']
      }
    })
    ctx.registerContribution({
      point: 'workbench.views',
      view: {
        id: 'session-list',
        title: '会话列表',
        component: SessionListView
      }
    })
  }
}
```

**注意**：插件不直接操作 DOM 或 pageManager——只注册贡献。会话切换在 SessionListView 内部通过 sessionStore 管理。

## 测试

`SessionListView.test.tsx`：
- [ ] 渲染 MOCK_SESSIONS 所有会话标题
- [ ] 渲染 Logo 标题 "GraphAgent"
- [ ] 渲染"新建会话"按钮
- [ ] 点击某会话后该会话变为选中状态（antd Menu selectedKeys 变化）
- [ ] 使用 @testing-library/react（已安装）

测试时注意：antd Menu 的 `items` 模式和 `onClick` 在测试环境中正常工作即可。

## 验收标准

- [ ] `SessionListView.test.tsx` 所有测试通过
- [ ] `npm run test` 全量通过
- [ ] `npm run typecheck` 通过
- [ ] `plugins/sessions/` 不 import `components/` 旧代码
- [ ] `mock.ts` 保留不修改

## 完成标准之外不要做的

- 不要修改 workbench/ 框架代码
- 不要修改 App.tsx（P2.5 才做）
- 不要实现 sessionPage 或 chat 插件（后续 Step）
- 不要在 SessionListView 里集成 WorkbenchLayout（那是 App.tsx 的职责）
