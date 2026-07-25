import { Emitter } from './emitter'
import type { Disposable } from './emitter'

export class PageManager {
  private _activePageId: string | null = null
  private _emitter = new Emitter<string | null>()

  /** 当前 active pageId，无页面时为 null */
  get activePageId(): string | null {
    return this._activePageId
  }

  /** 切换到指定页面 */
  switchPage(pageId: string): void {
    this._activePageId = pageId
    this._emitter.fire(pageId)
  }

  /** 清空 active page */
  clearPage(): void {
    this._activePageId = null
    this._emitter.fire(null)
  }

  /** activePage 变化时通知，参数为新 pageId（null 表示清空） */
  onDidChangePage(listener: (pageId: string | null) => void): Disposable {
    return this._emitter.on(listener)
  }
}
