/**
 * 设计 token 唯一数据源。
 * 分域组织，初值 = 代码库现状字面量（零视觉回归）。
 * token 的 key 不带域前缀（如 color.primary），因为域已是上层 key。
 */
export const tokens = {
  color: {
    primary: '#2ed3b0',
    link: '#12a98c',
    textBase: '#1b1f27',
    textSecondary: '#8a8f9c',
    bgLayout: '#eef0f7',
    bgPanel: '#ffffff',
    bgPanelSunken: '#fafbfd',
    bgActive: '#e4f7f1',
    shellGradientFrom: '#e9ecf6',
    shellGradientVia: '#f4f5fa',
    shellGradientTo: '#eef7f4',
    handleHover: 'rgba(46, 211, 176, 0.25)',
    shadowPanel: 'rgba(30, 40, 80, 0.06)',
    shadowMenuItem: 'rgba(30, 40, 80, 0.08)',
    bgBubbleAi: '#e9f7f3',
    bgBubbleUser: '#f2f3f7',
    borderSubtle: '#eceef4',
    bgAvatar: '#e4e7f0'
  },

  font: {
    family:
      "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif",
    sizeBase: 14,
    sizeSmall: 13,
    sizeSm: 12,
    sizeMd: 15,
    sizeLg: 16
  },

  radius: {
    panel: 16,
    control: 10,
    card: 16,
    avatar: 8,
    message: 12,
    handle: 5
  },

  spacing: {
    shellGap: 12,
    shellPadding: 12
  },

  layout: {
    topbarHeight: 56,
    sidebarDefault: 232,
    sidebarMin: 180,
    sidebarMax: 480,
    auxiliaryDefault: 400,
    auxiliaryMin: 280,
    auxiliaryMax: 640,
    resizeHandleSize: 10
  }
} as const

export type Tokens = typeof tokens
