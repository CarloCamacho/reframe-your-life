import { create } from 'zustand'

const loadApiKeys = () => {
  try { return JSON.parse(localStorage.getItem('ryl_keys') || '{}') } catch { return {} }
}

const loadProvider = () => {
  try { return localStorage.getItem('ryl_provider') || 'anthropic' } catch { return 'anthropic' }
}

export const useAppStore = create((set) => ({
  // Navigation
  currentView: 'home',
  activeTreeId: null,
  chatOpen: false,

  // Auth
  uid: null,
  trees: [],

  // Auth modal
  authModalOpen: false,

  // AI settings (persisted to localStorage)
  activeProvider: loadProvider(),
  apiKeys: loadApiKeys(),

  // Navigation actions
  setView: (view) => set({ currentView: view }),
  setActiveTree: (id) => set({ activeTreeId: id, currentView: 'tree', chatOpen: id === 'new' }),
  setActiveTreeIdOnly: (id) => set({ activeTreeId: id }),
  goHome: () => set({ currentView: 'home', activeTreeId: null, chatOpen: false }),
  openChat: () => set({ chatOpen: true }),
  closeChat: () => set({ chatOpen: false }),

  // Auth actions
  setUid: (uid) => set({ uid }),
  setTrees: (trees) => set({ trees }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),

  // AI settings actions
  setActiveProvider: (provider) => {
    localStorage.setItem('ryl_provider', provider)
    set({ activeProvider: provider })
  },
  setApiKey: (provider, key) => set(state => {
    const keys = { ...state.apiKeys, [provider]: key }
    localStorage.setItem('ryl_keys', JSON.stringify(keys))
    return { apiKeys: keys }
  }),
}))
