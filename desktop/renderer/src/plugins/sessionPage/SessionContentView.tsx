import { Card, Empty, Typography } from 'antd'
import { getActiveSessionId } from '../sessions/sessionStore'

export function SessionContentView(): JSX.Element {
  const sessionId = getActiveSessionId()

  return (
    <div style={{ padding: 28 }}>
      <Typography.Title level={3} style={{ marginTop: 0, color: 'var(--ga-color-text-base)' }}>
        内容显示区
      </Typography.Title>
      <Typography.Text type="secondary">
        当前会话：{sessionId}。这里用于展示中间产物——文档、图表、搜索结果、工具调用的结构化输出等。
      </Typography.Text>
      <Card
        style={{ marginTop: 24, background: 'var(--ga-color-bg-panel-sunken)' }}
        styles={{ body: { padding: 48 } }}
      >
        <Empty description="暂无内容，在右侧发起一次对话试试" />
      </Card>
    </div>
  )
}
