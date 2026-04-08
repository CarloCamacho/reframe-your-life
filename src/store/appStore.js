import { create } from 'zustand'

export const useAppStore = create((set) => ({
  currentView: 'home',
  activeTreeId: null,
  uid: null,
  trees: [],

  setView: (view) => set({ currentView: view }),
  setActiveTree: (id) => set({ activeTreeId: id, currentView: 'tree' }),
  goHome: () => set({ currentView: 'home', activeTreeId: null }),
  setUid: (uid) => set({ uid }),
  setTrees: (trees) => set({ trees }),
}))
