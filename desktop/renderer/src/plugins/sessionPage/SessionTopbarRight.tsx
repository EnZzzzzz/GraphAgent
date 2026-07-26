import { Button, Typography, Tooltip } from '../../ui'
import { CaretRightOutlined, MoreOutlined, CheckCircleFilled } from '../../ui/icons'

export function SessionTopbarRight(): JSX.Element {
  return (
    <>
      <Typography.Text type="secondary" style={{ fontSize: 'var(--ga-font-size-sm)' }}>
        <CheckCircleFilled style={{ color: 'var(--ga-color-primary)', marginRight: 4 }} />
        已自动保存
      </Typography.Text>
      <Tooltip title="测试运行">
        <Button type="text" size="small" icon={<CaretRightOutlined />}>
          Test
        </Button>
      </Tooltip>
      <Button type="text" size="small" icon={<MoreOutlined />} />
    </>
  )
}
