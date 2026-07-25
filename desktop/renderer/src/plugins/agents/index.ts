import type { Plugin } from '../../workbench/types'
import { AgentsSidebarView } from './AgentsSidebarView'
import { AgentsContentView } from './AgentsContentView'
import { AgentsTopbarLeft } from './AgentsTopbarLeft'

export const agentsPlugin: Plugin = {
  id: 'builtin.agents',
  activate(ctx) {
    ctx.registerContribution({
      point: 'workbench.pages',
      page: {
        id: 'agents',
        title: 'Agents',
        layout: {
          sidebar: { containerId: 'agents-sidebar-container' },
          content: { viewId: 'agents-content' }
          // 故意不声明 auxiliary：agents 页没有右侧面板
        }
      }
    })

    ctx.registerContribution({
      point: 'workbench.viewContainers',
      container: {
        id: 'agents-sidebar-container',
        title: 'Agents',
        part: 'sidebar',
        viewIds: ['agents-sidebar']
      }
    })

    ctx.registerContribution({
      point: 'workbench.views',
      view: { id: 'agents-sidebar', title: 'Agents 导航', component: AgentsSidebarView }
    })

    ctx.registerContribution({
      point: 'workbench.views',
      view: { id: 'agents-content', title: 'Agents 内容', component: AgentsContentView }
    })

    ctx.registerContribution({
      point: 'workbench.topbar',
      slot: 'left',
      pageId: 'agents',
      component: AgentsTopbarLeft
    })
  }
}
