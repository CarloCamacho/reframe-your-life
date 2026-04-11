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

// Bun overrides jsdom's localStorage with a broken stub — provide a working one
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: false })

describe('useAuth', () => {
  beforeEach(() => { vi.clearAllMocks(); localStorageMock.clear() })

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
