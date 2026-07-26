import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionListView } from './SessionListView'
import { setActiveSessionId, getActiveSessionId } from './sessionStore'

// Ensure the first session starts selected
beforeEach(() => {
  setActiveSessionId('s1')
})

describe('SessionListView', () => {
  it('renders the brand title "GraphAgent"', () => {
    render(<SessionListView />)
    expect(screen.getByText('GraphAgent')).toBeDefined()
  })

  it('renders all mock sessions', () => {
    render(<SessionListView />)
    expect(screen.getByText('知识图谱问答')).toBeDefined()
    expect(screen.getByText('代码生成任务')).toBeDefined()
    expect(screen.getByText('数据分析助手')).toBeDefined()
  })

  it('renders "新建会话" button', () => {
    render(<SessionListView />)
    expect(screen.getByText('新建会话')).toBeDefined()
  })

  it('updates active session on click', () => {
    render(<SessionListView />)

    // Click on a different session
    fireEvent.click(screen.getByText('代码生成任务'))

    // The store should be updated
    expect(getActiveSessionId()).toBe('s2')
  })
})
