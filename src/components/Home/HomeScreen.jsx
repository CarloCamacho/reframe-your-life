import { useAppStore } from '../../store/appStore.js'
import { MOCK_TREES } from '../../data/mockTrees.js'
import TreeCard from './TreeCard.jsx'

export default function HomeScreen() {
  const setActiveTree = useAppStore((s) => s.setActiveTree)

  const sortedTrees = [...MOCK_TREES].sort(
    (a, b) => b.updatedAt - a.updatedAt
  )

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-text-muted text-xs uppercase tracking-widest mb-1">
            Kellian Labs
          </p>
          <h1 className="text-2xl font-bold text-text-primary">
            Reframe Your Life
          </h1>
        </div>

        <button
          className="w-full bg-rung-2-active text-white rounded-full py-3 font-medium mb-8 hover:opacity-90 transition-opacity"
          onClick={() => setActiveTree('new')}
        >
          Start New Tree
        </button>

        {sortedTrees.length === 0 ? (
          <p className="text-text-muted text-center">
            No trees yet. Start your first reframe.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedTrees.map((tree) => (
              <TreeCard key={tree.id} tree={tree} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
