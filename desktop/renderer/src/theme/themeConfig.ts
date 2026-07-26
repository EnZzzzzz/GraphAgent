import type { ThemeConfig } from 'antd'
import { tokens } from './tokens'

/**
 * antd ThemeConfig，从 tokens 派生。
 * 替代旧的 `desktop/renderer/src/theme.ts`。
 */
export const themeConfig: ThemeConfig = {
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
      itemHeight: 40 // 纯组件内部尺寸，非设计基调，不映射 token
    },
    Button: {
      borderRadius: tokens.radius.control,
      controlHeight: 36 // 纯组件内部尺寸，保留硬编码
    },
    Card: {
      borderRadiusLG: tokens.radius.panel
    }
  }
}
