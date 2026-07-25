import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// 单元测试配置独立于 electron.vite.config.ts：
// 只覆盖 renderer（jsdom 环境），不与 electron-vite 构建配置耦合。
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['desktop/renderer/src/**/*.test.{ts,tsx}']
  }
})
