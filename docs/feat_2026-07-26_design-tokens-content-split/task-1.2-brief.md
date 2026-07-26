# Task 1.2 Brief — applyCssVariables 集成 + themeConfig 派生

## 来源

PLAN Phase 1 Step 1.2

## 内容

### 1. `main.tsx` — 启动时调用 `applyCssVariables()`

在 `desktop/renderer/src/main.tsx` 中，`ReactDOM.createRoot(...)` 之前调用：

```ts
import { applyCssVariables } from './theme/cssVariables'
applyCssVariables()
```

### 2. 新建 `desktop/renderer/src/theme/themeConfig.ts`

从 `tokens` 派生 antd `ThemeConfig`，完全替代当前 `desktop/renderer/src/theme.ts` 的内容。

当前 `theme.ts` 的内容：

```ts
import type { ThemeConfig } from 'antd'

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#2ed3b0',
    colorInfo: '#2ed3b0',
    colorLink: '#12a98c',
    colorTextBase: '#1b1f27',
    colorBgLayout: '#eef0f7',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif"
  },
  components: {
    Menu: {
      itemSelectedBg: '#ffffff',
      itemSelectedColor: '#1b1f27',
      itemColor: '#8a8f9c',
      itemBorderRadius: 10,
      itemMarginInline: 12,
      itemHeight: 40
    },
    Button: {
      borderRadius: 10,
      controlHeight: 36
    },
    Card: {
      borderRadiusLG: 16
    }
  }
}
```

新的 `theme/themeConfig.ts` 必须从 `tokens` 对象引用值（而非硬编码字面量），保证派生等价：

| 旧 theme.ts 字段 | 新来源 |
|------------------|--------|
| `colorPrimary: '#2ed3b0'` | `tokens.color.primary` |
| `colorInfo: '#2ed3b0'` | `tokens.color.primary` |
| `colorLink: '#12a98c'` | `tokens.color.link` |
| `colorTextBase: '#1b1f27'` | `tokens.color.textBase` |
| `colorBgLayout: '#eef0f7'` | `tokens.color.bgLayout` |
| `borderRadius: 10` | `tokens.radius.control` |
| `fontSize: 14` | `tokens.font.sizeBase` |
| `fontFamily: ...` | `tokens.font.family` |
| Menu `itemSelectedBg: '#ffffff'` | `tokens.color.bgPanel` |
| Menu `itemSelectedColor: '#1b1f27'` | `tokens.color.textBase` |
| Menu `itemColor: '#8a8f9c'` | `tokens.color.textSecondary` |
| Menu `itemBorderRadius: 10` | `tokens.radius.control` |
| Menu `itemMarginInline: 12` | `tokens.spacing.shellGap` |
| Menu `itemHeight: 40` | 无对应 token，保留硬编码 40（纯组件内部尺寸，非设计基调） |
| Button `borderRadius: 10` | `tokens.radius.control` |
| Button `controlHeight: 36` | 无对应 token，保留硬编码 36 |
| Card `borderRadiusLG: 16` | `tokens.radius.panel` |

### 3. 删除旧 `theme.ts`

删除 `desktop/renderer/src/theme.ts`，`main.tsx` 的 import 改为 `./theme/themeConfig`。

### 4. 更新 `main.tsx` 的 import

从：
```ts
import { themeConfig } from './theme'
```
改为：
```ts
import { themeConfig } from './theme/themeConfig'
```

## 测试要求

### 测试文件：`desktop/renderer/src/theme/themeConfig.test.ts`

验证 `themeConfig` 派生值与原 `theme.ts` 逐字段等价：

- `themeConfig.token.colorPrimary` === `'#2ed3b0'`
- `themeConfig.token.colorInfo` === `'#2ed3b0'`
- `themeConfig.token.colorLink` === `'#12a98c'`
- `themeConfig.token.colorTextBase` === `'#1b1f27'`
- `themeConfig.token.colorBgLayout` === `'#eef0f7'`
- `themeConfig.token.borderRadius` === 10
- `themeConfig.token.fontSize` === 14
- `themeConfig.token.fontFamily` === 原值
- `themeConfig.components.Menu.itemSelectedBg` === `'#ffffff'`
- `themeConfig.components.Menu.itemSelectedColor` === `'#1b1f27'`
- `themeConfig.components.Menu.itemColor` === `'#8a8f9c'`
- `themeConfig.components.Menu.itemBorderRadius` === 10
- `themeConfig.components.Menu.itemMarginInline` === 12
- `themeConfig.components.Menu.itemHeight` === 40
- `themeConfig.components.Button.borderRadius` === 10
- `themeConfig.components.Button.controlHeight` === 36
- `themeConfig.components.Card.borderRadiusLG` === 16

TDD 流程：先写测试 → RED（themeConfig 文件不存在）→ 实现 → GREEN。

## 验收

- [ ] 派生值与原配置逐字段等价的单测通过
- [ ] typecheck 绿
- [ ] 全量 test 绿（旧 `theme.ts` 删除后，main.tsx 等其他文件的 import 已正确更新）
