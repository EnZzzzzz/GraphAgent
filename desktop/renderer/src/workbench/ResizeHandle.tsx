import { useCallback } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

interface ResizeHandleProps {
  /** mousedown 时读取当前宽度/高度（避免拖拽中闭包过期） */
  getWidth: () => number
  setWidth: (size: number) => void
  /** 1 = 向右/下拖变大；-1 = 向左/上拖变大 */
  direction: 1 | -1
  min: number
  max: number
  /** 拖拽轴向，默认 'horizontal'（左右拖拽） */
  orientation?: 'horizontal' | 'vertical'
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Part 边缘 / 分屏 divider 的拖拽调宽手柄。
 * 透明热区通过负 margin 重叠在 flex gap 上，不改变布局视觉间距；
 * mousedown 后在 document 级监听 mousemove/mouseup，一次拖拽结束后移除。
 */
export function ResizeHandle({
  getWidth,
  setWidth,
  direction,
  min,
  max,
  orientation = 'horizontal'
}: ResizeHandleProps): JSX.Element {
  const isHorizontal = orientation === 'horizontal'

  const onMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault()
      const startCoord = isHorizontal ? e.clientX : e.clientY
      const startSize = getWidth()

      const onMouseMove = (ev: MouseEvent): void => {
        const currentCoord = isHorizontal ? ev.clientX : ev.clientY
        setWidth(clamp(startSize + direction * (currentCoord - startCoord), min, max))
      }
      const onMouseUp = (): void => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize'
    },
    [getWidth, setWidth, direction, min, max, isHorizontal]
  )

  return <div className="part-resize-handle" onMouseDown={onMouseDown} />
}
