import { useAppStore } from './store/appStore'
import { useAuth } from './hooks/useAuth'
import HomeScreen from './components/Home/HomeScreen'
import TreeCanvas from './components/Tree/TreeCanvas'

export default function App() {
  const currentView = useAppStore((s) => s.currentView)
  const { uid } = useAuth()

  if (!uid) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-text-muted text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'tree' && <TreeCanvas />}
    </div>
  )
}
