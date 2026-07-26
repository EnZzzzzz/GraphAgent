import { describe, it, expect, vi } from 'vitest'
import { PageManager } from './pageManager'

describe('PageManager', () => {
  it('has null activePageId initially', () => {
    const pm = new PageManager()
    expect(pm.activePageId).toBeNull()
  })

  it('switchPage updates activePageId', () => {
    const pm = new PageManager()
    pm.switchPage('home')
    expect(pm.activePageId).toBe('home')
  })

  it('switchPage fires onDidChangePage with new pageId', () => {
    const pm = new PageManager()
    const fn = vi.fn()
    pm.onDidChangePage(fn)

    pm.switchPage('settings')
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('settings')
  })

  it('switchPage to same pageId still fires listener', () => {
    const pm = new PageManager()
    pm.switchPage('home')

    const fn = vi.fn()
    pm.onDidChangePage(fn)
    pm.switchPage('home')

    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('home')
    expect(pm.activePageId).toBe('home')
  })

  it('clearPage resets activePageId to null and fires listener', () => {
    const pm = new PageManager()
    pm.switchPage('home')

    const fn = vi.fn()
    pm.onDidChangePage(fn)
    pm.clearPage()

    expect(pm.activePageId).toBeNull()
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith(null)
  })

  it('clearPage when already null still fires listener', () => {
    const pm = new PageManager()
    const fn = vi.fn()
    pm.onDidChangePage(fn)
    pm.clearPage()

    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith(null)
  })

  it('onDidChangePage dispose stops receiving events', () => {
    const pm = new PageManager()
    const fn = vi.fn()
    const d = pm.onDidChangePage(fn)
    d.dispose()

    pm.switchPage('home')
    expect(fn).not.toHaveBeenCalled()
  })
})
