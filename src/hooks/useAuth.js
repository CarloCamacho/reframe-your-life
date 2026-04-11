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
