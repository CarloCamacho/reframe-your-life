import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'

const treesRef = (uid) => collection(db, 'users', uid, 'trees')
const treeRef = (uid, treeId) => doc(db, 'users', uid, 'trees', treeId)
const nodesRef = (uid, treeId) => collection(db, 'users', uid, 'trees', treeId, 'nodes')
const nodeRef = (uid, treeId, nodeId) => doc(db, 'users', uid, 'trees', treeId, 'nodes', nodeId)

export function subscribeTrees(uid, onData, onError) {
  const q = query(treesRef(uid), orderBy('updatedAt', 'desc'))
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  }, onError)
}

export function subscribeNodes(uid, treeId, onData, onError) {
  return onSnapshot(nodesRef(uid, treeId), (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  }, onError)
}

export async function createTree(uid, name, { linkedFromTreeId = null, linkedFromNodeId = null, branchType = null } = {}) {
  const now = serverTimestamp()
  const ref = await addDoc(treesRef(uid), {
    name, status: 'active',
    linkedFromTreeId, linkedFromNodeId, branchType,
    createdAt: now, updatedAt: now,
  })
  return ref.id
}

export async function updateTree(uid, treeId, data) {
  await updateDoc(treeRef(uid, treeId), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteTree(uid, treeId) {
  await deleteDoc(treeRef(uid, treeId))
}

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
