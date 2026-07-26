import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'
import { ThemeProvider } from './ThemeProvider'
import { getThemeStore } from './themeStore'

/**
 * 回归测试：getSnapshot 必须返回稳定引用。
 * 曾因 themeStore.getTheme() 每次返回新对象导致 useSyncExternalStore
 * 无限重渲染（Maximum update depth exceeded），页面白屏。
 */
describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('挂载不发生无限重渲染，正常渲染子树', () => {
    const errors: unknown[][] = []
    const origError = console.error
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }
    try {
      render(
        <ThemeProvider>
          <div>content</div>
        </ThemeProvider>
      )
    } finally {
      console.error = origError
    }

    expect(screen.getByText('content')).toBeTruthy()
    const flat = errors.map((e) => String(e[0])).join('\n')
    expect(flat).not.toContain('Maximum update depth')
    expect(flat).not.toContain('getSnapshot should be cached')
  })

  it('切换主题后同步 <html data-theme data-mode>', () => {
    render(
      <ThemeProvider>
        <div />
      </ThemeProvider>
    )

    act(() => {
      getThemeStore().setTheme('shopify', 'dark')
    })

    expect(document.documentElement.getAttribute('data-theme')).toBe('shopify')
    expect(document.documentElement.getAttribute('data-mode')).toBe('dark')
    expect(document.documentElement.style.getPropertyValue('--ga-color-bg-layout')).toBe('#000000')
  })
})
