import { useAppStore } from './store/appStore'
import HomeScreen from './components/Home/HomeScreen'
import TreeCanvas from './components/Tree/TreeCanvas'

export default function App() {
  const currentView = useAppStore((s) => s.currentView)

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'tree' && <TreeCanvas />}
    </div>
  )
}
