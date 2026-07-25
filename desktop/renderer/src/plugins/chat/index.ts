import type { Plugin } from '../../workbench/types'
import { ChatPanelView } from './ChatPanelView'

export const chatPlugin: Plugin = {
  id: 'builtin.chat',
  activate(ctx) {
    ctx.registerContribution({
      point: 'workbench.views',
      view: {
        id: 'chat-panel',
        title: '对话面板',
        component: ChatPanelView
      }
    })
  }
}
