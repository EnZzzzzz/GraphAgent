import React, { useSyncExternalStore } from 'react'
import { Button, Tooltip } from '../../ui'
import { BgColorsOutlined } from '../../ui/icons'
import { getThemeStore } from '../../theme/themeStore'
import type { ThemeState, ThemeId, ThemeMode } from '../../theme/themeStore'

const THEME_CYCLE: Array<{ themeId: ThemeId; mode: ThemeMode; label: string }> = [
  { themeId: 'teal', mode: 'light', label: 'Teal · Light' },
  { themeId: 'teal', mode: 'dark', label: 'Teal · Dark' },
  { themeId: 'shopify', mode: 'light', label: 'Shopify · Light' },
  { themeId: 'shopify', mode: 'dark', label: 'Shopify · Dark' }
]

export function ThemeSwitcher(): JSX.Element {
  const themeState = useSyncExternalStore<ThemeState>(
    (callback) => {
      const d = getThemeStore().onDidChange(callback)
      return () => d.dispose()
    },
    () => getThemeStore().getTheme()
  )

  const currentIndex = THEME_CYCLE.findIndex(
    (t) => t.themeId === themeState.themeId && t.mode === themeState.mode
  )

  const handleCycle = (): void => {
    const next = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length]
    getThemeStore().setTheme(next.themeId, next.mode)
  }

  const currentLabel = THEME_CYCLE[currentIndex]?.label ?? 'Theme'

  return (
    <Tooltip title={`切换主题 (当前: ${currentLabel})`}>
      <Button
        type="text"
        size="small"
        icon={<BgColorsOutlined />}
        onClick={handleCycle}
        aria-label="切换主题"
      />
    </Tooltip>
  )
}
