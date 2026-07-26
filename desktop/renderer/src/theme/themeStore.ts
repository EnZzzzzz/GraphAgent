import { Emitter } from '../workbench/emitter'

export type ThemeId = 'teal' | 'shopify'
export type ThemeMode = 'light' | 'dark'

export interface ThemeState {
  themeId: ThemeId
  mode: ThemeMode
}

const STORAGE_KEY = 'ga-theme'

function getSystemMode(): ThemeMode {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function loadFromStorage(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (
        (parsed.themeId === 'teal' || parsed.themeId === 'shopify') &&
        (parsed.mode === 'light' || parsed.mode === 'dark')
      ) {
        return parsed as ThemeState
      }
    }
  } catch {
    // corrupted storage → fall through to default
  }
  return { themeId: 'teal', mode: getSystemMode() }
}

function saveToStorage(state: ThemeState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable → ignore
  }
}

export class ThemeStore {
  private _state: ThemeState = loadFromStorage()
  private _emitter = new Emitter<ThemeState>()

  getTheme(): ThemeState {
    // 直接返回内部引用：setTheme 总是整体替换新对象，
    // 引用仅在真正切换时变化，满足 useSyncExternalStore getSnapshot 的稳定性要求。
    return this._state
  }

  setTheme(themeId: ThemeId, mode: ThemeMode): void {
    const next: ThemeState = { themeId, mode }
    this._state = next
    saveToStorage(next)
    this._emitter.fire(next)
  }

  onDidChange(listener: (state: ThemeState) => void): { dispose(): void } {
    return this._emitter.on(listener)
  }
}

/** 全局单例 */
let _instance: ThemeStore | null = null

export function getThemeStore(): ThemeStore {
  if (!_instance) {
    _instance = new ThemeStore()
  }
  return _instance
}
