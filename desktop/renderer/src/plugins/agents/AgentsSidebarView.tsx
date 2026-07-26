import { Menu, Typography } from 'antd'
import { RobotOutlined, SwapOutlined } from '@ant-design/icons'
import { getPageManager } from '../../pageManagerInstance'

export function AgentsSidebarView(): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '32px 16px 12px'
        }}
      >
        <Typography.Text strong style={{ fontSize: 16, color: '#1b1f27' }}>
          Agents
        </Typography.Text>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[]}
        style={{ border: 'none', flex: 1, overflow: 'auto', background: 'transparent' }}
        items={[
          { key: 'a1', icon: <RobotOutlined />, label: 'Agent Alpha' },
          { key: 'a2', icon: <RobotOutlined />, label: 'Agent Beta' }
        ]}
      />

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #eceef4'
        }}
      >
        <Menu
          mode="inline"
          selectable={false}
          style={{ border: 'none', background: 'transparent' }}
          items={[
            {
              key: 'switch-session',
              icon: <SwapOutlined />,
              label: '切换到会话页',
              onClick: () => getPageManager().switchPage('session')
            }
          ]}
        />
      </div>
    </div>
  )
}
