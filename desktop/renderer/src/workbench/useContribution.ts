import { useSyncExternalStore } from 'react'
import type { Emitter } from './emitter'

/**
 * 订阅 Emitter<void>，每次 fire 时重新获取快照。
 * emitter 为 undefined 时返回初始快照值。
 */
export function useObservable<T>(
  emitter: Emitter<void> | undefined,
  getSnapshot: () => T
): T {
  const subscribe = (callback: () => void): (() => void) => {
    if (!emitter) return () => {}
    const d = emitter.on(callback)
    return () => d.dispose()
  }

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
