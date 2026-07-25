# Step 1.5 brief — PluginHost

## 任务

创建 `desktop/renderer/src/workbench/pluginHost.ts`：统一 activate 内置插件列表，管理 Disposable 聚合。含单测。

## 背景

已有 types.ts（Plugin/PluginContext 类型）、registry.ts（Registry 单例）、emitter.ts（Disposable）。

## API 设计

```ts
import { Disposable } from './emitter'
import type { Plugin } from './types'

export class PluginHost {
  /**
   * 依次 activate 所有插件，返回聚合 Disposable。
   *
   * - 为每个插件构造 PluginContext：{ registerContribution }
   * - registerContribution 委托给 Registry.instance
   * - activate() 返回值：Disposable → 收集；Disposable[] → 展开收集；void → 跳过
   * - 单个插件 activate 抛异常 → 记录错误但继续 activate 后续插件（不阻断）
   * - 返回的 aggregate Dispose 时按 activate 逆序 dispose 所有收集的 Disposable
   * - 如果 activate 列表为空，返回 no-op Disposable
   */
  activateBuiltin(plugins: Plugin[]): Disposable
}
```

### 行为约束

1. 每个 plugin 获得 PluginContext：`{ registerContribution: (c) => Registry.instance.registerContribution(c) }`
2. activate 返回值处理：
   - `Disposable` → 收集
   - `Disposable[]` → 逐个收集
   - `void` / `undefined` → 跳过
3. 异常处理：try-catch 每个 plugin，异常不阻断后续 plugin
4. 聚合 dispose：逆序调用所有收集的 Disposable.dispose()（后 activate 先 dispose）
5. 聚合 dispose 期间某 Disposable 抛异常：记录但不阻断（继续 dispose 剩余）
6. 允许多次调用 `activateBuiltin`，每次的返回独立聚合（不共享状态）

## 单测

`desktop/renderer/src/workbench/pluginHost.test.ts`，使用 `vi.fn()` mock plugin：

- [ ] 单个 plugin activate 被调用，收到 PluginContext
- [ ] PluginContext.registerContribution 将贡献注册到 Registry
- [ ] activate 返回 Disposable — 聚合 dispose 时该 Disposable.dispose() 被调用
- [ ] activate 返回 Disposable[] — 全部在聚合 dispose 时被调用
- [ ] activate 返回 void — 无异常
- [ ] 多个插件：全部 activate 被调用
- [ ] 一个 plugin activate 抛异常：后续 plugin 仍被 activate
- [ ] 聚合 dispose 逆序调用
- [ ] 聚合 dispose 中某 Disposable.dispose() 抛异常：其余仍被 dispose
- [ ] activateBuiltin([]) 返回 no-op Disposable（dispose() 不抛异常）
- [ ] deactivate() 钩子不会被 PluginHost 自动调用（那是 lifecycle 管理，不在此 Step）

## 验收标准

- [ ] 所有单测通过
- [ ] `npm run typecheck` 通过
- [ ] `npm run test` 全量通过
- [ ] pluginHost.ts 不 import 任何业务代码

## 完成标准之外不要做的

- 不要实现插件的动态加载、延迟 activate、条件 activate
- 不要在 PluginHost 中调用 deactivate()（那是上层逻辑）
