import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

function SmokeProbe() {
  return <div>graph-agent smoke</div>
}

describe('test infrastructure smoke test', () => {
  it('renders a trivial component and finds its text', () => {
    render(<SmokeProbe />)
    expect(screen.getByText('graph-agent smoke')).toBeDefined()
  })
})
