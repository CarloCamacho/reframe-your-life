import { useAppStore } from '../../store/appStore.js'

function StatusBadge({ status }) {
  if (status === 'active') {
    return (
      <span className="flex items-center gap-1 text-xs text-green-400">
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
        Active
      </span>
    )
  }
  if (status === 'paused') {
    return (
      <span className="flex items-center gap-1 text-xs text-yellow-400">
        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
        Paused
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-text-muted">
      <span className="text-sm">✓</span>
      Complete
    </span>
  )
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-AU', { month: 'short', day: 'numeric' }).format(date)
}

export default function TreeCard({ tree }) {
  const setActiveTree = useAppStore((s) => s.setActiveTree)

  return (
    <div
      className="bg-surface-raised rounded-xl p-4 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => setActiveTree(tree.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-text-primary font-medium leading-snug">{tree.name}</h2>
        <StatusBadge status={tree.status} />
      </div>

      <div className="mt-2 flex gap-4 text-xs text-text-muted">
        <span>Created {formatDate(tree.createdAt)}</span>
        <span>Updated {formatDate(tree.updatedAt)}</span>
      </div>

      {tree.linkedFromTreeId && (
        <div className="mt-2 flex items-center gap-1 text-xs text-text-muted">
          <span>⛓</span>
          <span>Linked from another tree</span>
        </div>
      )}
    </div>
  )
}
