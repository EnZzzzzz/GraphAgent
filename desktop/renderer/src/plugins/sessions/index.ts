import type { Plugin } from '../../workbench/types'
import { SessionListView } from './SessionListView'

export const sessionsPlugin: Plugin = {
  id: 'builtin.sessions',
  activate(ctx) {
    ctx.registerContribution({
      point: 'workbench.viewContainers',
      container: {
        id: 'sessions-container',
        title: '会话',
        part: 'sidebar',
        viewIds: ['session-list']
      }
    })

    ctx.registerContribution({
      point: 'workbench.views',
      view: {
        id: 'session-list',
        title: '会话列表',
        component: SessionListView
      }
    })
  }
}

export { getActiveSessionId, setActiveSessionId, useActiveSessionId } from './sessionStore'
