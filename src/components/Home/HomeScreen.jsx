import { useState } from 'react'
import { useAppStore } from '../../store/appStore.js'
import { useTrees } from '../../hooks/useTree.js'
import TreeCard from './TreeCard.jsx'

function LadderLogo() {
  return (
    <img src="/ladder.png" alt="Ladder" width={280} height={280} style={{ objectFit: 'contain' }} />
  )
}

function AccountButton({ isAnonymous, userEmail, onSignInClick, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false)

  if (isAnonymous) {
    return (
      <button
        className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-sm"
        onClick={onSignInClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Sign in
      </button>
    )
  }

  // Truncate long local parts: show up to 8 chars + ellipsis + @domain
  const displayEmail = userEmail
    ? (() => {
        const [local, ...rest] = userEmail.split('@')
        const domain = rest.join('@')
        return local.length > 8 ? `${local.slice(0, 8)}…@${domain}` : userEmail
      })()
    : ''

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors text-sm"
        onClick={() => setMenuOpen(o => !o)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {displayEmail}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-surface-raised border border-surface rounded-lg shadow-lg py-1 min-w-[120px]">
            <button
              className="w-full text-left px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
              onClick={() => { setMenuOpen(false); onSignOut() }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function HomeScreen({ isAnonymous, userEmail, onSignInClick, onSignOut }) {
  const setActiveTree = useAppStore((s) => s.setActiveTree)
  const trees = useTrees()

  const rootTrees = trees.filter(t => !t.linkedFromTreeId)
  const branchMap = trees.reduce((acc, t) => {
    if (t.linkedFromTreeId) {
      acc[t.linkedFromTreeId] = [...(acc[t.linkedFromTreeId] || []), t]
    }
    return acc
  }, {})

  return (
    <div
      className="min-h-screen bg-surface"
      style={{
        backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex justify-end mb-2">
          <AccountButton
            isAnonymous={isAnonymous}
            userEmail={userEmail}
            onSignInClick={onSignInClick}
            onSignOut={onSignOut}
          />
        </div>

        <div className="mb-8 flex flex-col items-center text-center gap-3">
          <LadderLogo />
          <div>
            <p className="text-text-muted text-xs uppercase tracking-widest mb-0.5">
              Kellian Labs
            </p>
            <h1 className="text-2xl font-bold text-text-primary">
              Reframe Your Life
            </h1>
          </div>
        </div>

        <button
          className="w-full bg-rung-2-active text-white rounded-full py-3 font-medium mb-8 hover:opacity-90 transition-opacity"
          onClick={() => setActiveTree('new')}
        >
          Start New Ladder
        </button>

        {rootTrees.length === 0 ? (
          <p className="text-text-muted text-center">
            No ladders yet. Start your first reframe.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {rootTrees.map((tree) => {
              const branches = branchMap[tree.id] || []
              return (
                <div key={tree.id}>
                  <TreeCard tree={tree} />
                  {branches.length > 0 && (
                    <div className="ml-4 mt-2 flex flex-col gap-2 border-l border-surface-raised pl-3">
                      <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Connected ladders</p>
                      {branches.map(branch => (
                        <TreeCard key={branch.id} tree={branch} compact />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
