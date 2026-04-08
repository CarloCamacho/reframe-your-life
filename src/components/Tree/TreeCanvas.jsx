import { ReactFlow, Background, Controls } from '@xyflow/react'
import TreeNode from './TreeNode'
import { useAppStore } from '../../store/appStore'

const nodeTypes = { treeNode: TreeNode }

const INITIAL_NODES = [
  { id: 'root', type: 'treeNode', position: { x: 250, y: 450 },
    data: { rung: 1, status: 'active', label: 'How might I find more meaningful work?' } },
  { id: 'r2a', type: 'treeNode', position: { x: 50, y: 280 },
    data: { rung: 2, status: 'selected', label: 'Feel energised and purposeful' } },
  { id: 'r2b', type: 'treeNode', position: { x: 280, y: 280 },
    data: { rung: 2, status: 'dormant', label: 'Have financial security' } },
  { id: 'r2c', type: 'treeNode', position: { x: 510, y: 280 },
    data: { rung: 2, status: 'dormant', label: 'Be recognised for my skills' } },
  { id: 'r3a', type: 'treeNode', position: { x: -80, y: 110 },
    data: { rung: 3, status: 'active', label: 'Talk to 3 people in roles I admire' } },
  { id: 'r3b', type: 'treeNode', position: { x: 80, y: 110 },
    data: { rung: 3, status: 'active', label: 'Do a 30-day side project' } },
  { id: 'r3c', type: 'treeNode', position: { x: 240, y: 110 },
    data: { rung: 3, status: 'active', label: 'Take one afternoon off to prototype' } },
]

const INITIAL_EDGES = [
  { id: 'root-r2a', source: 'root', target: 'r2a', style: { stroke: '#3b82f6' } },
  { id: 'root-r2b', source: 'root', target: 'r2b', style: { stroke: '#374151' } },
  { id: 'root-r2c', source: 'root', target: 'r2c', style: { stroke: '#374151' } },
  { id: 'r2a-r3a', source: 'r2a', target: 'r3a', style: { stroke: '#22c55e' } },
  { id: 'r2a-r3b', source: 'r2a', target: 'r3b', style: { stroke: '#22c55e' } },
  { id: 'r2a-r3c', source: 'r2a', target: 'r3c', style: { stroke: '#22c55e' } },
]

export default function TreeCanvas() {
  const goHome = useAppStore((s) => s.goHome)

  return (
    <div style={{ height: '100vh' }} className="relative">
      <button
        onClick={goHome}
        className="absolute top-4 left-4 z-10 text-text-muted hover:text-text-primary text-sm"
      >
        Back to Home
      </button>
      <ReactFlow
        nodes={INITIAL_NODES}
        edges={INITIAL_EDGES}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodeClick={(event, node) => console.log('Node clicked:', node.id, node.data)}
      >
        <Background variant="dots" color="#374151" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
