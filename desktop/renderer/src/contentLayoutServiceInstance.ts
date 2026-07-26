import { ContentLayoutService } from './workbench/contentLayoutService'

/** 全局 ContentLayoutService 单例，插件可通过此模块进行运行时分屏操作 */
const instance = new ContentLayoutService()

export function getContentLayoutService(): ContentLayoutService {
  return instance
}
