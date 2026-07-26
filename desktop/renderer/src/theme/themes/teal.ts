import type { ThemeTokens } from '../tokens'

export const teal: { light: ThemeTokens; dark: ThemeTokens } = {
  light: {
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
      bgBubbleAi: '#e9f7f3',
      bgBubbleUser: '#f2f3f7',
      borderSubtle: '#eceef4',
      bgAvatar: '#e4e7f0',
      shade30: '#d4d4d8',
      shade40: '#a1a1aa',
      shade50: '#71717a',
      shade60: '#52525b',
      shade70: '#3f3f46',
      accent: '#e4f7f1'
    },

    font: {
      family:
        "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif",
      sizeBase: 14,
      sizeSmall: 13,
      sizeSm: 12,
      sizeMd: 15,
      sizeLg: 16,
      weightRegular: 400,
      weightMedium: 500,
      weightStrong: 600,
      lineHeightBase: 1.5
    },

    radius: {
      panel: 16,
      control: 10,
      card: 16,
      avatar: 8,
      message: 12,
      handle: 5,
      pill: 999
    },

    spacing: {
      shellGap: 12,
      shellPadding: 12,
      xxs: 2,
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
      huge: 64
    },

    shadow: {
      panel: '0 4px 24px rgba(30, 40, 80, 0.06)',
      menuItem: '0 2px 10px rgba(30, 40, 80, 0.08)'
    }
  },

  // teal dark — 按语义槽位从 light 反推：保持 primary 不变，背景深色化、文字浅色化
  dark: {
    color: {
      primary: '#2ed3b0',
      link: '#12a98c',
      textBase: '#e1e3e8',
      textSecondary: '#8a8f9c',
      bgLayout: '#16181d',
      bgPanel: '#1e2128',
      bgPanelSunken: '#191b21',
      bgActive: '#1a3a30',
      shellGradientFrom: '#13151a',
      shellGradientVia: '#181a20',
      shellGradientTo: '#151c19',
      handleHover: 'rgba(46, 211, 176, 0.15)',
      bgBubbleAi: '#1a2d28',
      bgBubbleUser: '#1e1f24',
      borderSubtle: '#2a2d35',
      bgAvatar: '#2a2d35',
      shade30: '#3f3f46',
      shade40: '#52525b',
      shade50: '#71717a',
      shade60: '#a1a1aa',
      shade70: '#d4d4d8',
      accent: '#1a3a30'
    },

    font: {
      family:
        "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif",
      sizeBase: 14,
      sizeSmall: 13,
      sizeSm: 12,
      sizeMd: 15,
      sizeLg: 16,
      weightRegular: 400,
      weightMedium: 500,
      weightStrong: 600,
      lineHeightBase: 1.5
    },

    radius: {
      panel: 16,
      control: 10,
      card: 16,
      avatar: 8,
      message: 12,
      handle: 5,
      pill: 999
    },

    spacing: {
      shellGap: 12,
      shellPadding: 12,
      xxs: 2,
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
      huge: 64
    },

    shadow: {
      panel: '0 4px 24px rgba(0, 0, 0, 0.3)',
      menuItem: '0 2px 10px rgba(0, 0, 0, 0.25)'
    }
  }
}
