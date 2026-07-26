import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ResizeHandle } from './ResizeHandle'

function setup(overrides?: Partial<Parameters<typeof ResizeHandle>[0]>) {
  const setWidth = vi.fn()
  const props = {
    getWidth: () => 232,
    direction: 1 as const,
    min: 180,
    max: 480,
    ...overrides,
    setWidth
  }
  const { container } = render(<ResizeHandle {...props} />)
  const handle = container.querySelector('.part-resize-handle') as HTMLElement
  return { handle, setWidth }
}

describe('ResizeHandle', () => {
  it('向右拖拽按 direction=1 调大宽度', () => {
    const { handle, setWidth } = setup()
    fireEvent.mouseDown(handle, { clientX: 300 })
    fireEvent.mouseMove(document, { clientX: 350 })
    expect(setWidth).toHaveBeenLastCalledWith(282) // 232 + (350-300)
  })

  it('direction=-1 时向左拖拽调大宽度', () => {
    const { handle, setWidth } = setup({ getWidth: () => 400, direction: -1, min: 280, max: 640 })
    fireEvent.mouseDown(handle, { clientX: 500 })
    fireEvent.mouseMove(document, { clientX: 430 })
    expect(setWidth).toHaveBeenLastCalledWith(470) // 400 - (430-500)
  })

  it('宽度被 clamp 在 min/max 内', () => {
    const { handle, setWidth } = setup()
    fireEvent.mouseDown(handle, { clientX: 300 })
    fireEvent.mouseMove(document, { clientX: 3000 })
    expect(setWidth).toHaveBeenLastCalledWith(480)
    fireEvent.mouseMove(document, { clientX: -3000 })
    expect(setWidth).toHaveBeenLastCalledWith(180)
  })

  it('mouseup 后停止响应 mousemove，并恢复 body cursor', () => {
    const { handle, setWidth } = setup()
    fireEvent.mouseDown(handle, { clientX: 300 })
    expect(document.body.style.cursor).toBe('col-resize')
    fireEvent.mouseMove(document, { clientX: 350 })
    setWidth.mockClear()
    fireEvent.mouseUp(document)
    fireEvent.mouseMove(document, { clientX: 400 })
    expect(setWidth).not.toHaveBeenCalled()
    expect(document.body.style.cursor).toBe('')
  })
})
