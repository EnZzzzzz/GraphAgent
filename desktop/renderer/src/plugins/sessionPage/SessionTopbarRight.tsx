import { Button, Tooltip, Typography } from 'antd'
import { CaretRightOutlined, MoreOutlined, CheckCircleFilled } from '@ant-design/icons'

export function SessionTopbarRight(): JSX.Element {
  return (
    <>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
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
