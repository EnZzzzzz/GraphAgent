import { Button, Typography } from 'antd'
import { LeftOutlined, PlusOutlined } from '@ant-design/icons'

export function AgentsTopbarLeft(): JSX.Element {
  return (
    <>
      <Button type="text" size="small" icon={<LeftOutlined />} />
      <Typography.Text strong style={{ fontSize: 15, margin: '0 8px' }}>
        Agents
      </Typography.Text>
      <Button type="text" size="small" icon={<PlusOutlined />} />
    </>
  )
}
