import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'
import { Typography } from './Typography'
import { Avatar } from './Avatar'
import { Menu } from './Menu'
import { Tooltip } from './Tooltip'
import { Card } from './Card'
import { Empty } from './Empty'
import { RobotOutlined } from './icons'

describe('ui/', () => {
  it('Button renders', () => {
    render(<Button>Click</Button>)
    expect(screen.getByText('Click')).toBeDefined()
  })

  it('Typography renders', () => {
    render(<Typography.Text>Hello</Typography.Text>)
    expect(screen.getByText('Hello')).toBeDefined()
  })

  it('Avatar renders', () => {
    render(<Avatar>A</Avatar>)
    expect(screen.getByText('A')).toBeDefined()
  })

  it('Menu renders', () => {
    render(<Menu items={[{ key: '1', label: 'Menu 1' }]} />)
    expect(screen.getByText('Menu 1')).toBeDefined()
  })

  it('Tooltip renders', () => {
    render(<Tooltip title="tip"><span>hover</span></Tooltip>)
    expect(screen.getByText('hover')).toBeDefined()
  })

  it('Card renders', () => {
    render(<Card>content</Card>)
    expect(screen.getByText('content')).toBeDefined()
  })

  it('Empty renders', () => {
    render(<Empty description="nothing" />)
    expect(screen.getByText('nothing')).toBeDefined()
  })

  it('icons re-export works', () => {
    render(<RobotOutlined />)
    expect(document.body).toBeDefined()
  })
})
