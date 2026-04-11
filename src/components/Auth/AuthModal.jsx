import { useState } from 'react'

// mode: 'link' | 'link-sent' | 'pending-link' | 'password'
// passwordMode: 'signin' | 'signup'

export default function AuthModal({ onSendLink, onCompletePendingLink, onSignInPassword, onCreatePassword, onClose, pendingEmailLink = false }) {
  const [mode, setMode] = useState(pendingEmailLink ? 'pending-link' : 'link')
  const [passwordMode, setPasswordMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSendLink(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onSendLink(email)
      setMode('link-sent')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCompletePendingLink(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onCompletePendingLink(email)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (passwordMode === 'signin') {
        await onSignInPassword(email, password)
      } else {
        await onCreatePassword(email, password)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      data-testid="auth-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-surface-raised rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-text-primary font-semibold text-lg">Your account</h2>
          <button
            className="text-text-muted hover:text-text-primary transition-colors text-xl leading-none"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {mode === 'link' && (
          <form onSubmit={handleSendLink} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted border border-surface focus:border-rung-2-active outline-none transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rung-2-active text-white rounded-full py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
            <button
              type="button"
              className="text-text-muted text-sm hover:text-text-primary transition-colors mt-1"
              onClick={() => { setMode('password'); setError(null) }}
            >
              Use password instead
            </button>
          </form>
        )}

        {mode === 'link-sent' && (
          <div className="flex flex-col gap-3 text-center">
            <p className="text-text-primary">
              Check your inbox — we sent a link to <span className="font-medium">{email}</span>.
            </p>
            <p className="text-text-muted text-sm">Click the link in the email to sign in. You can close this.</p>
            <button
              className="text-text-muted text-sm hover:text-text-primary transition-colors mt-2"
              disabled={loading}
              onClick={async () => {
                setLoading(true)
                try { await onSendLink(email) } catch { /* ignore resend errors */ }
                setLoading(false)
              }}
            >
              {loading ? 'Sending…' : 'Resend link'}
            </button>
          </div>
        )}

        {mode === 'pending-link' && (
          <form onSubmit={handleCompletePendingLink} className="flex flex-col gap-3">
            <p className="text-text-muted text-sm">Enter the email address you used to request the sign-in link.</p>
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted border border-surface focus:border-rung-2-active outline-none transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rung-2-active text-white rounded-full py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Complete sign in'}
            </button>
          </form>
        )}

        {mode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted border border-surface focus:border-rung-2-active outline-none transition-colors"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface rounded-lg px-4 py-2.5 text-text-primary placeholder:text-text-muted border border-surface focus:border-rung-2-active outline-none transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rung-2-active text-white rounded-full py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Signing in…' : (passwordMode === 'signin' ? 'Sign in' : 'Create account')}
            </button>
            <div className="flex items-center justify-between mt-1">
              <button
                type="button"
                className="text-text-muted text-sm hover:text-text-primary transition-colors"
                onClick={() => setPasswordMode(m => m === 'signin' ? 'signup' : 'signin')}
              >
                {passwordMode === 'signin' ? 'No account? Sign up' : 'Have an account? Sign in'}
              </button>
              <button
                type="button"
                className="text-text-muted text-sm hover:text-text-primary transition-colors"
                onClick={() => { setMode('link'); setError(null) }}
              >
                Back to magic link
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
