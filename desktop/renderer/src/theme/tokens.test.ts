import { describe, it, expect } from 'vitest'
import { tokens } from './tokens'

describe('tokens', () => {
  it('包含全部五个域', () => {
    expect(tokens).toHaveProperty('color')
    expect(tokens).toHaveProperty('font')
    expect(tokens).toHaveProperty('radius')
    expect(tokens).toHaveProperty('spacing')
    expect(tokens).toHaveProperty('layout')
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
      expect(c.shadowPanel).toBe('rgba(30, 40, 80, 0.06)')
      expect(c.shadowMenuItem).toBe('rgba(30, 40, 80, 0.08)')
      expect(c.bgBubbleAi).toBe('#e9f7f3')
      expect(c.bgBubbleUser).toBe('#f2f3f7')
      expect(c.borderSubtle).toBe('#eceef4')
      expect(c.bgAvatar).toBe('#e4e7f0')
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
    })
  })

  describe('spacing 域', () => {
    it('包含间距 token', () => {
      const s = tokens.spacing
      expect(s.shellGap).toBe(12)
      expect(s.shellPadding).toBe(12)
    })
  })

  describe('layout 域', () => {
    it('包含所有布局尺寸 token', () => {
      const l = tokens.layout
      expect(l.topbarHeight).toBe(56)
      expect(l.sidebarDefault).toBe(232)
      expect(l.sidebarMin).toBe(180)
      expect(l.sidebarMax).toBe(480)
      expect(l.auxiliaryDefault).toBe(400)
      expect(l.auxiliaryMin).toBe(280)
      expect(l.auxiliaryMax).toBe(640)
      expect(l.resizeHandleSize).toBe(10)
    })
  })
})
