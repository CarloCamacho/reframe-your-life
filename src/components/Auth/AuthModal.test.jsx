import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AuthModal from './AuthModal'

const defaultProps = {
  onSendLink: vi.fn(() => Promise.resolve()),
  onCompletePendingLink: vi.fn(() => Promise.resolve()),
  onSignInPassword: vi.fn(() => Promise.resolve()),
  onCreatePassword: vi.fn(() => Promise.resolve()),
  onClose: vi.fn(),
}

describe('AuthModal', () => {
  it('renders email input and magic link button by default', () => {
    render(<AuthModal {...defaultProps} />)
    // getBy* throws if not found — presence is the assertion
    screen.getByPlaceholderText(/email/i)
    screen.getByRole('button', { name: /send magic link/i })
  })

  it('shows "check your inbox" after sending magic link', async () => {
    render(<AuthModal {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))
    await screen.findByText(/check your inbox/i)
  })

  it('"Use password instead" reveals password form', () => {
    render(<AuthModal {...defaultProps} />)
    fireEvent.click(screen.getByText(/use password instead/i))
    screen.getByPlaceholderText(/password/i)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<AuthModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('auth-modal-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows pending-link form when pendingEmailLink=true', () => {
    render(<AuthModal {...defaultProps} pendingEmailLink={true} />)
    screen.getByText(/enter the email address/i)
    screen.getByRole('button', { name: /complete sign in/i })
  })
})
