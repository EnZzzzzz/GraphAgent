import { useEffect, useMemo } from 'react'
import { WorkbenchLayout } from './workbench/WorkbenchLayout'
import { PluginHost } from './workbench/pluginHost'
import { Registry } from './workbench/registry'
import { getPageManager } from './pageManagerInstance'
import { BUILTIN_PLUGINS } from './plugins'

export default function App(): JSX.Element {
  const pageManager = getPageManager()
  const pluginHost = useMemo(() => new PluginHost(), [])

  useEffect(() => {
    const aggregate = pluginHost.activateBuiltin(BUILTIN_PLUGINS)

    // 默认打开第一个已注册的页面
    if (!pageManager.activePageId) {
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
  }, [pluginHost, pageManager])

  return <WorkbenchLayout pageManager={pageManager} />
}
