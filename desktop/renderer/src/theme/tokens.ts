/**
 * 设计 token 类型定义 + 跨主题不变量。
 *
 * ThemeTokens 接口：五域（color / font / radius / spacing / shadow），
 * 每套主题 { light, dark } 各提供一套 ThemeTokens。
 * layout 域跨主题不变，单独导出。
 */

// ── ThemeTokens ──────────────────────────────────────────────

export interface ThemeTokens {
  color: {
    primary: string
    link: string
    textBase: string
    textSecondary: string
    bgLayout: string
    bgPanel: string
    bgPanelSunken: string
    bgActive: string
    shellGradientFrom: string
    shellGradientVia: string
    shellGradientTo: string
    handleHover: string
    bgBubbleAi: string
    bgBubbleUser: string
    borderSubtle: string
    bgAvatar: string
    shade30: string
    shade40: string
    shade50: string
    shade60: string
    shade70: string
    accent: string
  }

  font: {
    family: string
    sizeBase: number
    sizeSmall: number
    sizeSm: number
    sizeMd: number
    sizeLg: number
    weightRegular: number
    weightMedium: number
    weightStrong: number
    lineHeightBase: number
  }

  radius: {
    panel: number
    control: number
    card: number
    avatar: number
    message: number
    handle: number
    pill: number
  }

  spacing: {
    shellGap: number
    shellPadding: number
    xxs: number
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
    huge: number
  }

  shadow: {
    panel: string
    menuItem: string
  }
}

// ── layout — 跨主题不变量 ────────────────────────────────────

export const layout = {
  topbarHeight: 56,
  sidebarDefault: 232,
  sidebarMin: 180,
  sidebarMax: 480,
  auxiliaryDefault: 400,
  auxiliaryMin: 280,
  auxiliaryMax: 640,
  resizeHandleSize: 10
} as const

// ── 过渡兼容导出（P1 期间保留，Step 2.3 移除）────────────────
// 已移除。所有消费者已迁移至 ThemeTokens 参数化接口。
