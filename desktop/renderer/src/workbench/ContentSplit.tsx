import { useCallback, useEffect, useRef, useState } from 'react'
import { Registry } from './registry'
import { ResizeHandle } from './ResizeHandle'
import type { ContentLayoutService, RuntimeNode, RuntimeLeaf, RuntimeSplit } from './contentLayoutService'

const LEAF_MIN_SIZE = 120

interface ContentSplitProps {
  service: ContentLayoutService
  pageId: string
}

/**
 * 递归渲染 content 区域的分屏布局树。
 * leaf → 渲染对应的 View 组件；split → flex 容器 + 可拖拽 divider。
 */
export function ContentSplit({ service, pageId }: ContentSplitProps): JSX.Element {
  const [, setVersion] = useState(0)

  useEffect(() => {
    const d = service.onDidChange(() => setVersion((v) => v + 1))
    return () => d.dispose()
  }, [service])

  const layout = service.getLayout(pageId)

  if (!layout) {
    return <div style={{ padding: 24, color: 'var(--ga-color-text-secondary)' }}>暂无内容</div>
  }

  return <NodeRenderer service={service} node={layout} />
}

// ── Internal ─────────────────────────────────────────────

function NodeRenderer({
  service,
  node
}: {
  service: ContentLayoutService
  node: RuntimeNode
}): JSX.Element {
  if (node.type === 'leaf') {
    return <LeafView leaf={node} />
  }
  return <SplitView service={service} split={node} />
}

function LeafView({ leaf }: { leaf: RuntimeLeaf }): JSX.Element {
  const view = Registry.instance.getView(leaf.viewId)

  return (
    <div
      style={{
        minWidth: LEAF_MIN_SIZE,
        minHeight: LEAF_MIN_SIZE,
        overflow: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {view ? <view.component /> : <EmptyLeaf viewId={leaf.viewId} />}
    </div>
  )
}

function EmptyLeaf({ viewId }: { viewId: string }): JSX.Element {
  return (
    <div style={{ padding: 16, color: 'var(--ga-color-text-secondary)' }}>
      View "{viewId}" 未注册
    </div>
  )
}

function SplitView({
  service,
  split
}: {
  service: ContentLayoutService
  split: RuntimeSplit
}): JSX.Element {
  const isRow = split.direction === 'row'
  const containerRef = useRef<HTMLDivElement | null>(null)

  const createOnResize = useCallback(
    (index: number) =>
      (deltaPx: number): void => {
        const container = containerRef.current
        if (!container) return

        const totalPx = isRow ? container.clientWidth : container.clientHeight
        if (totalPx <= 0) return

        const totalWeight = split.sizes.reduce((a, b) => a + b, 0)
        const weightDelta = (deltaPx * totalWeight) / totalPx
        const sizes = [...split.sizes]
        const leftIdx = index
        const rightIdx = index + 1

        const minWeight = LEAF_MIN_SIZE / totalPx
        let leftTarget = sizes[leftIdx] + weightDelta
        let rightTarget = sizes[rightIdx] - weightDelta

        // Symmetric clamp: deficit from one side goes to the other
        if (leftTarget < minWeight) {
          rightTarget -= minWeight - leftTarget
          leftTarget = minWeight
        }
        if (rightTarget < minWeight) {
          leftTarget -= minWeight - rightTarget
          rightTarget = minWeight
        }

        sizes[leftIdx] = Math.max(minWeight, leftTarget)
        sizes[rightIdx] = Math.max(minWeight, rightTarget)

        service.setChildSizes(split.splitId, sizes)
      },
    [service, split.splitId, split.sizes, isRow]
  )

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: isRow ? 'row' : 'column',
        minWidth: LEAF_MIN_SIZE,
        minHeight: LEAF_MIN_SIZE,
        overflow: 'hidden'
      }}
    >
      {split.children.map((child, i) => (
        <div
          key={child.type === 'leaf' ? child.leafId : child.splitId}
          style={{
            flex: split.sizes[i],
            display: 'flex',
            flexDirection: isRow ? 'row' : 'column',
            minWidth: 0,
            minHeight: 0
          }}
        >
          <NodeRenderer service={service} node={child} />
          {/* Divider between children (inside the child wrapper to participate in flex) */}
          {i < split.children.length - 1 && (
            <ResizeHandle
              orientation={isRow ? 'horizontal' : 'vertical'}
              getWidth={() => 0}
              setWidth={(delta) => createOnResize(i)(delta)}
              direction={1}
              min={-Infinity}
              max={Infinity}
            />
          )}
        </div>
      ))}
    </div>
  )
}
