import { describe, it, expect, beforeEach } from 'vitest'
import { applyCssVariables } from './cssVariables'

describe('applyCssVariables', () => {
  beforeEach(() => {
    // 清理上一轮测试写入的 CSS 变量
    const root = document.documentElement
    for (let i = root.style.length - 1; i >= 0; i--) {
      const prop = root.style[i]
      if (prop.startsWith('--ga-')) {
        root.style.removeProperty(prop)
      }
    }
  })

  it('在 :root 上设置 CSS 变量，命名格式为 --ga-<域>-<kebab名>', () => {
    applyCssVariables()

    const style = document.documentElement.style

    // 抽查 color 域
    expect(style.getPropertyValue('--ga-color-primary')).toBe('#2ed3b0')
    expect(style.getPropertyValue('--ga-color-text-base')).toBe('#1b1f27')
    expect(style.getPropertyValue('--ga-color-bg-panel')).toBe('#ffffff')
    expect(style.getPropertyValue('--ga-color-shell-gradient-from')).toBe('#e9ecf6')
    expect(style.getPropertyValue('--ga-color-handle-hover')).toBe('rgba(46, 211, 176, 0.25)')

    // 抽查 font 域
    expect(style.getPropertyValue('--ga-font-size-base')).toBe('14')
    expect(style.getPropertyValue('--ga-font-size-lg')).toBe('16')

    // 抽查 radius 域
    expect(style.getPropertyValue('--ga-radius-panel')).toBe('16')
    expect(style.getPropertyValue('--ga-radius-control')).toBe('10')

    // 抽查 spacing 域
    expect(style.getPropertyValue('--ga-spacing-shell-gap')).toBe('12')

    // 抽查 layout 域
    expect(style.getPropertyValue('--ga-layout-topbar-height')).toBe('56')
    expect(style.getPropertyValue('--ga-layout-sidebar-default')).toBe('232')
  })

  it('每个域都有对应 CSS 变量（全覆盖）', () => {
    applyCssVariables()
    const style = document.documentElement.style

    // color 域 — 逐个验证
    const colorVars = [
      '--ga-color-primary',
      '--ga-color-link',
      '--ga-color-text-base',
      '--ga-color-text-secondary',
      '--ga-color-bg-layout',
      '--ga-color-bg-panel',
      '--ga-color-bg-panel-sunken',
      '--ga-color-bg-active',
      '--ga-color-shell-gradient-from',
      '--ga-color-shell-gradient-via',
      '--ga-color-shell-gradient-to',
      '--ga-color-handle-hover',
      '--ga-color-shadow-panel',
      '--ga-color-shadow-menu-item',
      '--ga-color-bg-bubble-ai',
      '--ga-color-bg-bubble-user',
      '--ga-color-border-subtle',
      '--ga-color-bg-avatar'
    ]
    for (const v of colorVars) {
      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
    }

    // font 域
    const fontVars = [
      '--ga-font-family',
      '--ga-font-size-base',
      '--ga-font-size-small',
      '--ga-font-size-sm',
      '--ga-font-size-md',
      '--ga-font-size-lg'
    ]
    for (const v of fontVars) {
      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
    }

    // radius 域
    const radiusVars = [
      '--ga-radius-panel',
      '--ga-radius-control',
      '--ga-radius-card',
      '--ga-radius-avatar',
      '--ga-radius-message',
      '--ga-radius-handle'
    ]
    for (const v of radiusVars) {
      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
    }

    // spacing 域
    const spacingVars = [
      '--ga-spacing-shell-gap',
      '--ga-spacing-shell-padding'
    ]
    for (const v of spacingVars) {
      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
    }

    // layout 域
    const layoutVars = [
      '--ga-layout-topbar-height',
      '--ga-layout-sidebar-default',
      '--ga-layout-sidebar-min',
      '--ga-layout-sidebar-max',
      '--ga-layout-auxiliary-default',
      '--ga-layout-auxiliary-min',
      '--ga-layout-auxiliary-max',
      '--ga-layout-resize-handle-size'
    ]
    for (const v of layoutVars) {
      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
    }
  })
})
