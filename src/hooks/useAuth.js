import { useEffect } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useAppStore } from '../store/appStore'

export function useAuth() {
  const uid = useAppStore((s) => s.uid)
  const setUid = useAppStore((s) => s.setUid)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid)
      } else {
        signInAnonymously(auth).catch(console.error)
      }
    })
    return unsubscribe
  }, [setUid])

  return { uid }
}
