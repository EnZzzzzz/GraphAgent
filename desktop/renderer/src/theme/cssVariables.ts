import { tokens } from './tokens'

/**
 * 将 camelCase 字符串转换为 kebab-case。
 * 如 'textBase' → 'text-base'，'shellGradientFrom' → 'shell-gradient-from'。
 */
function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

/**
 * 把 tokens 拍平为 `--ga-<域>-<kebab名>` 格式的 CSS 自定义属性，
 * 写入 `document.documentElement.style.setProperty(...)`。
 *
 * CSS 变量是插件消费的公开契约。
 */
export function applyCssVariables(): void {
  const root = document.documentElement

  for (const [domain, domainTokens] of Object.entries(tokens)) {
    for (const [key, value] of Object.entries(domainTokens)) {
      const varName = `--ga-${domain}-${camelToKebab(key)}`
      root.style.setProperty(varName, String(value))
    }
  }
}
