import type { ThemeConfig } from 'antd'
import { theme } from 'antd'
import type { ThemeTokens } from './tokens'
import type { ThemeId, ThemeMode } from './themeStore'

/**
 * 从 ThemeTokens + mode + themeId 派生 antd ThemeConfig。
 *
 * - mode === 'dark' 时叠加 theme.darkAlgorithm
 * - themeId 供 per-theme 组件覆盖（Step 3.4 shopify pill 等）
 */
export function buildThemeConfig(
  tokens: ThemeTokens,
  mode: ThemeMode,
  _themeId: ThemeId
): ThemeConfig {
  const config: ThemeConfig = {
    token: {
      colorPrimary: tokens.color.primary,
      colorInfo: tokens.color.primary,
      colorLink: tokens.color.link,
      colorTextBase: tokens.color.textBase,
      colorBgLayout: tokens.color.bgLayout,
      borderRadius: tokens.radius.control,
      fontSize: tokens.font.sizeBase,
      fontFamily: tokens.font.family
    },
    components: {
      Menu: {
        itemSelectedBg: tokens.color.bgPanel,
        itemSelectedColor: tokens.color.textBase,
        itemColor: tokens.color.textSecondary,
        itemBorderRadius: tokens.radius.control,
        itemMarginInline: tokens.spacing.shellGap,
        itemHeight: 40
      },
      Button: {
        borderRadius: tokens.radius.control,
        controlHeight: 36
      },
      Card: {
        borderRadiusLG: tokens.radius.panel
      }
    }
  }

  if (mode === 'dark') {
    config.algorithm = theme.darkAlgorithm
  }

  return config
}
