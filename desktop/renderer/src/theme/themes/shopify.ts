import type { ThemeTokens } from '../tokens'

export const shopify: { light: ThemeTokens; dark: ThemeTokens } = {
  light: {
    color: {
      primary: '#000000',
      link: '#000000',
      textBase: '#000000',
      textSecondary: '#71717a',
      bgLayout: '#fbfbf5',
      bgPanel: '#ffffff',
      bgPanelSunken: '#f5f5f0',
      bgActive: '#c1fbd4',
      shellGradientFrom: '#fbfbf5',
      shellGradientVia: '#fbfbf5',
      shellGradientTo: '#fbfbf5',
      handleHover: 'rgba(0, 0, 0, 0.08)',
      bgBubbleAi: '#d4f9e0',
      bgBubbleUser: '#d4d4d8',
      borderSubtle: '#e4e4e7',
      bgAvatar: '#d4d4d8',
      shade30: '#d4d4d8',
      shade40: '#a1a1aa',
      shade50: '#71717a',
      shade60: '#52525b',
      shade70: '#3f3f46',
      accent: '#c1fbd4'
    },

    font: {
      family: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      sizeBase: 14,
      sizeSmall: 13,
      sizeSm: 12,
      sizeMd: 15,
      sizeLg: 16,
      weightRegular: 420,
      weightMedium: 500,
      weightStrong: 550,
      lineHeightBase: 1.5
    },

    radius: {
      panel: 12,
      control: 999,
      card: 12,
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
      // Level 3: stacked tiny shadows
      panel:
        '0 8px 8px rgba(0,0,0,0.1), 0 4px 4px rgba(0,0,0,0.1), 0 2px 2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.1)',
      menuItem: '0 2px 10px rgba(0, 0, 0, 0.08)'
    }
  },

  // shopify dark — canvas-night 轨；绿色不上暗轨（DESIGN.md 禁令）
  dark: {
    color: {
      primary: '#ffffff',
      link: '#ffffff',
      textBase: '#ffffff',
      textSecondary: '#71717a',
      bgLayout: '#000000',
      bgPanel: '#0a0a0a',
      bgPanelSunken: '#000000',
      bgActive: '#1e2c31',
      shellGradientFrom: '#000000',
      shellGradientVia: '#000000',
      shellGradientTo: '#000000',
      handleHover: 'rgba(255, 255, 255, 0.08)',
      bgBubbleAi: '#1e2c31',
      bgBubbleUser: '#3f3f46',
      borderSubtle: '#1e2c31',
      bgAvatar: '#1e2c31',
      shade30: '#d4d4d8',
      shade40: '#a1a1aa',
      shade50: '#71717a',
      shade60: '#52525b',
      shade70: '#3f3f46',
      accent: '#1e2c31'
    },

    font: {
      family: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      sizeBase: 14,
      sizeSmall: 13,
      sizeSm: 12,
      sizeMd: 15,
      sizeLg: 16,
      weightRegular: 420,
      weightMedium: 500,
      weightStrong: 550,
      lineHeightBase: 1.5
    },

    radius: {
      panel: 12,
      control: 999,
      card: 12,
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
      // Level 1: subtle inset top-edge highlight, no drop shadow
      panel:
        '0 1px 2px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
      menuItem: '0 1px 2px rgba(255, 255, 255, 0.05)'
    }
  }
}
