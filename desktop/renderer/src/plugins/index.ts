import type { Plugin } from '../workbench/types'
import { sessionsPlugin } from './sessions'
import { sessionPagePlugin } from './sessionPage'
import { chatPlugin } from './chat'

/** 内置插件列表（按依赖顺序：sessionPage 依赖 sessions 的 container） */
export const BUILTIN_PLUGINS: Plugin[] = [
  sessionsPlugin,
  chatPlugin,
  sessionPagePlugin
]
