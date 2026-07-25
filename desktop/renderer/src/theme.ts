import type { ThemeConfig } from 'antd'

// 设计 token 提取自 prototype/ 下的 HiAgents（2025 iF UX 获奖作品）界面：
// 浅色通透基底 + 白色悬浮圆角面板 + 薄荷青主色 + 近黑深色强调。
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#2ed3b0',
    colorInfo: '#2ed3b0',
    colorLink: '#12a98c',
    colorTextBase: '#1b1f27',
    colorBgLayout: '#eef0f7',
    borderRadius: 10,
    fontSize: 14,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif"
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
