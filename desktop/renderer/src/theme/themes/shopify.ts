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

  // shopify dark — 占位，Step 3.2 定义
  dark: {} as ThemeTokens
}
