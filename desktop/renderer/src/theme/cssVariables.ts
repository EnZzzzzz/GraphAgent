import type { ThemeTokens } from './tokens'
import { layout } from './tokens'
import { teal } from './themes/teal'
import { shopify } from './themes/shopify'
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
export function resolveTokens(themeId: ThemeId, mode: ThemeMode): ThemeTokens {
  if (themeId === 'shopify') {
    return shopify[mode]
  }
  return teal[mode]
}

/**
 * 把 ThemeTokens + layout 拍平为 `--ga-<域>-<kebab名>` 格式的 CSS 自定义属性，
 * 写入 `document.documentElement.style.setProperty(...)`。
 * 数值 token 自动附加 px 单位，但 font 域仅 size* 键是长度
 * （weight* / lineHeightBase 是无单位数值，原样输出）；
 * shadow 域为完整 box-shadow 字符串，原样输出不加 px。
 *
 * CSS 变量是插件消费的公开契约。
 */
export function applyCssVariables(tokens: ThemeTokens): void {
  const root = document.documentElement
  const lengthDomains = new Set(['radius', 'spacing'])

  // 主题 token（color / font / radius / spacing / shadow）
  for (const [domain, domainTokens] of Object.entries(tokens)) {
    for (const [key, value] of Object.entries(domainTokens)) {
      const varName = `--ga-${domain}-${camelToKebab(key)}`
      const isPx =
        typeof value === 'number' &&
        (lengthDomains.has(domain) || (domain === 'font' && key.startsWith('size')))
      const cssValue = isPx ? `${value}px` : String(value)
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
 * 从 themeStore 取当前主题，重放全部 CSS 变量，并同步
 * `<html data-theme data-mode>`（供 index.css 的主题选择器与 FOUC 规则使用）。
 * 用于启动时和切换主题时调用。
 */
export function applyCurrentTheme(): void {
  const state = getThemeStore().getTheme()
  const tokens = resolveTokens(state.themeId, state.mode)
  applyCssVariables(tokens)
  const root = document.documentElement
  root.setAttribute('data-theme', state.themeId)
  root.setAttribute('data-mode', state.mode)
}
