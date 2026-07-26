import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ThemeStore, getThemeStore, type ThemeState } from './themeStore'

// The module-level singleton makes tests order-dependent when using getThemeStore().
// Tests use a fresh ThemeStore instance directly to avoid cross-test contamination.
function freshStore(): ThemeStore {
  return new ThemeStore()
}

describe('ThemeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset singleton state between tests via internal module-level variable
    // (no-op if module was already loaded; tests use freshStore() for isolation)
  })

  describe('getTheme / setTheme', () => {
    it('默认返回 teal light（无存储记录且系统偏好为 light）', () => {
      // mock matchMedia to return light
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

      const store = freshStore()
      expect(store.getTheme()).toEqual({ themeId: 'teal', mode: 'light' })
    })

    it('无存储记录时 mode 跟随系统暗色偏好', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: true, // dark
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))

      const store = freshStore()
      expect(store.getTheme().mode).toBe('dark')
    })

    it('setTheme 更新状态并持久化到 localStorage', () => {
      const store = freshStore()
      store.setTheme('shopify', 'dark')

      expect(store.getTheme()).toEqual({ themeId: 'shopify', mode: 'dark' })

      const raw = localStorage.getItem('ga-theme')
      expect(raw).not.toBeNull()
      const parsed = JSON.parse(raw!)
      expect(parsed).toEqual({ themeId: 'shopify', mode: 'dark' })
    })

    it('setTheme 触发 onDidChange 订阅', () => {
      const store = freshStore()
      const states: ThemeState[] = []

      store.onDidChange((s) => states.push(s))
      store.setTheme('shopify', 'light')
      store.setTheme('teal', 'dark')

      expect(states).toHaveLength(2)
      expect(states[0]).toEqual({ themeId: 'shopify', mode: 'light' })
      expect(states[1]).toEqual({ themeId: 'teal', mode: 'dark' })
    })

    it('刷新后从 localStorage 恢复', () => {
      // Simulate: first session sets theme, then "page refresh" creates new store
      const store1 = freshStore()
      store1.setTheme('shopify', 'dark')

      // New instance reads from same localStorage
      const store2 = freshStore()
      expect(store2.getTheme()).toEqual({ themeId: 'shopify', mode: 'dark' })
    })
  })

  describe('onDidChange dispose', () => {
    it('dispose 后不再收到通知', () => {
      const store = freshStore()
      const calls: ThemeState[] = []
      const d = store.onDidChange((s) => calls.push(s))

      store.setTheme('teal', 'dark')
      expect(calls).toHaveLength(1)

      d.dispose()
      store.setTheme('shopify', 'light')
      expect(calls).toHaveLength(1) // still 1 — not called after dispose
    })
  })

  describe('storage 异常处理', () => {
    it('损坏的 JSON 回退到默认值', () => {
      localStorage.setItem('ga-theme', '{corrupted')
      const store = freshStore()
      expect(store.getTheme().themeId).toBe('teal')
    })

    it('非法 themeId/mode 回退到默认值', () => {
      localStorage.setItem('ga-theme', JSON.stringify({ themeId: 'invalid', mode: 'dark' }))
      const store = freshStore()
      expect(store.getTheme().themeId).toBe('teal')
    })
  })

  describe('getThemeStore 单例', () => {
    it('多次调用返回同一实例', () => {
      const a = getThemeStore()
      const b = getThemeStore()
      expect(a).toBe(b)
    })
  })
})
