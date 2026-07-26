import { describe, it, expect } from 'vitest'
import { layout } from './tokens'
import { teal } from './themes/teal'
import { shopify } from './themes/shopify'

const tokens = teal.light

describe('tokens (teal light — 过渡导出)', () => {
  it('包含全部五个域', () => {
    expect(tokens).toHaveProperty('color')
    expect(tokens).toHaveProperty('font')
    expect(tokens).toHaveProperty('radius')
    expect(tokens).toHaveProperty('spacing')
    expect(tokens).toHaveProperty('shadow')
  })

  describe('color 域', () => {
    it('包含所有必收颜色 token', () => {
      const c = tokens.color
      expect(c.primary).toBe('#2ed3b0')
      expect(c.link).toBe('#12a98c')
      expect(c.textBase).toBe('#1b1f27')
      expect(c.textSecondary).toBe('#8a8f9c')
      expect(c.bgLayout).toBe('#eef0f7')
      expect(c.bgPanel).toBe('#ffffff')
      expect(c.bgPanelSunken).toBe('#fafbfd')
      expect(c.bgActive).toBe('#e4f7f1')
      expect(c.shellGradientFrom).toBe('#e9ecf6')
      expect(c.shellGradientVia).toBe('#f4f5fa')
      expect(c.shellGradientTo).toBe('#eef7f4')
      expect(c.handleHover).toBe('rgba(46, 211, 176, 0.25)')
      expect(c.bgBubbleAi).toBe('#e9f7f3')
      expect(c.bgBubbleUser).toBe('#f2f3f7')
      expect(c.borderSubtle).toBe('#eceef4')
      expect(c.bgAvatar).toBe('#e4e7f0')
      // 新增
      expect(c.shade30).toBe('#d4d4d8')
      expect(c.shade40).toBe('#a1a1aa')
      expect(c.shade50).toBe('#71717a')
      expect(c.shade60).toBe('#52525b')
      expect(c.shade70).toBe('#3f3f46')
      expect(c.accent).toBe('#e4f7f1')
    })
  })

  describe('font 域', () => {
    it('包含所有字号与字体族 token', () => {
      const f = tokens.font
      expect(f.family).toBe("-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Inter', 'Helvetica Neue', 'Segoe UI', sans-serif")
      expect(f.sizeBase).toBe(14)
      expect(f.sizeSmall).toBe(13)
      expect(f.sizeSm).toBe(12)
      expect(f.sizeMd).toBe(15)
      expect(f.sizeLg).toBe(16)
      // 新增
      expect(f.weightRegular).toBe(400)
      expect(f.weightMedium).toBe(500)
      expect(f.weightStrong).toBe(600)
      expect(f.lineHeightBase).toBe(1.5)
    })
  })

  describe('radius 域', () => {
    it('包含所有圆角 token', () => {
      const r = tokens.radius
      expect(r.panel).toBe(16)
      expect(r.control).toBe(10)
      expect(r.card).toBe(16)
      expect(r.avatar).toBe(8)
      expect(r.message).toBe(12)
      expect(r.handle).toBe(5)
      expect(r.pill).toBe(999)
    })
  })

  describe('spacing 域', () => {
    it('包含间距 token', () => {
      const s = tokens.spacing
      expect(s.shellGap).toBe(12)
      expect(s.shellPadding).toBe(12)
      expect(s.xxs).toBe(2)
      expect(s.xs).toBe(4)
      expect(s.sm).toBe(8)
      expect(s.md).toBe(12)
      expect(s.lg).toBe(16)
      expect(s.xl).toBe(24)
      expect(s.xxl).toBe(32)
      expect(s.huge).toBe(64)
    })
  })

  describe('shadow 域', () => {
    it('包含完整 box-shadow 字符串（含几何 + 颜色）', () => {
      const s = tokens.shadow
      expect(s.panel).toBe('0 4px 24px rgba(30, 40, 80, 0.06)')
      expect(s.menuItem).toBe('0 2px 10px rgba(30, 40, 80, 0.08)')
    })
  })
})

describe('layout（跨主题不变量）', () => {
  it('包含所有布局尺寸 token', () => {
    expect(layout.topbarHeight).toBe(56)
    expect(layout.sidebarDefault).toBe(232)
    expect(layout.sidebarMin).toBe(180)
    expect(layout.sidebarMax).toBe(480)
    expect(layout.auxiliaryDefault).toBe(400)
    expect(layout.auxiliaryMin).toBe(280)
    expect(layout.auxiliaryMax).toBe(640)
    expect(layout.resizeHandleSize).toBe(10)
  })
})

describe('teal dark', () => {
  it('ThemeTokens 全字段有值，无遗漏', () => {
    const t = teal.dark

    // 每个域都存在
    expect(t.color).toBeDefined()
    expect(t.font).toBeDefined()
    expect(t.radius).toBeDefined()
    expect(t.spacing).toBeDefined()
    expect(t.shadow).toBeDefined()

    // color 域 — 全字段非空字符串
    const colorKeys = Object.keys(t.color) as (keyof typeof t.color)[]
    expect(colorKeys.length).toBe(22) // 16 original + 6 new (shade30-70 + accent) - 2 (shadowPanel/MenuItem migrated) + 6  = wait, let's count
    // primary, link, textBase, textSecondary, bgLayout, bgPanel, bgPanelSunken, bgActive,
    // shellGradientFrom, shellGradientVia, shellGradientTo, handleHover,
    // bgBubbleAi, bgBubbleUser, borderSubtle, bgAvatar = 16
    // shade30, shade40, shade50, shade60, shade70, accent = 6
    // Total = 22
    for (const k of colorKeys) {
      const v = t.color[k]
      expect(typeof v, `color.${k} should be string`).toBe('string')
      expect(v.length, `color.${k} should be non-empty`).toBeGreaterThan(0)
    }

    // font 域
    expect(typeof t.font.family).toBe('string')
    expect(t.font.sizeBase).toBeGreaterThan(0)

    // 文字与背景对比度常识（浅色字 + 深色底）
    // textBase 不应等于 bgLayout（否则不可读）
    expect(t.color.textBase).not.toBe(t.color.bgLayout)
  })
})

describe('shopify light', () => {
  const s = shopify.light

  it('关键颜色值与 DESIGN.md 一致', () => {
    expect(s.color.primary).toBe('#000000')
    expect(s.color.textBase).toBe('#000000')
    expect(s.color.bgPanel).toBe('#ffffff')
    expect(s.color.bgLayout).toBe('#fbfbf5')
    expect(s.color.borderSubtle).toBe('#e4e4e7')
    expect(s.color.accent).toBe('#c1fbd4')
  })

  it('shade 灰阶与 DESIGN.md 一致', () => {
    expect(s.color.shade30).toBe('#d4d4d8')
    expect(s.color.shade40).toBe('#a1a1aa')
    expect(s.color.shade50).toBe('#71717a')
    expect(s.color.shade60).toBe('#52525b')
    expect(s.color.shade70).toBe('#3f3f46')
  })

  it('radius.pill = 999', () => {
    expect(s.radius.pill).toBe(999)
  })

  it('font weight 使用 Inter 420/500/550', () => {
    expect(s.font.weightRegular).toBe(420)
    expect(s.font.weightMedium).toBe(500)
    expect(s.font.weightStrong).toBe(550)
  })

  it('shadow panel 为 Level 3 多层小阴影堆叠', () => {
    expect(s.shadow.panel).toContain('rgba(0,0,0,0.1)')
    expect(s.shadow.panel.split(',').length).toBeGreaterThanOrEqual(4)
  })
})

describe('shopify dark', () => {
  const d = shopify.dark

  it('关键值与 DESIGN.md canvas-night 轨一致', () => {
    expect(d.color.bgLayout).toBe('#000000')
    expect(d.color.bgPanel).toBe('#0a0a0a')
    expect(d.color.textBase).toBe('#ffffff')
    expect(d.color.bgActive).toBe('#1e2c31')
  })

  it('暗轨无绿色强调（DESIGN.md 禁令）', () => {
    // accent is NOT aloe/pistachio green
    expect(d.color.accent).toBe('#1e2c31')
    expect(d.color.accent).not.toBe('#c1fbd4')
    expect(d.color.accent).not.toBe('#d4f9e0')
    // bgActive is not green
    expect(d.color.bgActive).not.toBe('#c1fbd4')
  })

  it('shadow 为 Level 1 inset 顶边高光，无 drop shadow', () => {
    expect(d.shadow.panel).toContain('inset')
    expect(d.shadow.panel).toContain('rgba(255,255,255')
  })
})
