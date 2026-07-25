import { useState, useEffect } from 'react'

// Module-level session state — shared by all components within the sessions plugin.

let _activeId = 's1'
const _listeners = new Set<() => void>()

export function getActiveSessionId(): string {
  return _activeId
}

export function setActiveSessionId(id: string): void {
  _activeId = id
  _listeners.forEach((fn) => fn())
}

export function useActiveSessionId(): [string, (id: string) => void] {
  const [id, setId] = useState(_activeId)

  useEffect(() => {
    const fn = (): void => setId(_activeId)
    _listeners.add(fn)
    return () => {
      _listeners.delete(fn)
    }
  }, [])

  return [id, setActiveSessionId]
}
