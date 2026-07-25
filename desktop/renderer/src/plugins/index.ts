import type { Plugin } from '../workbench/types'
import { sessionsPlugin } from './sessions'
import { sessionPagePlugin } from './sessionPage'
import { chatPlugin } from './chat'
import { agentsPlugin } from './agents'

/** 内置插件列表（按依赖顺序） */
export const BUILTIN_PLUGINS: Plugin[] = [
  sessionsPlugin,
  chatPlugin,
  agentsPlugin,
  sessionPagePlugin
]
