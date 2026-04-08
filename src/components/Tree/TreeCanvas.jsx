import { useState, useEffect } from 'react'
import { ReactFlow, Background, Controls } from '@xyflow/react'
import TreeNode from './TreeNode'
import { useAppStore } from '../../store/appStore'
import { subscribeNodes } from '../../services/firestore'

const nodeTypes = { treeNode: TreeNode }

function layoutNodes(nodes) {
  const root = nodes.find(n => n.rung === 1)
  const rung2 = nodes.filter(n => n.rung === 2)
  const rung3 = nodes.filter(n => n.rung === 3)
  const SPACING = 200
  const result = []

  if (root) result.push({
    id: root.id, type: 'treeNode', position: { x: 300, y: 450 },
    data: { rung: 1, status: root.status, label: root.aiFormulation }
  })

  rung2.forEach((node, i) => {
    const startX = 300 - ((rung2.length - 1) * SPACING) / 2
    result.push({
      id: node.id, type: 'treeNode', position: { x: startX + i * SPACING, y: 280 },
      data: { rung: 2, status: node.status, label: node.aiFormulation }
    })
  })

  rung3.forEach((node) => {
    const parentIdx = rung2.findIndex(n => n.id === node.parentId)
    const siblings = rung3.filter(n => n.parentId === node.parentId)
    const sibIdx = siblings.findIndex(n => n.id === node.id)
    const parentX = 300 - ((rung2.length - 1) * SPACING) / 2 + parentIdx * SPACING
    const startX = parentX - ((siblings.length - 1) * 130) / 2
    result.push({
      id: node.id, type: 'treeNode', position: { x: startX + sibIdx * 130, y: 110 },
      data: { rung: 3, status: node.status, label: node.aiFormulation }
    })
  })

  return result
}

function layoutEdges(nodes) {
  return nodes.filter(n => n.parentId).map(n => ({
    id: `${n.parentId}-${n.id}`,
    source: n.parentId,
    target: n.id,
    style: { stroke: n.status === 'dormant' ? '#374151' : n.rung === 3 ? '#22c55e' : '#3b82f6' }
  }))
}

export default function TreeCanvas() {
  const uid = useAppStore(s => s.uid)
  const activeTreeId = useAppStore(s => s.activeTreeId)
  const goHome = useAppStore(s => s.goHome)
  const openChat = useAppStore(s => s.openChat)
  const chatOpen = useAppStore(s => s.chatOpen)

  const [firestoreNodes, setFirestoreNodes] = useState([])

  useEffect(() => {
    if (!uid || !activeTreeId || activeTreeId === 'new') {
      setFirestoreNodes([])
      return
    }
    const unsub = subscribeNodes(uid, activeTreeId, setFirestoreNodes, console.error)
    return unsub
  }, [uid, activeTreeId])

  const rfNodes = firestoreNodes.length ? layoutNodes(firestoreNodes) : []
  const rfEdges = firestoreNodes.length ? layoutEdges(firestoreNodes) : []

  return (
    <div style={{ height: '100vh' }} className="relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button onClick={goHome} className="text-text-muted hover:text-text-primary text-sm">
          ← Home
        </button>
      </div>
      {!chatOpen && activeTreeId !== 'new' && (
        <button
          onClick={openChat}
          className="absolute top-4 right-4 z-10 bg-rung-2-active text-white rounded-full px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Continue
        </button>
      )}
      {(activeTreeId === 'new' || firestoreNodes.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-text-muted text-sm">Your tree will grow here as you chat.</p>
        </div>
      )}
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodeClick={(_, node) => console.log('Node clicked:', node.id, node.data)}
      >
        <Background variant="dots" color="#374151" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
