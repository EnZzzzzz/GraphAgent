import { useEffect, useRef, useState } from 'react'
import { Bubble, Sender } from '@ant-design/x'
import { RobotOutlined, UserOutlined } from '@ant-design/icons'
import type { GetProp } from 'antd'
import { useActiveSessionId } from '../sessions/sessionStore'

type BubbleDataType = GetProp<typeof Bubble.List, 'items'>[number]

interface ChatMessage extends BubbleDataType {
  key: string
}

function mockReply(input: string): string {
  return (
    `我收到了你的消息：「${input}」。\n\n` +
    '当前是本地 mock 的流式输出，用于验证 UI：内容会像真实模型一样逐字追加。' +
    '后续接入真实 Agent 时，把这段定时器替换成 SSE / WebSocket 的增量回调即可，组件层不需要改动。\n\n' +
    '支持 **Markdown**、代码块、列表等渲染。'
  )
}

export function ChatPanelView(): JSX.Element {
  const [sessionId] = useActiveSessionId()
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({})
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const currentMessages = messages[sessionId] ?? []

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [currentMessages])

  const handleSend = (text: string): void => {
    if (!text.trim() || loading) return
    setLoading(true)

    const stamp = Date.now()
    const userKey = `${stamp}-u`
    const aiKey = `${stamp}-a`

    setMessages((prev) => ({
      ...prev,
      [sessionId]: [
        ...(prev[sessionId] ?? []),
        { key: userKey, role: 'user', content: text },
        { key: aiKey, role: 'ai', content: '', loading: true }
      ]
    }))

    const reply = mockReply(text)
    let offset = 0
    const timer = setInterval(() => {
      offset += 3
      const done = offset >= reply.length
      const content = reply.slice(0, offset)
      setMessages((prev) => ({
        ...prev,
        [sessionId]: (prev[sessionId] ?? []).map((msg) =>
          msg.key === aiKey ? { ...msg, content, loading: !done && content.length === 0 } : msg
        )
      }))
      if (done) {
        clearInterval(timer)
        setLoading(false)
      }
    }, 24)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '20px 16px 12px',
          fontWeight: 600,
          color: '#1b1f27'
        }}
      >
        <span
          style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ed3b0' }}
        />
        对话 · 流式输出
      </div>

      <div ref={listRef} style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
        <Bubble.List
          items={currentMessages}
          roles={{
            ai: {
              placement: 'start',
              avatar: { icon: <RobotOutlined />, style: { background: '#2ed3b0' } },
              typing: { step: 2, interval: 30 },
              style: { maxWidth: '92%' },
              styles: {
                content: { background: '#e9f7f3', borderRadius: 12, color: '#1b1f27' }
              }
            },
            user: {
              placement: 'end',
              avatar: { icon: <UserOutlined />, style: { background: '#1b1f27' } },
              style: { maxWidth: '92%' },
              styles: {
                content: { background: '#f2f3f7', borderRadius: 12, color: '#1b1f27' }
              }
            }
          }}
        />
      </div>

      <div style={{ padding: 16 }}>
        <Sender
          loading={loading}
          placeholder="输入消息，Enter 发送"
          onSubmit={handleSend}
          disabled={loading}
        />
      </div>
    </div>
  )
}
