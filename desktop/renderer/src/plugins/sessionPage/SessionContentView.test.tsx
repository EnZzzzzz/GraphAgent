import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SessionContentView } from './SessionContentView'
import { setActiveSessionId } from '../sessions/sessionStore'

describe('SessionContentView', () => {
  beforeEach(() => {
    setActiveSessionId('s1')
  })

  it('renders the content title', () => {
    render(<SessionContentView />)
    expect(screen.getByText('内容显示区')).toBeDefined()
  })

  it('displays the active session id', () => {
    setActiveSessionId('s2')
    render(<SessionContentView />)
    expect(screen.getByText(/当前会话：s2/)).toBeDefined()
  })

  it('renders Empty placeholder', () => {
    render(<SessionContentView />)
    expect(screen.getByText('暂无内容，在右侧发起一次对话试试')).toBeDefined()
  })
})
