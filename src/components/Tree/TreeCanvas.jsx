import { useState, useEffect, useRef, useCallback } from 'react'
import { ReactFlow, Background, Controls, useNodesState } from '@xyflow/react'
import TreeNode from './TreeNode'
import { useAppStore } from '../../store/appStore'
import { subscribeNodes, createTree, createNode } from '../../services/firestore'

const nodeTypes = { treeNode: TreeNode }

const H_SPACING_R2 = 260
const H_SPACING_R3 = 220
const Y_ROOT = 500
const Y_R2 = 290
const Y_R3 = 80

function layoutNodes(nodes, overrides = {}) {
  const root = nodes.find(n => n.rung === 1)
  const rung2 = nodes.filter(n => n.rung === 2)
  const rung3 = nodes.filter(n => n.rung === 3)
  const result = []

  if (root) result.push({
    id: root.id, type: 'treeNode',
    position: overrides[root.id] ?? { x: 300, y: Y_ROOT },
    data: { rung: 1, status: root.status, label: root.aiFormulation }
  })

  rung2.forEach((node, i) => {
    const startX = 300 - ((rung2.length - 1) * H_SPACING_R2) / 2
    result.push({
      id: node.id, type: 'treeNode',
      position: overrides[node.id] ?? { x: startX + i * H_SPACING_R2, y: Y_R2 },
      data: { rung: 2, status: node.status, label: node.aiFormulation }
    })
  })

  rung3.forEach((node) => {
    const parentIdx = rung2.findIndex(n => n.id === node.parentId)
    const siblings = rung3.filter(n => n.parentId === node.parentId)
    const sibIdx = siblings.findIndex(n => n.id === node.id)
    const parentX = 300 - ((rung2.length - 1) * H_SPACING_R2) / 2 + parentIdx * H_SPACING_R2
    const startX = parentX - ((siblings.length - 1) * H_SPACING_R3) / 2
    result.push({
      id: node.id, type: 'treeNode',
      position: overrides[node.id] ?? { x: startX + sibIdx * H_SPACING_R3, y: Y_R3 },
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
  const setActiveTree = useAppStore(s => s.setActiveTree)

  const [firestoreNodes, setFirestoreNodes] = useState([])
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([])
  const draggedPositions = useRef({})

  useEffect(() => {
    if (!uid || !activeTreeId || activeTreeId === 'new') {
      setFirestoreNodes([])
      return
    }
    const unsub = subscribeNodes(uid, activeTreeId, setFirestoreNodes, console.error)
    return unsub
  }, [uid, activeTreeId])

  const handleGoDeeper = useCallback(async (nodeId, nodeLabel) => {
    const newTreeId = await createTree(uid, `Go Deeper: ${nodeLabel}`, {
      linkedFromTreeId: activeTreeId,
      linkedFromNodeId: nodeId,
      branchType: 'deeper',
    })
    setActiveTree(newTreeId)
    openChat()
  }, [uid, activeTreeId, setActiveTree, openChat])

  const handleExplore = useCallback(async (nodeId, nodeLabel) => {
    const rung1Node = firestoreNodes.find(n => n.rung === 1)
    if (!rung1Node) return
    const newTreeId = await createTree(uid, nodeLabel, {
      linkedFromTreeId: activeTreeId,
      linkedFromNodeId: nodeId,
      branchType: 'explore',
    })
    const newRung1Id = await createNode(uid, newTreeId, {
      treeId: newTreeId, parentId: null, rung: 1,
      questionStem: rung1Node.questionStem,
      userRawResponse: rung1Node.userRawResponse,
      aiFormulation: rung1Node.aiFormulation,
      userNote: '', status: 'active', deepenedTreeId: null, children: [],
    })
    await createNode(uid, newTreeId, {
      treeId: newTreeId, parentId: newRung1Id, rung: 2,
      questionStem: 'If this was fully resolved, what would you have, feel, or experience?',
      userRawResponse: '', aiFormulation: nodeLabel,
      userNote: '', status: 'active', deepenedTreeId: null, children: [],
    })
    setActiveTree(newTreeId)
    openChat()
  }, [uid, activeTreeId, firestoreNodes, setActiveTree, openChat])

  useEffect(() => {
    if (firestoreNodes.length) {
      const laid = layoutNodes(firestoreNodes, draggedPositions.current)
      setRfNodes(laid.map(n => ({
        ...n,
        data: {
          ...n.data,
          onGoDeeper: n.data.rung === 3 ? handleGoDeeper : undefined,
          onExplore: n.data.rung === 2 && n.data.status === 'dormant' ? handleExplore : undefined,
        },
      })))
    }
  }, [firestoreNodes, handleGoDeeper])

  const handleNodesChange = (changes) => {
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        draggedPositions.current[change.id] = change.position
      }
    })
    onNodesChange(changes)
  }

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
        onNodesChange={handleNodesChange}
        nodesDraggable={true}
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
