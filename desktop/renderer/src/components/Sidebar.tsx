import { Avatar, Button, Menu, Typography } from 'antd'
import { MessageOutlined, PlusOutlined, RobotFilled } from '@ant-design/icons'
import { MOCK_SESSIONS } from '../mock'

interface SidebarProps {
  activeSessionId: string
  onSelectSession: (id: string) => void
}

export default function Sidebar({ activeSessionId, onSelectSession }: SidebarProps): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          /* 顶部留白避让 macOS 内嵌红绿灯按钮 */
          padding: '32px 16px 12px',
          // @ts-expect-error WebKit 私有属性：无边框窗口拖拽区
          WebkitAppRegion: 'drag'
        }}
      >
        <Avatar
          shape="square"
          size={28}
          style={{ background: '#2ed3b0', borderRadius: 8 }}
          icon={<RobotFilled />}
        />
        <Typography.Text strong style={{ fontSize: 16, color: '#1b1f27' }}>
          GraphAgent
        </Typography.Text>
      </div>

      <div style={{ padding: '4px 12px 12px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          style={{ background: '#1b1f27', borderRadius: 10 }}
        >
          新建会话
        </Button>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[activeSessionId]}
        style={{ border: 'none', flex: 1, overflow: 'auto', background: 'transparent' }}
        items={MOCK_SESSIONS.map((s) => ({
          key: s.id,
          icon: <MessageOutlined />,
          label: s.title
        }))}
        onClick={({ key }) => onSelectSession(key)}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderTop: '1px solid #eceef4'
        }}
      >
        <Avatar size={28} style={{ background: '#e4e7f0', color: '#8a8f9c' }}>
          我
        </Avatar>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          本地用户
        </Typography.Text>
      </div>
    </div>
  )
}
