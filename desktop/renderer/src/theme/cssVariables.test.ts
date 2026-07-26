import { describe, it, expect, beforeEach } from 'vitest'
import { applyCssVariables } from './cssVariables'
import { teal } from './themes/teal'

const tealLight = teal.light

describe('applyCssVariables', () => {
  beforeEach(() => {
    const root = document.documentElement
    for (let i = root.style.length - 1; i >= 0; i--) {
      const prop = root.style[i]
      if (prop.startsWith('--ga-')) {
        root.style.removeProperty(prop)
      }
    }
  })

  it('在 :root 上设置 CSS 变量，命名格式为 --ga-<域>-<kebab名>', () => {
    applyCssVariables(tealLight)

    const style = document.documentElement.style

    // 抽查 color 域
    expect(style.getPropertyValue('--ga-color-primary')).toBe('#2ed3b0')
    expect(style.getPropertyValue('--ga-color-text-base')).toBe('#1b1f27')
    expect(style.getPropertyValue('--ga-color-bg-panel')).toBe('#ffffff')
    expect(style.getPropertyValue('--ga-color-shell-gradient-from')).toBe('#e9ecf6')
    expect(style.getPropertyValue('--ga-color-handle-hover')).toBe('rgba(46, 211, 176, 0.25)')

    // 抽查 font 域
    expect(style.getPropertyValue('--ga-font-size-base')).toBe('14px')
    expect(style.getPropertyValue('--ga-font-size-lg')).toBe('16px')
    // weight / lineHeight 是无单位数值，不加 px
    expect(style.getPropertyValue('--ga-font-weight-regular')).toBe('400')
    expect(style.getPropertyValue('--ga-font-line-height-base')).toBe('1.5')

    // 抽查 radius 域
    expect(style.getPropertyValue('--ga-radius-panel')).toBe('16px')
    expect(style.getPropertyValue('--ga-radius-control')).toBe('10px')

    // 抽查 spacing 域
    expect(style.getPropertyValue('--ga-spacing-shell-gap')).toBe('12px')

    // 抽查 layout 域
    expect(style.getPropertyValue('--ga-layout-topbar-height')).toBe('56px')
    expect(style.getPropertyValue('--ga-layout-sidebar-default')).toBe('232px')

    // shadow 域 — 字符串原样输出（不加 px）
    expect(style.getPropertyValue('--ga-shadow-panel')).toBe('0 4px 24px rgba(30, 40, 80, 0.06)')
    expect(style.getPropertyValue('--ga-shadow-menu-item')).toBe('0 2px 10px rgba(30, 40, 80, 0.08)')
  })

  it('每个域都有对应 CSS 变量（全覆盖）', () => {
    applyCssVariables(tealLight)
    const style = document.documentElement.style

    // color 域
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
      '--ga-color-bg-bubble-ai',
      '--ga-color-bg-bubble-user',
      '--ga-color-border-subtle',
      '--ga-color-bg-avatar',
      '--ga-color-shade30',
      '--ga-color-shade40',
      '--ga-color-shade50',
      '--ga-color-shade60',
      '--ga-color-shade70',
      '--ga-color-accent'
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
      '--ga-font-size-lg',
      '--ga-font-weight-regular',
      '--ga-font-weight-medium',
      '--ga-font-weight-strong',
      '--ga-font-line-height-base'
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
      '--ga-radius-handle',
      '--ga-radius-pill'
    ]
    for (const v of radiusVars) {
      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
    }

    // spacing 域
    const spacingVars = [
      '--ga-spacing-shell-gap',
      '--ga-spacing-shell-padding',
      '--ga-spacing-xxs',
      '--ga-spacing-xs',
      '--ga-spacing-sm',
      '--ga-spacing-md',
      '--ga-spacing-lg',
      '--ga-spacing-xl',
      '--ga-spacing-xxl',
      '--ga-spacing-huge'
    ]
    for (const v of spacingVars) {
      expect(style.getPropertyValue(v), `${v} 应该有值`).toBeTruthy()
    }

    // shadow 域
    const shadowVars = [
      '--ga-shadow-panel',
      '--ga-shadow-menu-item'
    ]
    for (const v of shadowVars) {
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

  it('shadow 域不加 px（字符串原样输出）', () => {
    applyCssVariables(tealLight)
    const style = document.documentElement.style

    expect(style.getPropertyValue('--ga-shadow-panel')).toBe('0 4px 24px rgba(30, 40, 80, 0.06)')
    expect(style.getPropertyValue('--ga-shadow-menu-item')).toBe('0 2px 10px rgba(30, 40, 80, 0.08)')
  })

  it('传入不同 token 集产生不同 CSS 变量值（参数化验证）', () => {
    applyCssVariables(teal.dark)
    const style = document.documentElement.style

    // dark 背景不同于 light
    expect(style.getPropertyValue('--ga-color-bg-panel')).toBe('#1e2128')
    expect(style.getPropertyValue('--ga-color-text-base')).toBe('#e1e3e8')
  })
})
