import { Handle, Position } from '@xyflow/react'

export default function TreeNode({ id, data, selected }) {
  const { rung, status, label, onGoDeeper, onExplore } = data

  let rungClasses = ''
  if (rung === 1) {
    rungClasses = 'border-rung-root text-text-primary'
  } else if (rung === 2 && status !== 'dormant') {
    rungClasses = 'border-rung-2-active bg-rung-2-active/10 text-rung-2-active'
  } else if (rung === 2 && status === 'dormant') {
    rungClasses = 'border-rung-2-dormant text-text-muted opacity-50'
  } else if (rung === 3) {
    rungClasses = 'border-rung-3 bg-rung-3/10 text-rung-3'
  }

  const selectedClasses = selected ? 'ring-2 ring-white/40' : ''

  return (
    <div
      className={`rounded-xl border-2 px-3 py-2 text-sm font-medium max-w-[180px] text-center bg-surface-raised cursor-pointer transition-all ${rungClasses} ${selectedClasses}`}
    >
      {/* Target handle: Rung 2 and Rung 3 receive connections from below */}
      {rung !== 1 && (
        <Handle type="target" position={Position.Bottom} />
      )}

      {/* Source handle: Rung 1 and Rung 2 send connections upward */}
      {rung !== 3 && (
        <Handle type="source" position={Position.Top} />
      )}

      <span>{label}</span>

      {rung === 2 && status === 'active' && (
        <button
          className="mt-2 text-xs px-2 py-0.5 rounded bg-rung-2-active text-white"
          onClick={() => console.log('Continue clicked')}
        >
          Continue
        </button>
      )}

      {rung === 2 && status === 'dormant' && onExplore && (
        <button
          className="mt-2 block w-full text-xs px-2 py-0.5 rounded bg-rung-2-dormant/20 text-text-muted hover:text-text-primary hover:bg-rung-2-dormant/40 transition-colors"
          onClick={(e) => { e.stopPropagation(); onExplore(id, label) }}
        >
          Explore →
        </button>
      )}

      {rung === 3 && onGoDeeper && (
        <button
          className="mt-2 block w-full text-xs px-2 py-0.5 rounded bg-rung-3/20 text-rung-3 hover:bg-rung-3/40 transition-colors"
          onClick={(e) => { e.stopPropagation(); onGoDeeper(id, label) }}
        >
          Go Deeper →
        </button>
      )}
    </div>
  )
}
