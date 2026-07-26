# Task 1.1 Brief — 新建 theme/tokens.ts + theme/cssVariables.ts

## 来源

PLAN Phase 1 Step 1.1

## 内容

新建 `desktop/renderer/src/theme/` 目录下两个文件：

### 1. `tokens.ts` — 唯一数据源

Plain TS 对象，分域组织。初值 = 代码库现状字面量（零视觉回归）。

#### color 域

| Token 名 | 值 | 来源 |
|----------|-----|------|
| `colorPrimary` | `'#2ed3b0'` | theme.ts colorPrimary / ChatPanelView avatar / SessionListView avatar / SessionTopbarRight check icon / index.css menu icon / handle hover |
| `colorLink` | `'#12a98c'` | theme.ts colorLink / index.css .step-active color |
| `colorTextBase` | `'#1b1f27'` | theme.ts colorTextBase / SessionContentView title / ChatPanelView title & roles / SessionListView title / SessionListView button bg |
| `colorTextSecondary` | `'#8a8f9c'` | theme.ts Menu itemColor / index.css .step / SessionListView footer |
| `colorBgLayout` | `'#eef0f7'` | theme.ts colorBgLayout |
| `colorBgPanel` | `'#ffffff'` | index.css .panel / theme.ts Menu itemSelectedBg |
| `colorBgPanelSunken` | `'#fafbfd'` | SessionContentView Card background |
| `colorBgActive` | `'#e4f7f1'` | index.css .step-active background |
| `colorShellGradientFrom` | `'#e9ecf6'` | index.css gradient 0% |
| `colorShellGradientVia` | `'#f4f5fa'` | index.css gradient 60% |
| `colorShellGradientTo` | `'#eef7f4'` | index.css gradient 100% |
| `colorHandleHover` | `'rgba(46, 211, 176, 0.25)'` | index.css .part-resize-handle:hover |
| `colorShadowPanel` | `'rgba(30, 40, 80, 0.06)'` | index.css .panel box-shadow |
| `colorShadowMenuItem` | `'rgba(30, 40, 80, 0.08)'` | index.css .ant-menu-item-selected box-shadow |
| `colorBgBubbleAi` | `'#e9f7f3'` | ChatPanelView AI bubble background |
| `colorBgBubbleUser` | `'#f2f3f7'` | ChatPanelView user bubble background |
| `colorBorderSubtle` | `'#eceef4'` | SessionListView footer border-top |
| `colorBgAvatar` | `'#e4e7f0'` | SessionListView footer avatar background |

#### font 域

| Token 名 | 值 | 来源 |
|----------|-----|------|
| `fontFamily` | `"-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif"` | theme.ts fontFamily |
| `fontSizeBase` | `14` | theme.ts fontSize |
| `fontSizeSmall` | `13` | index.css .step / SessionListView footer |
| `fontSizeSm` | `12` | SessionTopbarRight |
| `fontSizeMd` | `15` | SessionTopbarLeft |
| `fontSizeLg` | `16` | SessionListView title |

#### radius 域

| Token 名 | 值 | 来源 |
|----------|-----|------|
| `radiusPanel` | `16` | index.css .panel / theme.ts Card borderRadiusLG |
| `radiusControl` | `10` | theme.ts Menu itemBorderRadius / Button borderRadius / SessionListView Button |
| `radiusCard` | `16` | theme.ts Card borderRadiusLG（可 alias 到 radiusPanel） |
| `radiusAvatar` | `8` | SessionListView Avatar |
| `radiusMessage` | `12` | ChatPanelView Bubble content borderRadius |
| `radiusHandle` | `5` | ResizeHandle border-radius |

#### spacing 域

| Token 名 | 值 | 来源 |
|----------|-----|------|
| `spacingShellGap` | `12` | index.css .app-shell gap / .main-column gap / .main-row gap |
| `spacingShellPadding` | `12` | index.css .app-shell padding |

#### layout 域

| Token 名 | 值 | 来源 |
|----------|-----|------|
| `layoutTopbarHeight` | `56` | index.css .topbar height |
| `layoutSidebarDefault` | `232` | WorkbenchLayout PART_WIDTH_LIMITS |
| `layoutSidebarMin` | `180` | WorkbenchLayout PART_WIDTH_LIMITS |
| `layoutSidebarMax` | `480` | WorkbenchLayout PART_WIDTH_LIMITS |
| `layoutAuxiliaryDefault` | `400` | WorkbenchLayout PART_WIDTH_LIMITS |
| `layoutAuxiliaryMin` | `280` | WorkbenchLayout PART_WIDTH_LIMITS |
| `layoutAuxiliaryMax` | `640` | WorkbenchLayout PART_WIDTH_LIMITS |
| `layoutResizeHandleSize` | `10` | index.css .part-resize-handle width |

**结构约定**：tokens 整体导出为一个嵌套对象，如 `{ color: {...}, font: {...}, radius: {...}, spacing: {...}, layout: {...} }`。各 token 值保持原类型（颜色为 string，字号/尺寸为 number）。

### 2. `cssVariables.ts` — CSS 变量注入

- 导出一个函数 `applyCssVariables()`：遍历 tokens 对象，拍平为 `--ga-<域>-<名>` 格式的 CSS 自定义属性名，写入 `document.documentElement.style.setProperty(...)`。
- 命名规则：`--ga-` 前缀 + token 域 + `-` + camelCase token 名（如 `color.colorPrimary` → `--ga-color-colorPrimary`）。**不要**重复域前缀（不能变成 `--ga-color-colorPrimary` if we want `--ga-color-primary`）——等等，SPEC 说 `--ga-<域>-<名>`。域是 `color`，名是 `primary`，所以就是 `--ga-color-primary`。即 token 名 `primary` 而非 `colorPrimary`。
- **拍平规则**：token 对象键名去掉域前缀（因为域已经是 `--ga-` 后的第一段）。比如 `color.colorPrimary` → 域=`color`，去除域前缀后名=`primary` → `--ga-color-primary`。对于没有明确域前缀的 token 名（如 `color.handleHover` 中的 `handleHover` 不以 `color` 开头），直接使用即可：`--ga-color-handleHover`。

等等，让我们重新考虑。SPEC 说 `--ga-<域>-<名>`，域就是 `color/font/radius/spacing/layout`，名就是各个 token 的 key。但有些 key 带域前缀（`colorPrimary`），有些不带（`handleHover`）。为了统一，采用以下规则：

**命名规则**：token 对象的 key 作为 CSS 变量名的基础。将 camelCase 转为 kebab-case，然后拼成 `--ga-<域>-<kebab名>`。例如：
- `color.primary` → `--ga-color-primary`
- `color.textBase` → `--ga-color-text-base`
- `color.shellGradientFrom` → `--ga-color-shell-gradient-from`
- `layout.topbarHeight` → `--ga-layout-topbar-height`
- `font.fontSizeBase` → `--ga-font-font-size-base` （这里 font 重复了，但按规则来就行）

**注意**：token 的 key 应该**不带域前缀**，因为域已经是上层 key 了。也就是说 tokens 对象应该是：

```ts
{
  color: {
    primary: '#2ed3b0',
    link: '#12a98c',
    textBase: '#1b1f27',
    // ...
  },
  font: {
    family: '...',
    sizeBase: 14,
    // ...
  }
}
```

这样 `applyCssVariables()` 拍平为 `--ga-color-primary`、`--ga-font-size-base` 等，命名干净无冗余。

`applyCssVariables()` 在 `main.tsx` 启动时调用（Step 1.2 做，但本 Step 只需导出该函数）。

## 测试要求

按照 test-driven-development skill：
1. 先写测试，看着它 RED（失败）
2. 再实现，转 GREEN

### 测试文件：`desktop/renderer/src/theme/tokens.test.ts`

测试内容：
- tokens 对象包含五个域：`color`、`font`、`radius`、`spacing`、`layout`
- 每个域的 key 值非空
- 关键 token 值与预期字面量一致（抽查 colorPrimary、colorTextBase、fontSizeBase、layoutTopbarHeight 等）

### 测试文件：`desktop/renderer/src/theme/cssVariables.test.ts`

测试内容：
- `applyCssVariables()` 调用后，`:root` 上设置了对应 CSS 变量
- 验证命名格式为 `--ga-<域>-<小写kebab名>`（如 `--ga-color-primary`）
- 值类型正确（颜色为 string 带引号，数值为 number 转 px 或不带单位等——CSS 变量存储原始值即可）

**注意**：`radiusCard` 与 `radiusPanel` 都是 16，是否合并为一个 token？由你判断——如果语义相同（都指面板圆角），合并为 `radiusPanel` 即可，card 圆角引用同值。

## 开始之前

如果你对以上任何一点有疑问——值来源、命名规则、文件结构——现在就问。开始动手之前把疑虑都提出来。

## 验收

- [ ] 映射单测通过（每个 token 都有对应 CSS 变量，命名符合 `--ga-<域>-<kebab名>`）
