/** 表示可释放资源 */
export interface Disposable {
  dispose(): void
}

/**
 * 极简类型安全事件发射器（仿 VS Code Event 模式）。
 *
 * 约束：
 * - 同一 listener 重复注册合法（每次 on() 返回独立 Disposable，每个都生效）
 * - fire() 期间 listener 自行 dispose 不影响当前遍历（先收集再调用）
 * - fire() 期间新增的 listener 不在本次 fire 中调用
 * - dispose() 后 on() 静默不注册（不抛异常），fire() 静默不触发
 */
export class Emitter<T> implements Disposable {
  private listeners: Array<{ listener: (event: T) => void; disposed: boolean }> = []
  private disposed = false
  private firing = false
  private pending: Array<{ listener: (event: T) => void; disposed: boolean }> = []

  /** 注册监听器，返回 Disposable */
  on(listener: (event: T) => void): Disposable {
    if (this.disposed) {
      return { dispose: () => {} }
    }

    const entry = { listener, disposed: false }
    const dispose = (): void => {
      entry.disposed = true
    }

    if (this.firing) {
      this.pending.push(entry)
    } else {
      this.listeners.push(entry)
    }

    return { dispose }
  }

  /** 同步触发所有监听器 */
  fire(event: T): void {
    if (this.disposed) return

    // 先拍到快照（含当前 listeners + firing 前积累的 pending）
    this.firing = true
    const snapshot = [...this.listeners, ...this.pending]
    this.pending = []

    for (const entry of snapshot) {
      if (!entry.disposed) {
        entry.listener(event)
      }
    }

    // 把 pending（fire 期间新增）合并回 listeners
    this.listeners.push(...this.pending)
    this.pending = []
    this.firing = false
  }

  /** 清除所有监听器 */
  dispose(): void {
    this.disposed = true
    this.listeners = []
    this.pending = []
  }
}
