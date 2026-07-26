import { Button, Typography } from '../../ui'
import { LeftOutlined, EditOutlined, UndoOutlined, RedoOutlined } from '../../ui/icons'
import { MOCK_SESSIONS } from '../../mock'
import { getActiveSessionId } from '../sessions/sessionStore'

export function SessionTopbarLeft(): JSX.Element {
  const activeSession = MOCK_SESSIONS.find((s) => s.id === getActiveSessionId())
  const title = activeSession?.title ?? ''

  return (
    <>
      <Button type="text" size="small" icon={<LeftOutlined />} />
      <Typography.Text strong style={{ fontSize: 15, margin: '0 4px' }} ellipsis>
        {title}
      </Typography.Text>
      <Button type="text" size="small" icon={<EditOutlined />} />
      <Button type="text" size="small" icon={<UndoOutlined />} style={{ marginLeft: 8 }} />
      <Button type="text" size="small" icon={<RedoOutlined />} />
    </>
  )
}
