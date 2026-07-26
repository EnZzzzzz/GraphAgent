import { Registry } from './registry'
import type { Disposable } from './emitter'
import type { Plugin, PluginContext } from './types'

export class PluginHost {
  /**
   * 依次 activate 所有插件，返回聚合 Disposable。
   */
  activateBuiltin(plugins: Plugin[]): Disposable {
    const disposables: Disposable[] = []

    for (const plugin of plugins) {
      const ctx: PluginContext = {
        registerContribution: (contribution) => {
          Registry.instance.registerContribution(contribution)
        }
      }

      try {
        const result = plugin.activate(ctx)
        if (result === undefined || result === null) {
          // void — nothing to collect
        } else if (Array.isArray(result)) {
          disposables.push(...result)
        } else {
          disposables.push(result)
        }
      } catch (_err) {
        // 记录错误但继续 activate 后续插件
      }
    }

    // 聚合 Disposable：逆序 dispose
    return {
      dispose: () => {
        for (let i = disposables.length - 1; i >= 0; i--) {
          try {
            disposables[i].dispose()
          } catch (_err) {
            // 记录但不阻断
          }
        }
      }
    }
  }
}
