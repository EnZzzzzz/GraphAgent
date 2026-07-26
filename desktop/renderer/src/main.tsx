import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './theme/ThemeProvider'
import { applyCurrentTheme } from './theme/cssVariables'
import '@fontsource-variable/inter'
import './index.css'

// 同步设置初始 CSS 变量（React 渲染前，防 FOUC）
applyCurrentTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
