import { describe, it, expect } from 'vitest'
import { buildThemeConfig } from './themeConfig'
import { teal } from './themes/teal'
import { shopify } from './themes/shopify'

describe('buildThemeConfig', () => {
  const tealLight = teal.light

  it('token 层派生值与旧 theme.ts 逐字段等价', () => {
    const cfg = buildThemeConfig(tealLight, 'light', 'teal')
    const t = cfg.token!

    expect(t.colorPrimary).toBe('#2ed3b0')
    expect(t.colorInfo).toBe('#2ed3b0')
    expect(t.colorLink).toBe('#12a98c')
    expect(t.colorTextBase).toBe('#1b1f27')
    expect(t.colorBgLayout).toBe('#eef0f7')
    expect(t.borderRadius).toBe(10)
    expect(t.fontSize).toBe(14)
    expect(t.fontFamily).toBe(
      "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif"
    )
  })

  it('components.Menu 派生值等价', () => {
    const cfg = buildThemeConfig(tealLight, 'light', 'teal')
    const m = cfg.components?.Menu

    expect(m).toBeDefined()
    expect(m!.itemSelectedBg).toBe('#ffffff')
    expect(m!.itemSelectedColor).toBe('#1b1f27')
    expect(m!.itemColor).toBe('#8a8f9c')
    expect(m!.itemBorderRadius).toBe(10)
    expect(m!.itemMarginInline).toBe(12)
    expect(m!.itemHeight).toBe(40)
  })

  it('components.Button 派生值等价', () => {
    const cfg = buildThemeConfig(tealLight, 'light', 'teal')
    const b = cfg.components?.Button

    expect(b).toBeDefined()
    expect(b!.borderRadius).toBe(10)
    expect(b!.controlHeight).toBe(36)
  })

  it('components.Card 派生值等价', () => {
    const cfg = buildThemeConfig(tealLight, 'light', 'teal')
    const c = cfg.components?.Card

    expect(c).toBeDefined()
    expect(c!.borderRadiusLG).toBe(16)
  })

  it('dark 模式叠加 darkAlgorithm', () => {
    const cfg = buildThemeConfig(teal.dark, 'dark', 'teal')
    expect(cfg.algorithm).toBeDefined()
  })

  it('light 模式不叠加 darkAlgorithm', () => {
    const cfg = buildThemeConfig(tealLight, 'light', 'teal')
    expect(cfg.algorithm).toBeUndefined()
  })

  describe('per-theme 组件覆盖', () => {
    it('shopify 主题按钮为 pill (borderRadius = 999)', () => {
      const cfg = buildThemeConfig(shopify.light, 'light', 'shopify')
      expect(cfg.components?.Button?.borderRadius).toBe(999)
    })

    it('teal 主题按钮保持现有 borderRadius = 10', () => {
      const cfg = buildThemeConfig(tealLight, 'light', 'teal')
      expect(cfg.components?.Button?.borderRadius).toBe(10)
    })

    it('shopify 主题 Card borderRadiusLG = 12', () => {
      const cfg = buildThemeConfig(shopify.light, 'light', 'shopify')
      expect(cfg.components?.Card?.borderRadiusLG).toBe(12)
    })

    it('teal 主题 Card borderRadiusLG = 16', () => {
      const cfg = buildThemeConfig(tealLight, 'light', 'teal')
      expect(cfg.components?.Card?.borderRadiusLG).toBe(16)
    })

    it('shopify 全局 borderRadius = 8', () => {
      const cfg = buildThemeConfig(shopify.light, 'light', 'shopify')
      expect(cfg.token?.borderRadius).toBe(8)
    })
  })
})
