# Auth — Email Sign-In with Anonymous Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add email/password and magic-link sign-in so users can restore saved ladders, migrating their anonymous data to a named account.

**Architecture:** Firebase anonymous auth stays the default entry path. When a user signs in with email, `linkWithCredential` converts the anonymous account to a named one — same UID, same Firestore data, zero migration. A modal at the app level handles sign-in UI; a small account button in HomeScreen's header triggers it.

**Tech Stack:** Firebase Auth 11 (email-link, email/password), React 18, Zustand 5, Tailwind CSS v4, Vitest

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/store/appStore.js` | Modify | Add `authModalOpen` + `setAuthModalOpen` |
| `src/hooks/useAuth.js` | Modify | Add email auth functions, `isAnonymous`, email-link handler |
| `src/components/Auth/AuthModal.jsx` | Create | Sign-in modal — magic link primary, password secondary |
| `src/components/Home/HomeScreen.jsx` | Modify | Add account button to header |
| `src/App.jsx` | Modify | Render `AuthModal`, pass auth props down |

---

## Task 1: Add `authModalOpen` state to store

**Files:**
- Modify: `src/store/appStore.js`
- Create: `src/store/appStore.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/store/appStore.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './appStore'

describe('appStore — auth modal', () => {
  beforeEach(() => {
    useAppStore.setState({ authModalOpen: false })
  })

  it('initializes authModalOpen as false', () => {
    expect(useAppStore.getState().authModalOpen).toBe(false)
  })

  it('setAuthModalOpen(true) opens the modal', () => {
    useAppStore.getState().setAuthModalOpen(true)
    expect(useAppStore.getState().authModalOpen).toBe(true)
  })

  it('setAuthModalOpen(false) closes the modal', () => {
    useAppStore.setState({ authModalOpen: true })
    useAppStore.getState().setAuthModalOpen(false)
    expect(useAppStore.getState().authModalOpen).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bunx vitest run src/store/appStore.test.js
```

Expected: FAIL — `authModalOpen is not a function` or similar (property not defined yet)

- [ ] **Step 3: Add `authModalOpen` to store**

In `src/store/appStore.js`, add to the initial state and actions:

```js
// In the create((set) => ({ ... })) object, add after the Auth actions section:

// Auth modal
authModalOpen: false,
setAuthModalOpen: (open) => set({ authModalOpen: open }),
```

The full updated store (replace the file):

```js
import { create } from 'zustand'

const loadApiKeys = () => {
  try { return JSON.parse(localStorage.getItem('ryl_keys') || '{}') } catch { return {} }
}

export const useAppStore = create((set) => ({
  // Navigation
  currentView: 'home',
  activeTreeId: null,
  chatOpen: false,

  // Auth
  uid: null,
  trees: [],

  // Auth modal
  authModalOpen: false,

  // AI settings (persisted to localStorage)
  activeProvider: localStorage.getItem('ryl_provider') || 'anthropic',
  apiKeys: loadApiKeys(),

  // Navigation actions
  setView: (view) => set({ currentView: view }),
  setActiveTree: (id) => set({ activeTreeId: id, currentView: 'tree', chatOpen: id === 'new' }),
  setActiveTreeIdOnly: (id) => set({ activeTreeId: id }),
  goHome: () => set({ currentView: 'home', activeTreeId: null, chatOpen: false }),
  openChat: () => set({ chatOpen: true }),
  closeChat: () => set({ chatOpen: false }),

  // Auth actions
  setUid: (uid) => set({ uid }),
  setTrees: (trees) => set({ trees }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),

  // AI settings actions
  setActiveProvider: (provider) => {
    localStorage.setItem('ryl_provider', provider)
    set({ activeProvider: provider })
  },
  setApiKey: (provider, key) => set(state => {
    const keys = { ...state.apiKeys, [provider]: key }
    localStorage.setItem('ryl_keys', JSON.stringify(keys))
    return { apiKeys: keys }
  }),
}))
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bunx vitest run src/store/appStore.test.js
```

Expected: PASS — 3 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/store/appStore.js src/store/appStore.test.js
git commit -m "feat(auth): add authModalOpen state to store"
```

---

## Task 2: Extend `useAuth` with email auth functions

**Files:**
- Modify: `src/hooks/useAuth.js`
- Create: `src/hooks/useAuth.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useAuth.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock firebase services before importing the hook
vi.mock('../services/firebase', () => ({ auth: { currentUser: null } }))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, cb) => { cb({ uid: 'anon-1', isAnonymous: true }); return vi.fn() }),
  signInAnonymously: vi.fn(() => Promise.resolve()),
  sendSignInLinkToEmail: vi.fn(() => Promise.resolve()),
  isSignInWithEmailLink: vi.fn(() => false),
  signInWithEmailLink: vi.fn(() => Promise.resolve({ user: { uid: 'user-1', isAnonymous: false } })),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'user-1', isAnonymous: false } })),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'user-1', isAnonymous: false } })),
  linkWithCredential: vi.fn(() => Promise.resolve({ user: { uid: 'anon-1', isAnonymous: false } })),
  EmailAuthProvider: {
    credential: vi.fn(() => ({ providerId: 'password' })),
    credentialWithLink: vi.fn(() => ({ providerId: 'emailLink' })),
  },
  signOut: vi.fn(() => Promise.resolve()),
}))

import { useAuth } from './useAuth'
import { sendSignInLinkToEmail } from 'firebase/auth'

describe('useAuth', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns required shape', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current).toMatchObject({
      uid: expect.any(String),
      isAnonymous: expect.any(Boolean),
      sendSignInLink: expect.any(Function),
      signInWithPassword: expect.any(Function),
      createWithPassword: expect.any(Function),
      signOut: expect.any(Function),
    })
  })

  it('sendSignInLink calls sendSignInLinkToEmail and stores email', async () => {
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.sendSignInLink('test@example.com')
    })
    expect(sendSignInLinkToEmail).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      expect.objectContaining({ handleCodeInApp: true })
    )
    expect(localStorage.getItem('ryl_email_for_signin')).toBe('test@example.com')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bunx vitest run src/hooks/useAuth.test.js
```

Expected: FAIL — `sendSignInLink is not a function` and shape mismatch

- [ ] **Step 3: Rewrite `useAuth` with email auth functions**

Replace `src/hooks/useAuth.js` entirely:

```js
import { useEffect, useState } from 'react'
import {
  signInAnonymously,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAppStore } from '../store/appStore'

const EMAIL_KEY = 'ryl_email_for_signin'

export function useAuth() {
  const setUid = useAppStore((s) => s.setUid)
  const uid = useAppStore((s) => s.uid)
  const [isAnonymous, setIsAnonymous] = useState(true)

  // Auth state listener — creates anonymous session if no user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid)
        setIsAnonymous(user.isAnonymous)
      } else {
        signInAnonymously(auth).catch(console.error)
      }
    })
    return unsubscribe
  }, [setUid])

  // Complete email-link sign-in if the app was opened via a magic link
  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return

    let email = localStorage.getItem(EMAIL_KEY)
    if (!email) {
      // Different device: browser prompt is acceptable for this edge case
      email = window.prompt('Please enter the email address you used to request the sign-in link:')
    }
    if (!email) return

    const currentUser = auth.currentUser

    async function complete() {
      const credential = EmailAuthProvider.credentialWithLink(email, window.location.href)
      if (currentUser?.isAnonymous) {
        try {
          await linkWithCredential(currentUser, credential)
        } catch (err) {
          if (err.code === 'auth/email-already-in-use') {
            await signInWithEmailLink(auth, email, window.location.href)
          } else {
            throw err
          }
        }
      } else {
        await signInWithEmailLink(auth, email, window.location.href)
      }
      localStorage.removeItem(EMAIL_KEY)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    complete().catch(console.error)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function sendSignInLink(email) {
    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    }
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    localStorage.setItem(EMAIL_KEY, email)
  }

  async function signInWithPassword(email, password) {
    const credential = EmailAuthProvider.credential(email, password)
    const currentUser = auth.currentUser
    if (currentUser?.isAnonymous) {
      try {
        await linkWithCredential(currentUser, credential)
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          await signInWithEmailAndPassword(auth, email, password)
        } else {
          throw err
        }
      }
    } else {
      await signInWithEmailAndPassword(auth, email, password)
    }
  }

  async function createWithPassword(email, password) {
    const credential = EmailAuthProvider.credential(email, password)
    const currentUser = auth.currentUser
    if (currentUser?.isAnonymous) {
      try {
        await linkWithCredential(currentUser, credential)
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          // Account exists — sign in instead
          await signInWithEmailAndPassword(auth, email, password)
        } else {
          throw err
        }
      }
    } else {
      await createUserWithEmailAndPassword(auth, email, password)
    }
  }

  async function signOut() {
    await firebaseSignOut(auth)
    // onAuthStateChanged fires with null → new anonymous session is created automatically
  }

  return { uid, isAnonymous, sendSignInLink, signInWithPassword, createWithPassword, signOut }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bunx vitest run src/hooks/useAuth.test.js
```

Expected: PASS — 2 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAuth.js src/hooks/useAuth.test.js
git commit -m "feat(auth): add email-link and password sign-in to useAuth"
```

---

## Task 3: Create `AuthModal` component

**Files:**
- Create: `src/components/Auth/AuthModal.jsx`
- Create: `src/components/Auth/AuthModal.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/Auth/AuthModal.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AuthModal from './AuthModal'

const noop = () => {}
const defaultProps = {
  onSendLink: vi.fn(() => Promise.resolve()),
  onSignInPassword: vi.fn(() => Promise.resolve()),
  onCreatePassword: vi.fn(() => Promise.resolve()),
  onClose: vi.fn(),
}

describe('AuthModal', () => {
  it('renders email input and magic link button by default', () => {
    render(<AuthModal {...defaultProps} />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument()
  })

  it('shows "check your inbox" after sending magic link', async () => {
    render(<AuthModal {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))
    // After async: show success state
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument()
  })

  it('"Use password instead" reveals password form', () => {
    render(<AuthModal {...defaultProps} />)
    fireEvent.click(screen.getByText(/use password instead/i))
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<AuthModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('auth-modal-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bunx vitest run src/components/Auth/AuthModal.test.jsx
```

Expected: FAIL — `Cannot find module './AuthModal'`

- [ ] **Step 3: Create `AuthModal.jsx`**

Create `src/components/Auth/AuthModal.jsx`:

```jsx
import { useState } from 'react'

// mode: 'link' | 'link-sent' | 'password'
// passwordMode: 'signin' | 'signup'

export default function AuthModal({ onSendLink, onSignInPassword, onCreatePassword, onClose }) {
  const [mode, setMode] = useState('link')
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
              className="w-full bg-surface rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted border border-surface focus:border-rung-2-active outline-none transition-colors"
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
            <p className="text-text-primary">Check your inbox — we sent a link to <span className="font-medium">{email}</span>.</p>
            <p className="text-text-muted text-sm">Click the link in the email to sign in. You can close this.</p>
            <button
              className="text-text-muted text-sm hover:text-text-primary transition-colors mt-2"
              onClick={async () => {
                setLoading(true)
                try { await onSendLink(email) } catch { /* ignore */ }
                setLoading(false)
              }}
            >
              {loading ? 'Sending…' : 'Resend link'}
            </button>
          </div>
        )}

        {mode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted border border-surface focus:border-rung-2-active outline-none transition-colors"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted border border-surface focus:border-rung-2-active outline-none transition-colors"
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
bunx vitest run src/components/Auth/AuthModal.test.jsx
```

Expected: PASS — 4 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/Auth/AuthModal.jsx src/components/Auth/AuthModal.test.jsx
git commit -m "feat(auth): add AuthModal component with magic link and password flows"
```

---

## Task 4: Add account button to `HomeScreen`

**Files:**
- Modify: `src/components/Home/HomeScreen.jsx`

The account button receives `isAnonymous`, `email`, and `onSignInClick`/`onSignOut` as props so HomeScreen stays presentational.

- [ ] **Step 1: Write the failing test**

Add to `src/components/Home/HomeScreen.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock zustand store
vi.mock('../../store/appStore.js', () => ({
  useAppStore: vi.fn((selector) => selector({
    setActiveTree: vi.fn(),
  })),
}))

// Mock useTree hook
vi.mock('../../hooks/useTree.js', () => ({
  useTrees: vi.fn(() => []),
}))

import HomeScreen from './HomeScreen'

describe('HomeScreen', () => {
  it('shows Sign in button when anonymous', () => {
    render(<HomeScreen isAnonymous={true} onSignInClick={vi.fn()} onSignOut={vi.fn()} userEmail={null} />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows user email when authenticated', () => {
    render(<HomeScreen isAnonymous={false} onSignInClick={vi.fn()} onSignOut={vi.fn()} userEmail="ian@example.com" />)
    expect(screen.getByText(/ian@/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bunx vitest run src/components/Home/HomeScreen.test.jsx
```

Expected: FAIL — `Sign in` button not found (prop not wired yet)

- [ ] **Step 3: Update `HomeScreen` to accept auth props and render account button**

Replace `src/components/Home/HomeScreen.jsx`:

```jsx
import { useState } from 'react'
import { useAppStore } from '../../store/appStore.js'
import { useTrees } from '../../hooks/useTree.js'
import TreeCard from './TreeCard.jsx'

function LadderLogo() {
  return (
    <img src="/ladder.png" alt="Ladder" width={280} height={280} style={{ objectFit: 'contain' }} />
  )
}

function AccountButton({ isAnonymous, userEmail, onSignInClick, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false)

  if (isAnonymous) {
    return (
      <button
        className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-sm"
        onClick={onSignInClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Sign in
      </button>
    )
  }

  // Truncate email: show up to first 8 chars + @domain
  const displayEmail = userEmail
    ? userEmail.replace(/^(.{1,8})(.*)(@.*)$/, (_, a, b, c) => b.length > 0 ? `${a}…${c}` : userEmail)
    : ''

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-sm"
        onClick={() => setMenuOpen(o => !o)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {displayEmail}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-surface-raised border border-surface rounded-lg shadow-lg py-1 min-w-[120px]">
            <button
              className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
              onClick={() => { setMenuOpen(false); onSignOut() }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function HomeScreen({ isAnonymous, userEmail, onSignInClick, onSignOut }) {
  const setActiveTree = useAppStore((s) => s.setActiveTree)
  const trees = useTrees()

  const rootTrees = trees.filter(t => !t.linkedFromTreeId)
  const branchMap = trees.reduce((acc, t) => {
    if (t.linkedFromTreeId) {
      acc[t.linkedFromTreeId] = [...(acc[t.linkedFromTreeId] || []), t]
    }
    return acc
  }, {})

  return (
    <div
      className="min-h-screen bg-surface"
      style={{
        backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex justify-end mb-2">
          <AccountButton
            isAnonymous={isAnonymous}
            userEmail={userEmail}
            onSignInClick={onSignInClick}
            onSignOut={onSignOut}
          />
        </div>

        <div className="mb-8 flex flex-col items-center text-center gap-3">
          <LadderLogo />
          <div>
            <p className="text-text-muted text-xs uppercase tracking-widest mb-0.5">
              Kellian Labs
            </p>
            <h1 className="text-2xl font-bold text-text-primary">
              Reframe Your Life
            </h1>
          </div>
        </div>

        <button
          className="w-full bg-rung-2-active text-white rounded-full py-3 font-medium mb-8 hover:opacity-90 transition-opacity"
          onClick={() => setActiveTree('new')}
        >
          Start New Ladder
        </button>

        {rootTrees.length === 0 ? (
          <p className="text-text-muted text-center">
            No ladders yet. Start your first reframe.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {rootTrees.map((tree) => {
              const branches = branchMap[tree.id] || []
              return (
                <div key={tree.id}>
                  <TreeCard tree={tree} />
                  {branches.length > 0 && (
                    <div className="ml-4 mt-2 flex flex-col gap-2 border-l border-surface-raised pl-3">
                      <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Connected ladders</p>
                      {branches.map(branch => (
                        <TreeCard key={branch.id} tree={branch} compact />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bunx vitest run src/components/Home/HomeScreen.test.jsx
```

Expected: PASS — 2 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/components/Home/HomeScreen.jsx src/components/Home/HomeScreen.test.jsx
git commit -m "feat(auth): add account button to HomeScreen header"
```

---

## Task 5: Wire `AuthModal` and auth props into `App`

**Files:**
- Modify: `src/App.jsx`

`App` already calls `useAuth()`. Extend it to pass auth props to `HomeScreen` and mount `AuthModal` conditionally.

- [ ] **Step 1: Update `App.jsx`**

Replace `src/App.jsx`:

```jsx
import { useAppStore } from './store/appStore'
import { useAuth } from './hooks/useAuth'
import HomeScreen from './components/Home/HomeScreen'
import TreeCanvas from './components/Tree/TreeCanvas'
import ChatPanel from './components/Chat/ChatPanel'
import AuthModal from './components/Auth/AuthModal'

export default function App() {
  const currentView = useAppStore(s => s.currentView)
  const chatOpen = useAppStore(s => s.chatOpen)
  const authModalOpen = useAppStore(s => s.authModalOpen)
  const setAuthModalOpen = useAppStore(s => s.setAuthModalOpen)

  const { uid, isAnonymous, sendSignInLink, signInWithPassword, createWithPassword, signOut } = useAuth()

  // Firebase user object for email — read directly from auth
  // We derive the email from the Firebase auth object via the uid change
  const userEmail = !isAnonymous && uid ? (window.__firebaseAuth?.currentUser?.email ?? null) : null

  if (!uid) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-text-muted text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      {currentView === 'home' && (
        <HomeScreen
          isAnonymous={isAnonymous}
          userEmail={userEmail}
          onSignInClick={() => setAuthModalOpen(true)}
          onSignOut={signOut}
        />
      )}
      {currentView === 'tree' && (
        <div className="flex h-screen overflow-hidden">
          <div className="flex-1 relative min-w-0">
            <TreeCanvas />
          </div>
          {chatOpen && (
            <div className="fixed bottom-0 left-0 right-0 h-[72vh] md:relative md:bottom-auto md:h-full md:w-96 md:flex-shrink-0 bg-surface border-t border-surface-raised md:border-t-0 md:border-l flex flex-col z-20">
              <ChatPanel />
            </div>
          )}
        </div>
      )}
      {authModalOpen && (
        <AuthModal
          onSendLink={sendSignInLink}
          onSignInPassword={signInWithPassword}
          onCreatePassword={createWithPassword}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Expose user email from Firebase auth**

The `userEmail` in `App` above reads `window.__firebaseAuth`. We need to set this up. Update `src/services/firebase.js` to expose auth on window in dev, OR — simpler — track email in Zustand when auth state changes. Update `useAuth.js` to store the email:

In `src/store/appStore.js`, add `userEmail: null` and `setUserEmail`:

```js
// In state:
userEmail: null,

// In actions:
setUserEmail: (email) => set({ userEmail: email }),
```

In `src/hooks/useAuth.js`, update the `onAuthStateChanged` callback to also set email:

```js
// At top of useAuth, add:
const setUserEmail = useAppStore((s) => s.setUserEmail)

// In the onAuthStateChanged callback, update to:
onAuthStateChanged(auth, (user) => {
  if (user) {
    setUid(user.uid)
    setIsAnonymous(user.isAnonymous)
    setUserEmail(user.email ?? null)
  } else {
    signInAnonymously(auth).catch(console.error)
  }
})
```

In `src/App.jsx`, replace the `userEmail` derivation line with:

```js
const userEmail = useAppStore(s => s.userEmail)
```

And remove the `window.__firebaseAuth` line entirely.

- [ ] **Step 3: Run all tests**

```bash
bunx vitest run
```

Expected: All previously passing tests still pass

- [ ] **Step 4: Start dev server and manually verify**

```bash
bun run dev
```

Open `http://localhost:5173` and verify:
1. Home screen shows "Sign in" button top-right
2. Clicking "Sign in" opens the modal
3. Modal shows email input + "Send magic link" button
4. "Use password instead" reveals password form
5. Clicking backdrop or × closes modal
6. Entering email and clicking "Send magic link" shows "Check your inbox" state

> **Note:** Magic link email delivery requires `localhost:5173` (or your production domain) to be in Firebase Console → Authentication → Settings → Authorized domains. Add it if not already there.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/store/appStore.js src/hooks/useAuth.js
git commit -m "feat(auth): wire AuthModal and auth props into App"
```

---

## Task 6: Full sign-in flow end-to-end test

- [ ] **Step 1: Test magic link flow end-to-end**

With dev server running:
1. Click "Sign in" → enter your real email → "Send magic link"
2. Check email inbox → click the magic link
3. App should reload, URL clears, account button shows your email address
4. Refresh page — should stay signed in

- [ ] **Step 2: Test password flow**

1. Click account button → "Sign out"
2. Click "Sign in" → "Use password instead" → "No account? Sign up"
3. Enter email + password → "Create account"
4. Account button should show email

- [ ] **Step 3: Test sign-out**

1. Click email in account button → dropdown appears
2. Click "Sign out"
3. Account button returns to "Sign in"
4. App still works (new anonymous session silently created)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(auth): complete email sign-in with anonymous migration"
```
