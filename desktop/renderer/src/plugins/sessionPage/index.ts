import type { Plugin } from '../../workbench/types'
import { SessionContentView } from './SessionContentView'
import { SessionTopbarLeft } from './SessionTopbarLeft'
import { SessionTopbarCenter } from './SessionTopbarCenter'
import { SessionTopbarRight } from './SessionTopbarRight'

export const sessionPagePlugin: Plugin = {
  id: 'builtin.sessionPage',
  activate(ctx) {
    ctx.registerContribution({
      point: 'workbench.pages',
      page: {
        id: 'session',
        title: '会话',
        layout: {
          sidebar: { containerId: 'sessions-container' },
          content: { viewId: 'session-content' },
          auxiliary: { viewId: 'chat-panel' }
        }
      }
    })

    ctx.registerContribution({
      point: 'workbench.views',
      view: {
        id: 'session-content',
        title: '会话内容',
        component: SessionContentView
      }
    })

    ctx.registerContribution({
      point: 'workbench.topbar',
      slot: 'left',
      pageId: 'session',
      component: SessionTopbarLeft
    })

    ctx.registerContribution({
      point: 'workbench.topbar',
      slot: 'center',
      pageId: 'session',
      component: SessionTopbarCenter
    })

    ctx.registerContribution({
      point: 'workbench.topbar',
      slot: 'right',
      pageId: 'session',
      component: SessionTopbarRight
    })
  }
}
