import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// 目录结构：
//   desktop/  Electron 桌面端（main / preload / renderer）
//   server/   内联服务端（由 desktop 主进程在启动时拉起）
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: { entry: 'desktop/main/index.ts' },
      outDir: 'out/main'
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: { entry: 'desktop/preload/index.ts' },
      outDir: 'out/preload'
    }
  },
  renderer: {
    root: 'desktop/renderer',
    plugins: [react()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'desktop/renderer/index.html')
      },
      outDir: 'out/renderer'
    }
  }
})
