import { useAppStore } from '../../store/appStore.js'
import { useTrees } from '../../hooks/useTree.js'
import TreeCard from './TreeCard.jsx'

export default function HomeScreen() {
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

        {rootTrees.length === 0 ? (
          <p className="text-text-muted text-center">
            No trees yet. Start your first reframe.
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
                      <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Explored paths</p>
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
