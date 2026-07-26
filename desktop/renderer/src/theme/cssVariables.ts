import type { ThemeTokens } from './tokens'
import { layout } from './tokens'
import { teal } from './themes/teal'
import { getThemeStore } from './themeStore'
import type { ThemeId, ThemeMode } from './themeStore'

/**
 * 将 camelCase 字符串转换为 kebab-case。
 * 如 'textBase' → 'text-base'，'shellGradientFrom' → 'shell-gradient-from'。
 */
function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

/**
 * 根据 themeId + mode 解析对应的 ThemeTokens。
 */
function resolveTokens(themeId: ThemeId, mode: ThemeMode): ThemeTokens {
  // shopify theme imported lazily (Step 3.1)
  if (themeId === 'shopify') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { shopify } = require('./themes/shopify')
    return shopify[mode]
  }
  return teal[mode]
}

/**
 * 把 ThemeTokens + layout 拍平为 `--ga-<域>-<kebab名>` 格式的 CSS 自定义属性，
 * 写入 `document.documentElement.style.setProperty(...)`。
 * 数值 token（font/radius/spacing 域）自动附加 px 单位；
 * shadow 域为完整 box-shadow 字符串，原样输出不加 px。
 *
 * CSS 变量是插件消费的公开契约。
 */
export function applyCssVariables(tokens: ThemeTokens): void {
  const root = document.documentElement
  const lengthDomains = new Set(['font', 'radius', 'spacing'])

  // 主题 token（color / font / radius / spacing / shadow）
  for (const [domain, domainTokens] of Object.entries(tokens)) {
    const isLength = lengthDomains.has(domain)
    for (const [key, value] of Object.entries(domainTokens)) {
      const varName = `--ga-${domain}-${camelToKebab(key)}`
      const cssValue = isLength && typeof value === 'number' ? `${value}px` : String(value)
      root.style.setProperty(varName, cssValue)
    }
  }

  // layout — 跨主题不变量
  for (const [key, value] of Object.entries(layout)) {
    const varName = `--ga-layout-${camelToKebab(key)}`
    root.style.setProperty(varName, `${(value as number)}px`)
  }
}

/**
 * 从 themeStore 取当前主题，重放全部 CSS 变量。
 * 用于启动时和切换主题时调用。
 */
export function applyCurrentTheme(): void {
  const state = getThemeStore().getTheme()
  const tokens = resolveTokens(state.themeId, state.mode)
  applyCssVariables(tokens)
}
