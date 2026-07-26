import { describe, it, expect } from 'vitest'
import { themeConfig } from './themeConfig'

describe('themeConfig', () => {
  it('token 层派生值与旧 theme.ts 逐字段等价', () => {
    const t = themeConfig.token!

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
    const m = themeConfig.components?.Menu

    expect(m).toBeDefined()
    expect(m!.itemSelectedBg).toBe('#ffffff')
    expect(m!.itemSelectedColor).toBe('#1b1f27')
    expect(m!.itemColor).toBe('#8a8f9c')
    expect(m!.itemBorderRadius).toBe(10)
    expect(m!.itemMarginInline).toBe(12)
    expect(m!.itemHeight).toBe(40)
  })

  it('components.Button 派生值等价', () => {
    const b = themeConfig.components?.Button

    expect(b).toBeDefined()
    expect(b!.borderRadius).toBe(10)
    expect(b!.controlHeight).toBe(36)
  })

  it('components.Card 派生值等价', () => {
    const c = themeConfig.components?.Card

    expect(c).toBeDefined()
    expect(c!.borderRadiusLG).toBe(16)
  })
})
