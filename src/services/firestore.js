import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'

// Collection refs
const treesRef = (uid) => collection(db, 'users', uid, 'trees')
const treeRef = (uid, treeId) => doc(db, 'users', uid, 'trees', treeId)
const nodesRef = (uid, treeId) => collection(db, 'users', uid, 'trees', treeId, 'nodes')
const nodeRef = (uid, treeId, nodeId) => doc(db, 'users', uid, 'trees', treeId, 'nodes', nodeId)

// Trees
export function subscribeTrees(uid, onData, onError) {
  const q = query(treesRef(uid), orderBy('updatedAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const trees = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    onData(trees)
  }, onError)
}

export async function createTree(uid, name) {
  const now = serverTimestamp()
  const ref = await addDoc(treesRef(uid), {
    name,
    status: 'active',
    linkedFromTreeId: null,
    linkedFromNodeId: null,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function updateTree(uid, treeId, data) {
  await updateDoc(treeRef(uid, treeId), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteTree(uid, treeId) {
  await deleteDoc(treeRef(uid, treeId))
}

// Nodes
export async function getNodes(uid, treeId) {
  const snap = await getDocs(nodesRef(uid, treeId))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createNode(uid, treeId, data) {
  const now = serverTimestamp()
  const ref = await addDoc(nodesRef(uid, treeId), { ...data, createdAt: now, updatedAt: now })
  return ref.id
}

export async function updateNode(uid, treeId, nodeId, data) {
  await updateDoc(nodeRef(uid, treeId, nodeId), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteNode(uid, treeId, nodeId) {
  await deleteDoc(nodeRef(uid, treeId, nodeId))
}
