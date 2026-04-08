import { create } from 'zustand'

export const useAppStore = create((set) => ({
  currentView: 'home',
  activeTreeId: null,

  setView: (view) => set({ currentView: view }),
  setActiveTree: (id) => set({ activeTreeId: id, currentView: 'tree' }),
  goHome: () => set({ currentView: 'home', activeTreeId: null }),
}))
