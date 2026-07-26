import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkbenchLayout } from './WorkbenchLayout'
import { Registry } from './registry'
import { PageManager } from './pageManager'

// Helper: clear Registry singleton between tests
function clearRegistry(): void {
  const inst = Registry.instance as any
  inst._pages.clear()
  inst._viewContainers.clear()
  inst._views.clear()
  inst._topbarContribs.length = 0
}

function setupBasicPage(pageManager: PageManager): void {
  const r = Registry.instance

  r.registerContribution({
    point: 'workbench.pages',
    page: {
      id: 'test',
      title: 'Test Page',
      layout: {
        sidebar: { containerId: 'sidebar-c' },
        content: { viewId: 'content-v' },
        auxiliary: { viewId: 'aux-v' }
      }
    }
  })

  r.registerContribution({
    point: 'workbench.viewContainers',
    container: { id: 'sidebar-c', title: 'Sidebar Container', part: 'sidebar', viewIds: ['sidebar-v'] }
  })

  r.registerContribution({
    point: 'workbench.views',
    view: { id: 'sidebar-v', title: 'Sidebar View', component: () => <span>SidebarView</span> }
  })
  r.registerContribution({
    point: 'workbench.views',
    view: { id: 'content-v', title: 'Content View', component: () => <span>ContentView</span> }
  })
  r.registerContribution({
    point: 'workbench.views',
    view: { id: 'aux-v', title: 'Aux View', component: () => <span>AuxView</span> }
  })

  // Topbar contributions in different slots
  const LeftComp = () => <span>TopLeft</span>
  const CenterComp = () => <span>TopCenter</span>
  const RightComp = () => <span>TopRight</span>
  r.registerContribution({ point: 'workbench.topbar', slot: 'left', pageId: 'test', component: LeftComp })
  r.registerContribution({ point: 'workbench.topbar', slot: 'center', pageId: 'test', component: CenterComp })
  r.registerContribution({ point: 'workbench.topbar', slot: 'right', pageId: 'test', component: RightComp })

  pageManager.switchPage('test')
}

describe('WorkbenchLayout', () => {
  beforeEach(() => {
    clearRegistry()
  })

  it('renders empty shell when no active page', () => {
    const pm = new PageManager()
    render(<WorkbenchLayout pageManager={pm} />)

    // Shell class should exist
    expect(document.querySelector('.app-shell')).toBeDefined()
    expect(document.querySelector('.panel-sidebar')).toBeDefined()
    expect(document.querySelector('.topbar')).toBeDefined()
    expect(document.querySelector('.panel-content')).toBeDefined()
    // Auxiliary should NOT render when no resolution
    expect(document.querySelector('.panel-chat')).toBeNull()
  })

  it('renders sidebar container title and view', () => {
    const pm = new PageManager()
    setupBasicPage(pm)

    render(<WorkbenchLayout pageManager={pm} />)

    expect(screen.getByText('Sidebar Container')).toBeDefined()
    expect(screen.getByText('SidebarView')).toBeDefined()
  })

  it('renders content view', () => {
    const pm = new PageManager()
    setupBasicPage(pm)

    render(<WorkbenchLayout pageManager={pm} />)

    expect(screen.getByText('ContentView')).toBeDefined()
  })

  it('renders auxiliary view when present', () => {
    const pm = new PageManager()
    setupBasicPage(pm)

    render(<WorkbenchLayout pageManager={pm} />)

    expect(screen.getByText('AuxView')).toBeDefined()
    expect(document.querySelector('.panel-chat')).toBeDefined()
  })

  it('does not render auxiliary when page has no auxiliary layout', () => {
    const pm = new PageManager()
    const r = Registry.instance

    r.registerContribution({
      point: 'workbench.pages',
      page: { id: 'noaux', title: 'No Aux', layout: { content: { viewId: 'cv' } } }
    })
    r.registerContribution({
      point: 'workbench.views',
      view: { id: 'cv', title: 'CV', component: () => <span>CV</span> }
    })

    pm.switchPage('noaux')
    render(<WorkbenchLayout pageManager={pm} />)

    expect(document.querySelector('.panel-chat')).toBeNull()
  })

  it('renders topbar slots: left, center, right', () => {
    const pm = new PageManager()
    setupBasicPage(pm)

    render(<WorkbenchLayout pageManager={pm} />)

    expect(screen.getByText('TopLeft')).toBeDefined()
    expect(screen.getByText('TopCenter')).toBeDefined()
    expect(screen.getByText('TopRight')).toBeDefined()
  })

  it('renders sidebar handle always; auxiliary handle only when auxiliary present', () => {
    const pm = new PageManager()
    setupBasicPage(pm)
    const { unmount } = render(<WorkbenchLayout pageManager={pm} />)
    expect(document.querySelectorAll('.part-resize-handle')).toHaveLength(2)

    unmount()
    const pm2 = new PageManager()
    const r = Registry.instance
    r.registerContribution({
      point: 'workbench.pages',
      page: { id: 'noaux', title: 'No Aux', layout: { content: { viewId: 'cv' } } }
    })
    r.registerContribution({
      point: 'workbench.views',
      view: { id: 'cv', title: 'CV', component: () => <span>CV</span> }
    })
    pm2.switchPage('noaux')
    render(<WorkbenchLayout pageManager={pm2} />)
    expect(document.querySelectorAll('.part-resize-handle')).toHaveLength(1)
  })

  it('dragging sidebar handle resizes the sidebar within limits', () => {
    const pm = new PageManager()
    setupBasicPage(pm)
    render(<WorkbenchLayout pageManager={pm} />)

    const sidebar = document.querySelector('.panel-sidebar') as HTMLElement
    const handle = document.querySelector('.part-resize-handle') as HTMLElement
    expect(sidebar.style.width).toBe('232px')

    fireEvent.mouseDown(handle, { clientX: 300 })
    fireEvent.mouseMove(document, { clientX: 348 })
    fireEvent.mouseUp(document)
    expect(sidebar.style.width).toBe('280px')

    // 超出 max 被 clamp 到 480
    fireEvent.mouseDown(handle, { clientX: 300 })
    fireEvent.mouseMove(document, { clientX: 3000 })
    fireEvent.mouseUp(document)
    expect(sidebar.style.width).toBe('480px')
  })

  it('dragging auxiliary handle resizes the auxiliary panel (drag left = wider)', () => {
    const pm = new PageManager()
    setupBasicPage(pm)
    render(<WorkbenchLayout pageManager={pm} />)

    const aux = document.querySelector('.panel-chat') as HTMLElement
    const handles = document.querySelectorAll('.part-resize-handle')
    const auxHandle = handles[handles.length - 1] as HTMLElement
    expect(aux.style.width).toBe('400px')

    fireEvent.mouseDown(auxHandle, { clientX: 1000 })
    fireEvent.mouseMove(document, { clientX: 940 })
    fireEvent.mouseUp(document)
    expect(aux.style.width).toBe('460px')
  })
})
