import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './appStore'

describe('appStore — auth modal', () => {
  beforeEach(() => {
    useAppStore.setState({ authModalOpen: false })
  })

  it('initializes authModalOpen as false', () => {
    expect(useAppStore.getState().authModalOpen).toBe(false)
  })

  it('setAuthModalOpen(true) opens the modal', () => {
    useAppStore.getState().setAuthModalOpen(true)
    expect(useAppStore.getState().authModalOpen).toBe(true)
  })

  it('setAuthModalOpen(false) closes the modal', () => {
    useAppStore.setState({ authModalOpen: true })
    useAppStore.getState().setAuthModalOpen(false)
    expect(useAppStore.getState().authModalOpen).toBe(false)
  })
})
