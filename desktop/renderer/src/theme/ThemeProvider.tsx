import React, { useEffect, useMemo, useSyncExternalStore } from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { getThemeStore } from './themeStore'
import { buildThemeConfig } from './themeConfig'
import { applyCurrentTheme, resolveTokens } from './cssVariables'
import type { ThemeState } from './themeStore'

interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * 订阅 themeStore，derive antd ThemeConfig，渲染 ConfigProvider。
 * 切换主题时重放 CSS 变量 + 更新 ConfigProvider。
 */
export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const themeState = useSyncExternalStore<ThemeState>(
    (callback) => {
      const d = getThemeStore().onDidChange(callback)
      return () => d.dispose()
    },
    () => getThemeStore().getTheme()
  )

  // 主题切换时重放 CSS 变量（副作用；初始 set 已在 main.tsx 中同步完成）
  useEffect(() => {
    applyCurrentTheme()
  }, [themeState])

  const config = useMemo(() => {
    return buildThemeConfig(
      resolveTokens(themeState.themeId, themeState.mode),
      themeState.mode,
      themeState.themeId
    )
  }, [themeState])

  return (
    <ConfigProvider locale={zhCN} theme={config}>
      {children}
    </ConfigProvider>
  )
}
