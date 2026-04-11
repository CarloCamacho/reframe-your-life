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
  const [pendingEmailLink, setPendingEmailLink] = useState(false)
  const [linkError, setLinkError] = useState(null)

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

    const email = localStorage.getItem(EMAIL_KEY)
    if (!email) {
      setPendingEmailLink(true)
      return
    }

    _doLinkSignIn(email).catch((err) => setLinkError(err.message))
  }, []) // runs once on mount to check if the URL contains a Firebase email link

  // Shared link-completion logic used by the mount effect and completePendingLink
  async function _doLinkSignIn(email) {
    const currentUser = auth.currentUser
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

  async function completePendingLink(email) {
    setLinkError(null)
    try {
      await _doLinkSignIn(email)
      setPendingEmailLink(false)
    } catch (err) {
      setLinkError(err.message)
    }
  }

  async function sendSignInLink(email) {
    setLinkError(null)
    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      }
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      localStorage.setItem(EMAIL_KEY, email)
    } catch (err) {
      setLinkError(err.message)
      throw err
    }
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
          await signInWithEmailAndPassword(auth, email, password)
        } else {
          throw err
        }
      }
    } else {
      // Non-anonymous user: create account directly; throws auth/email-already-in-use if account exists
      await createUserWithEmailAndPassword(auth, email, password)
    }
  }

  async function signOut() {
    setUid(null)
    await firebaseSignOut(auth)
    // onAuthStateChanged fires with null → new anonymous session is created automatically
  }

  return { uid, isAnonymous, pendingEmailLink, linkError, completePendingLink, sendSignInLink, signInWithPassword, createWithPassword, signOut }
}
