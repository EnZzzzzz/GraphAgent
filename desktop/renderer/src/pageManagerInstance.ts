import { PageManager } from './workbench/pageManager'

/** 全局 PageManager 单例，插件 view 组件可通过此模块切换页面 */
const instance = new PageManager()

export function getPageManager(): PageManager {
  return instance
}
