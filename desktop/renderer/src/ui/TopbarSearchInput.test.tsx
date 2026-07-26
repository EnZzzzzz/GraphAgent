import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopbarSearchInput } from './TopbarSearchInput'

describe('TopbarSearchInput', () => {
  it('renders with default placeholder', () => {
    render(<TopbarSearchInput />)
    expect(screen.getByPlaceholderText('搜索...')).toBeDefined()
  })

  it('renders with custom placeholder', () => {
    render(<TopbarSearchInput placeholder="查找..." />)
    expect(screen.getByPlaceholderText('查找...')).toBeDefined()
  })

  it('updates value on input', () => {
    render(<TopbarSearchInput />)
    const input = screen.getByPlaceholderText('搜索...')
    fireEvent.change(input, { target: { value: 'hello' } })
    expect((input as HTMLInputElement).value).toBe('hello')
  })

  it('calls onSearch on Enter', () => {
    const onSearch = vi.fn()
    render(<TopbarSearchInput onSearch={onSearch} />)
    const input = screen.getByPlaceholderText('搜索...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledWith('test')
  })

  it('clears value on clear button click', () => {
    render(<TopbarSearchInput />)
    const input = screen.getByPlaceholderText('搜索...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(input.value).toBe('abc')

    // Find the clear icon and click it
    const clearIcon = document.querySelector('.anticon-close-circle')
    expect(clearIcon).toBeDefined()
    if (clearIcon) {
      fireEvent.click(clearIcon)
    }

    expect(input.value).toBe('')
  })
})
