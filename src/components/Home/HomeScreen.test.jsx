import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../store/appStore.js', () => ({
  useAppStore: vi.fn((selector) => selector({ setActiveTree: vi.fn() })),
}))

vi.mock('../../hooks/useTree.js', () => ({
  useTrees: vi.fn(() => []),
}))

import HomeScreen from './HomeScreen'

describe('HomeScreen', () => {
  it('shows Sign in button when anonymous', () => {
    render(<HomeScreen isAnonymous={true} onSignInClick={vi.fn()} onSignOut={vi.fn()} userEmail={null} />)
    screen.getByRole('button', { name: /sign in/i })
  })

  it('shows user email when authenticated', () => {
    render(<HomeScreen isAnonymous={false} onSignInClick={vi.fn()} onSignOut={vi.fn()} userEmail="ian@example.com" />)
    screen.getByText(/ian@/i)
  })

  it.todo('renders list of mock trees (HOME-01)')
  it.todo('clicking Start New Tree navigates to tree view (HOME-02)')
})
