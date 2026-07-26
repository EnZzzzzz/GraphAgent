import { useState, useCallback } from 'react'
import { Input } from 'antd'
import { SearchOutlined, CloseCircleFilled } from './icons'

interface TopbarSearchInputProps {
  placeholder?: string
  onSearch?: (value: string) => void
}

/**
 * 顶部导航搜索框组合组件。
 * 样式消费 CSS token 变量，作为组合组件的示范。
 */
export function TopbarSearchInput({
  placeholder = '搜索...',
  onSearch
}: TopbarSearchInputProps): JSX.Element {
  const [value, setValue] = useState('')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
    },
    []
  )

  const handleClear = useCallback(() => {
    setValue('')
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(value)
      }
    },
    [value, onSearch]
  )

  return (
    <Input
      prefix={
        <SearchOutlined
          style={{ color: 'var(--ga-color-text-secondary)', fontSize: 'var(--ga-font-size-small)' }}
        />
      }
      suffix={
        value ? (
          <CloseCircleFilled
            onClick={handleClear}
            style={{
              color: 'var(--ga-color-text-secondary)',
              cursor: 'pointer',
              fontSize: 'var(--ga-font-size-small)'
            }}
          />
        ) : undefined
      }
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      style={{
        borderRadius: 'var(--ga-radius-control)',
        background: 'var(--ga-color-bg-panel-sunken)',
        border: 'none'
      }}
    />
  )
}
