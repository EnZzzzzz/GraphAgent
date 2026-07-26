import { useMemo, useSyncExternalStore } from 'react'
import { Registry } from './registry'
import type { PageManager } from './pageManager'
import type { PageResolution } from './registry'

interface WorkbenchLayoutProps {
  pageManager: PageManager
}

/**
 * Subscribe to both pageManager and registry changes.
 * Snapshot is a lightweight comparable value (pageId + registryVersion);
 * the expensive resolvePage() is only called via useMemo when snapshot changes.
 */
function usePageResolution(pageManager: PageManager): PageResolution | undefined {
  const snapshot = useSyncExternalStore(
    (callback: () => void) => {
      const d1 = pageManager.onDidChangePage(callback)
      const d2 = Registry.instance.onDidChange(callback)
      return () => {
        d1.dispose()
        d2.dispose()
      }
    },
    (): string | null => {
      const pageId = pageManager.activePageId
      if (!pageId) return null
      // Combine pageId + registry version for a stable comparable value
      return `${pageId}@${Registry.instance.version}`
    }
  )

  return useMemo(() => {
    if (snapshot === null) return undefined
    const pageId = snapshot.split('@')[0]
    return Registry.instance.resolvePage(pageId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot])
}

export function WorkbenchLayout({ pageManager }: WorkbenchLayoutProps): JSX.Element {
  const resolution = usePageResolution(pageManager)

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="panel panel-sidebar">
        {resolution?.sidebar && (
          <>
            <div>{resolution.sidebar.container.title}</div>
            {resolution.sidebar.views.map((v) => (
              <v.component key={v.id} />
            ))}
          </>
        )}
      </aside>

      <div className="main-column">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            {resolution?.topbar.left.map((item, i) => (
              <item.component key={`left-${i}`} />
            ))}
          </div>
          <div className="topbar-center">
            {resolution?.topbar.center.map((item, i) => (
              <item.component key={`center-${i}`} />
            ))}
          </div>
          <div className="topbar-right">
            {resolution?.topbar.right.map((item, i) => (
              <item.component key={`right-${i}`} />
            ))}
          </div>
        </header>

        <div className="main-row">
          {/* Content */}
          <main className="panel panel-content">
            {resolution?.content && <resolution.content.view.component />}
          </main>

          {/* Auxiliary */}
          {resolution?.auxiliary && (
            <aside className="panel panel-chat">
              <resolution.auxiliary.view.component />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
