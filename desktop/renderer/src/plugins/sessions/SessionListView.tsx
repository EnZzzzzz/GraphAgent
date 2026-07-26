import { Avatar } from '../../ui/Avatar'
import { Button } from '../../ui/Button'
import { Menu } from '../../ui/Menu'
import { Typography } from '../../ui/Typography'
import { MessageOutlined, PlusOutlined, RobotFilled } from '../../ui/icons'
import { MOCK_SESSIONS } from '../../mock'
import { useActiveSessionId } from './sessionStore'

export function SessionListView(): JSX.Element {
  const [activeSessionId, setActiveSessionId] = useActiveSessionId()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '32px 16px 12px',
          // @ts-expect-error WebKit 私有属性：无边框窗口拖拽区
          WebkitAppRegion: 'drag'
        }}
      >
        <Avatar
          shape="square"
          size={28}
          style={{ background: 'var(--ga-color-primary)', borderRadius: 8 }}
          icon={<RobotFilled />}
        />
        <Typography.Text strong style={{ fontSize: 16, color: 'var(--ga-color-text-base)' }}>
          GraphAgent
        </Typography.Text>
      </div>

      <div style={{ padding: '4px 12px 12px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          style={{ background: 'var(--ga-color-text-base)', borderRadius: 10 }}
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
        onClick={({ key }) => setActiveSessionId(key)}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderTop: '1px solid var(--ga-color-border-subtle)'
        }}
      >
        <Avatar size={28} style={{ background: 'var(--ga-color-bg-avatar)', color: 'var(--ga-color-text-secondary)' }}>
          我
        </Avatar>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          本地用户
        </Typography.Text>
      </div>
    </div>
  )
}
