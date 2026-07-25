import { useEffect, useMemo } from 'react'
import { WorkbenchLayout } from './workbench/WorkbenchLayout'
import { PluginHost } from './workbench/pluginHost'
import { Registry } from './workbench/registry'
import { PageManager } from './workbench/pageManager'
import { BUILTIN_PLUGINS } from './plugins'

// 模块级单例，避免 React 重渲染时重复创建
const pageManager = new PageManager()

export default function App(): JSX.Element {
  const pluginHost = useMemo(() => new PluginHost(), [])

  useEffect(() => {
    // Activate 内置插件，只执行一次
    const aggregate = pluginHost.activateBuiltin(BUILTIN_PLUGINS)

    // 默认打开 session 页面
    if (!pageManager.activePageId) {
      // 等待插件注册完成后再切换页面（微任务）
      queueMicrotask(() => {
        const pages = Registry.instance.getPages()
        if (pages.length > 0 && !pageManager.activePageId) {
          pageManager.switchPage(pages[0].id)
        }
      })
    }

    return () => {
      aggregate.dispose()
    }
  }, [pluginHost])

  return <WorkbenchLayout pageManager={pageManager} />
}
