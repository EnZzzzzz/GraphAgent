import { Button, Tooltip, Typography } from 'antd'
import {
  LeftOutlined,
  EditOutlined,
  UndoOutlined,
  RedoOutlined,
  CaretRightOutlined,
  MoreOutlined,
  CheckCircleFilled
} from '@ant-design/icons'

interface TopbarProps {
  title: string
}

export default function Topbar({ title }: TopbarProps): JSX.Element {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <Button type="text" size="small" icon={<LeftOutlined />} />
        <Typography.Text strong style={{ fontSize: 15, margin: '0 4px' }} ellipsis>
          {title}
        </Typography.Text>
        <Button type="text" size="small" icon={<EditOutlined />} />
        <Button type="text" size="small" icon={<UndoOutlined />} style={{ marginLeft: 8 }} />
        <Button type="text" size="small" icon={<RedoOutlined />} />
      </div>

      <div className="topbar-center">
        <span className="step step-active">
          <span>①</span> 调试
        </span>
        <span className="step">
          <span>②</span> 发布
        </span>
      </div>

      <div className="topbar-right">
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          <CheckCircleFilled style={{ color: '#2ed3b0', marginRight: 4 }} />
          已自动保存
        </Typography.Text>
        <Tooltip title="测试运行">
          <Button type="text" size="small" icon={<CaretRightOutlined />}>
            Test
          </Button>
        </Tooltip>
        <Button type="text" size="small" icon={<MoreOutlined />} />
      </div>
    </div>
  )
}
