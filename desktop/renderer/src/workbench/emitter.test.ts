import { describe, it, expect, vi } from 'vitest'
import { Emitter } from './emitter'

describe('Emitter', () => {
  it('registers a listener and calls it on fire with correct argument', () => {
    const emitter = new Emitter<string>()
    const fn = vi.fn()
    emitter.on(fn)
    emitter.fire('hello')
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('hello')
  })

  it('calls all registered listeners on fire', () => {
    const emitter = new Emitter<number>()
    const a = vi.fn()
    const b = vi.fn()
    const c = vi.fn()
    emitter.on(a)
    emitter.on(b)
    emitter.on(c)
    emitter.fire(42)
    expect(a).toHaveBeenCalledWith(42)
    expect(b).toHaveBeenCalledWith(42)
    expect(c).toHaveBeenCalledWith(42)
  })

  it('does not call disposed listener', () => {
    const emitter = new Emitter<void>()
    const fn = vi.fn()
    const d = emitter.on(fn)
    d.dispose()
    emitter.fire()
    expect(fn).not.toHaveBeenCalled()
  })

  it('supports registering same listener multiple times — each disposable independent', () => {
    const emitter = new Emitter<void>()
    const fn = vi.fn()
    const d1 = emitter.on(fn)
    const d2 = emitter.on(fn)
    emitter.fire()
    expect(fn).toHaveBeenCalledTimes(2)

    d1.dispose()
    emitter.fire()
    expect(fn).toHaveBeenCalledTimes(3) // only d2 fires

    d2.dispose()
    emitter.fire()
    expect(fn).toHaveBeenCalledTimes(3) // neither fires now
  })

  it('snapshots listeners before iteration — self-dispose during fire does not affect current iteration', () => {
    const emitter = new Emitter<string>()
    const received: string[] = []
    let firstDisposable: ReturnType<typeof emitter.on>

    const first = vi.fn((_event: string) => {
      // self-dispose inside fire
      firstDisposable.dispose()
      received.push('first')
    })
    const second = vi.fn((_event: string) => {
      received.push('second')
    })

    firstDisposable = emitter.on(first)
    emitter.on(second)

    emitter.fire('x')

    // both should have been called
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
    expect(received).toEqual(['first', 'second'])

    // on next fire, first should NOT be called (it was disposed)
    emitter.fire('y')
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(2)
  })

  it('does not call listeners added during fire in the current fire', () => {
    const emitter = new Emitter<number>()
    const called: number[] = []
    // Store the spy added mid-fire so we can assert on it later
    const spies: Array<ReturnType<typeof vi.fn>> = []

    const adder = vi.fn((n: number) => {
      called.push(n)
      // register a new listener mid-fire
      const newSpy = vi.fn((x: number) => called.push(x + 100))
      spies.push(newSpy)
      emitter.on(newSpy)
    })

    emitter.on(adder)
    emitter.fire(1)

    // adder should have been called for event 1
    expect(adder).toHaveBeenCalledWith(1)
    // added spy should NOT have been called during this fire
    expect(spies[0]).not.toHaveBeenCalled()
    expect(called).toEqual([1])

    // on next fire, the newly added listener should be called
    emitter.fire(2)
    expect(spies[0]).toHaveBeenCalledWith(2)
    expect(called).toEqual([1, 2, 102])
  })

  it('after dispose, on() returns no-op disposable and fire() is silent', () => {
    const emitter = new Emitter<string>()
    const fn = vi.fn()
    emitter.on(fn)
    emitter.dispose()

    // fire after dispose — silent
    emitter.fire('should not fire')
    expect(fn).not.toHaveBeenCalled()

    // on after dispose — returns no-op, doesn't throw
    const fn2 = vi.fn()
    const d = emitter.on(fn2)
    expect(() => d.dispose()).not.toThrow()
    emitter.fire('still silent')
    expect(fn2).not.toHaveBeenCalled()
  })
})
