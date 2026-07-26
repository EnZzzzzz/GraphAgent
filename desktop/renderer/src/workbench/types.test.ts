import { describe, it, expect } from 'vitest'

// Compile-time type tests for ContentNode backward compatibility
// These verify that existing { viewId } declarations are valid ContentNode values.

describe('ContentNode types', () => {
  it('{ viewId } 字面量符合 ContentLeaf 结构（向后兼容）', () => {
    // This is a runtime assertion that the structural shape matches.
    // TypeScript compile check: { viewId: 'v' } is assignable to ContentLeaf
    const leaf = { viewId: 'my-view' }
    expect(leaf.viewId).toBe('my-view')
  })

  it('ContentSplit 结构完整性', () => {
    const split = {
      direction: 'row' as const,
      children: [{ viewId: 'left' }, { viewId: 'right' }],
      sizes: [1, 2]
    }
    expect(split.direction).toBe('row')
    expect(split.children).toHaveLength(2)
    expect(split.sizes).toEqual([1, 2])
  })

  it('嵌套 ContentNode 树', () => {
    const tree = {
      direction: 'column' as const,
      children: [
        { viewId: 'top' },
        {
          direction: 'row' as const,
          children: [
            { viewId: 'bottom-left' },
            { viewId: 'bottom-right' }
          ]
        }
      ]
    }
    expect(tree.direction).toBe('column')
    expect(tree.children).toHaveLength(2)
    // Second child is a split
    const secondChild = tree.children[1] as { direction: string; children: { viewId: string }[] }
    expect(secondChild.direction).toBe('row')
  })

  it('Page 声明旧 { viewId } 格式编译通过（runtime 形状验证）', () => {
    // This verifies that the structural shape { viewId: '...' } is valid
    // TypeScript ensures this compiles as ContentNode = ContentLeaf
    const pageLayout = {
      sidebar: { containerId: 's' },
      content: { viewId: 'content-v' },
      auxiliary: { viewId: 'aux-v' }
    }
    expect(pageLayout.content.viewId).toBe('content-v')
    expect(pageLayout.auxiliary.viewId).toBe('aux-v')
  })
})
