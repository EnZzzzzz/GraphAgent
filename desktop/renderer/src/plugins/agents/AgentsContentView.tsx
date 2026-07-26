import { Card, Empty, Typography } from 'antd'

export function AgentsContentView(): JSX.Element {
  return (
    <div style={{ padding: 28 }}>
      <Typography.Title level={3} style={{ marginTop: 0, color: '#1b1f27' }}>
        Agents
      </Typography.Title>
      <Typography.Text type="secondary">
        在这里管理和配置你的 Agent。选择左侧 Agent 查看详情。
      </Typography.Text>
      <Card
        style={{ marginTop: 24, background: '#fafbfd' }}
        styles={{ body: { padding: 48 } }}
      >
        <Empty description="选择一个 Agent 开始" />
      </Card>
    </div>
  )
}
