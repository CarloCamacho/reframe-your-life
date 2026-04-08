import { useAppStore } from './store/appStore'
import { useAuth } from './hooks/useAuth'
import HomeScreen from './components/Home/HomeScreen'
import TreeCanvas from './components/Tree/TreeCanvas'
import ChatPanel from './components/Chat/ChatPanel'

export default function App() {
  const currentView = useAppStore(s => s.currentView)
  const chatOpen = useAppStore(s => s.chatOpen)
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
    </div>
  )
}
