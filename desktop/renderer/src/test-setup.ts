// vitest setup file — jsdom polyfills for antd + @testing-library/react auto-cleanup

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom 缺少 window.matchMedia（antd 依赖）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
})

// 每个测试后自动清理 DOM
afterEach(() => {
  cleanup()
})
