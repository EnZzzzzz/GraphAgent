# Step 2.2 + 2.3 brief — sessionPage 插件

## 任务

创建 `desktop/renderer/src/plugins/sessionPage/`：注册 session page + topbar 三 slot 贡献 + content 主视图。迁移现 Topbar.tsx 和 ContentArea.tsx。

## 组件映射

| 旧组件 | 新位置 | 说明 |
| --- | --- | --- |
| Topbar.tsx → left slot | `SessionTopbarLeft.tsx` | 返回按钮 + 标题（从 sessionStore 读取）+ 编辑/撤销/重做按钮 |
| Topbar.tsx → center slot | `SessionTopbarCenter.tsx` | 步骤指示器「① 调试」「② 发布」 |
| Topbar.tsx → right slot | `SessionTopbarRight.tsx` | 自动保存状态 + Test 按钮 + 更多按钮 |
| ContentArea.tsx | `SessionContentView.tsx` | 内容显示区（sessionId 从 sessionStore 读取） |

## Plugin 注册

```ts
// plugins/sessionPage/index.ts
export const sessionPagePlugin: Plugin = {
  id: 'builtin.sessionPage',
  activate(ctx) {
    // 注册 page
    ctx.registerContribution({
      point: 'workbench.pages',
      page: { id: 'session', title: '会话', layout: {
        sidebar: { containerId: 'sessions-container' },
        content: { viewId: 'session-content' },
        auxiliary: { viewId: 'chat-panel' }
      }}
    })
    // 注册 content view
    ctx.registerContribution({ point: 'workbench.views', view: { id: 'session-content', title: '会话内容', component: SessionContentView } })
    // 注册 topbar
    ctx.registerContribution({ point: 'workbench.topbar', slot: 'left', pageId: 'session', component: SessionTopbarLeft })
    ctx.registerContribution({ point: 'workbench.topbar', slot: 'center', pageId: 'session', component: SessionTopbarCenter })
    ctx.registerContribution({ point: 'workbench.topbar', slot: 'right', pageId: 'session', component: SessionTopbarRight })
  }
}
```

## 关键改造

- `SessionTopbarLeft`：标题从 `MOCK_SESSIONS.find(s => s.id === getActiveSessionId())?.title` 读取（不再通过 props）
- `SessionContentView`：sessionId 从 `getActiveSessionId()` 读取（不再通过 props）
- 所有 antd 组件 + 内联样式保持不变

## 测试

`SessionContentView.test.tsx`：
- [ ] 渲染 sessionId 信息
- [ ] 渲染 Empty 占位

## 验收标准

- [ ] `npm run test` 全量通过
- [ ] `npm run typecheck` 通过
- [ ] 旧组件未删除（P2.5 统一清理）
