# Step 1.5 Report — PluginHost

## 实现了什么

`desktop/renderer/src/workbench/pluginHost.ts`：
- `activateBuiltin(plugins)` 构造 PluginContext（委托 Registry.instance）
- Disposable 聚合：单/数组/void 三种返回值处理
- 错误隔离：单个 plugin 抛异常不阻断后续
- 逆序 dispose
- dispose 错误隔离

## TDD 证据

- RED: 测试先行，模块缺失
- GREEN: 实现后 9/9 passing

## 测试结果

```
✓ desktop/renderer/src/workbench/pluginHost.test.ts (9 tests)
```

## 改动文件

- `desktop/renderer/src/workbench/pluginHost.ts`
- `desktop/renderer/src/workbench/pluginHost.test.ts`
