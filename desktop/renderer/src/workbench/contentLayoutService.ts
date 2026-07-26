import { Emitter } from './emitter'
import { Registry } from './registry'
import type { Disposable } from './emitter'
import type { ContentNode } from './types'

// ── Runtime types ───────────────────────────────────────

export interface RuntimeLeaf {
  type: 'leaf'
  leafId: string
  viewId: string
}

export interface RuntimeSplit {
  type: 'split'
  splitId: string
  direction: 'row' | 'column'
  children: RuntimeNode[]
  sizes: number[]
}

export type RuntimeNode = RuntimeLeaf | RuntimeSplit

// ── Helpers ─────────────────────────────────────────────

function isLeaf(node: RuntimeNode): node is RuntimeLeaf {
  return node.type === 'leaf'
}

function isSplit(node: RuntimeNode): node is RuntimeSplit {
  return node.type === 'split'
}

interface FindResult {
  node: RuntimeNode
  parent: RuntimeSplit | null
  index: number
}

// ── Service ─────────────────────────────────────────────

export class ContentLayoutService {
  private _layouts = new Map<string, RuntimeNode>()
  private _idCounter = 0
  private _emitter = new Emitter<void>()

  // ── Page lifecycle ──

  /**
   * 用 Page 声明初始化该页布局树，为每个 leaf 生成稳定 leafId。
   * 同一 pageId 重复调用会重置布局。
   */
  activatePage(pageId: string, rootNode: ContentNode): void {
    this._layouts.set(pageId, this._initNode(rootNode))
  }

  /** 获取当前运行时布局树 */
  getLayout(pageId: string): RuntimeNode | undefined {
    return this._layouts.get(pageId)
  }

  // ── Mutation API ──

  /**
   * 拆分指定 leaf 为分屏容器。viewId 必须在 Registry 已注册，否则抛错。
   */
  splitLeaf(leafId: string, direction: 'row' | 'column', viewId: string): void {
    if (!Registry.instance.getView(viewId)) {
      throw new Error(`splitLeaf: view "${viewId}" is not registered`)
    }

    const found = this._findNode(leafId, 'leaf')
    if (!found) {
      throw new Error(`splitLeaf: leaf "${leafId}" not found`)
    }

    const leaf = found.node as RuntimeLeaf
    const newLeaf: RuntimeLeaf = {
      type: 'leaf',
      leafId: this._nextId('leaf'),
      viewId
    }

    const split: RuntimeSplit = {
      type: 'split',
      splitId: this._nextId('split'),
      direction,
      children: [leaf, newLeaf],
      sizes: [1, 1]
    }

    this._replaceNode(found, split)
    this._fireChange()
  }

  /**
   * 关闭指定 leaf。
   * - 关闭后收缩兄弟节点；只剩一个 leaf 的 split 自动坍缩
   * - 不允许关闭最后一个 leaf（抛错）
   */
  closeLeaf(leafId: string): void {
    const found = this._findNode(leafId, 'leaf')
    if (!found) {
      throw new Error(`closeLeaf: leaf "${leafId}" not found`)
    }

    if (!found.parent) {
      throw new Error('closeLeaf: cannot close the last leaf')
    }

    // Remove leaf from parent's children
    const siblings = [...found.parent.children]
    siblings.splice(found.index, 1)
    const newSizes = [...found.parent.sizes]
    newSizes.splice(found.index, 1)

    if (siblings.length === 1) {
      // Collapse: replace parent split with the single remaining child
      this._collapseSplit(found.parent, siblings[0])
    } else {
      found.parent.children = siblings
      found.parent.sizes = newSizes
    }

    this._fireChange()
  }

  /**
   * 设置分屏容器的子节点 flex-grow 权重。
   */
  setChildSizes(splitId: string, sizes: number[]): void {
    const found = this._findNode(splitId, 'split')
    if (!found) {
      throw new Error(`setChildSizes: split "${splitId}" not found`)
    }

    const split = found.node as RuntimeSplit
    if (sizes.length !== split.children.length) {
      throw new Error(
        `setChildSizes: sizes length (${sizes.length}) must equal children count (${split.children.length})`
      )
    }

    split.sizes = sizes
    this._fireChange()
  }

  // ── Change notification ──

  onDidChange(listener: () => void): Disposable {
    return this._emitter.on(listener)
  }

  // ── Private ──

  private _nextId(prefix: string): string {
    return `${prefix}-${++this._idCounter}`
  }

  /** 递归将 ContentNode 声明树转为 RuntimeNode */
  private _initNode(node: ContentNode): RuntimeNode {
    if ('viewId' in node && !('children' in node)) {
      // ContentLeaf
      return {
        type: 'leaf',
        leafId: this._nextId('leaf'),
        viewId: node.viewId
      }
    }

    // ContentSplit
    const split = node as { direction: 'row' | 'column'; children: ContentNode[]; sizes?: number[] }
    return {
      type: 'split',
      splitId: this._nextId('split'),
      direction: split.direction,
      children: split.children.map((child) => this._initNode(child)),
      sizes: split.sizes ?? split.children.map(() => 1)
    }
  }

  /** 在所有 page 的布局树中查找指定节点及其父节点 */
  private _findNode(nodeId: string, type: 'leaf' | 'split'): FindResult | null {
    for (const [_pageId, root] of this._layouts) {
      const result = this._search(root, null, -1, nodeId, type)
      if (result) return result
    }
    return null
  }

  private _search(
    node: RuntimeNode,
    parent: RuntimeSplit | null,
    index: number,
    targetId: string,
    targetType: 'leaf' | 'split'
  ): FindResult | null {
    const nodeId = isLeaf(node) ? node.leafId : node.splitId
    if (node.type === targetType && nodeId === targetId) {
      return { node, parent, index }
    }

    if (isSplit(node)) {
      for (let i = 0; i < node.children.length; i++) {
        const result = this._search(node.children[i], node, i, targetId, targetType)
        if (result) return result
      }
    }

    return null
  }

  /** 在父节点中替换子节点 */
  private _replaceNode(found: FindResult, replacement: RuntimeNode): void {
    if (!found.parent) {
      // Root node replacement — find which page this node belongs to
      for (const [pageId, root] of this._layouts) {
        if (root === found.node) {
          this._layouts.set(pageId, replacement)
          return
        }
      }
    } else {
      found.parent.children[found.index] = replacement
    }
  }

  /** 坍缩 split：用 singleChild 替换包含该 split 的父节点或根 */
  private _collapseSplit(split: RuntimeSplit, singleChild: RuntimeNode): void {
    // Find the split's position in its tree
    const found = this._findNode(split.splitId, 'split')
    if (!found) return

    if (!found.parent) {
      // Split is root → replace root with singleChild
      for (const [pageId, root] of this._layouts) {
        if (root === split) {
          this._layouts.set(pageId, singleChild)
          return
        }
      }
    } else {
      found.parent.children[found.index] = singleChild

      // Recursive collapse: if parent now has 1 child, collapse upward
      if (found.parent.children.length === 1) {
        this._collapseSplit(found.parent, found.parent.children[0])
      }
    }
  }

  private _fireChange(): void {
    this._emitter.fire()
  }
}
