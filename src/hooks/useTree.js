import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { subscribeTrees } from '../services/firestore'

export function useTrees() {
  const uid = useAppStore((s) => s.uid)
  const trees = useAppStore((s) => s.trees)
  const setTrees = useAppStore((s) => s.setTrees)

  useEffect(() => {
    if (!uid) return
    const unsubscribe = subscribeTrees(uid, setTrees, console.error)
    return unsubscribe
  }, [uid, setTrees])

  return trees
}
