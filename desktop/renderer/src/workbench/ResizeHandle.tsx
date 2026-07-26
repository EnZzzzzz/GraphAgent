import { useCallback } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

interface ResizeHandleProps {
  /** mousedown 时读取当前宽度（避免拖拽中闭包过期） */
  getWidth: () => number
  setWidth: (width: number) => void
  /** 1 = 向右拖变宽（左侧面板）；-1 = 向左拖变宽（右侧面板） */
  direction: 1 | -1
  min: number
  max: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Part 边缘的拖拽调宽手柄。
 * 透明热区通过负 margin 重叠在 flex gap 上，不改变布局视觉间距；
 * mousedown 后在 document 级监听 mousemove/mouseup，一次拖拽结束后移除。
 */
export function ResizeHandle({
  getWidth,
  setWidth,
  direction,
  min,
  max
}: ResizeHandleProps): JSX.Element {
  const onMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault()
      const startX = e.clientX
      const startWidth = getWidth()

      const onMouseMove = (ev: MouseEvent): void => {
        setWidth(clamp(startWidth + direction * (ev.clientX - startX), min, max))
      }
      const onMouseUp = (): void => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
        document.body.style.cursor = ''
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      document.body.style.cursor = 'col-resize'
    },
    [getWidth, setWidth, direction, min, max]
  )

  return <div className="part-resize-handle" onMouseDown={onMouseDown} />
}
