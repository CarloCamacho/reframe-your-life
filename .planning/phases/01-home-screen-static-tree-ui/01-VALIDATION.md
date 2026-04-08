---
phase: 1
slug: home-screen-static-tree-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-08
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | vite.config.js — `test: { environment: 'jsdom', globals: true }` |
| **Quick run command** | `bun run vitest run --reporter=verbose` |
| **Full suite command** | `bun run vitest run` |
| **Estimated runtime** | ~5 seconds |

Wave 0 (Plan 01-03, Task 1) installs vitest and configures vite.config.js. Test files created in Wave 0 as stubs; fleshed out during plan execution.

---

## Sampling Rate

- **After every task commit:** Run `bun run vitest run --reporter=verbose`
- **After every plan wave:** Run `bun run vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-T1 | 01-03 | 0 | Foundation | install | `bun run vitest --version` | After task | Pending |
| 03-T2 | 01-03 | 0 | HOME-04 | build smoke | `bun run build` | — | Pending |
| 03-T3 | 01-03 | 0 | Test stubs | unit scaffold | `bun run vitest run` | After task | Pending |
| 01-T1 | 01-01 | 1 | HOME-01,02,03 | unit render | `bun run vitest run src/components/Home/` | After task | Pending |
| 01-T2 | 01-01 | 1 | HOME-01..03 | build | `bun run build` | — | Pending |
| 02-T1 | 01-02 | 1 | TREE-02,03 | file+export | `test -f src/components/Tree/TreeNode.jsx && grep -q "export default"` | After task | Pending |
| 02-T2 | 01-02 | 1 | TREE-01..03 | build + unit | `bun run build && bun run vitest run src/components/Tree/` | After task | Pending |

---

## Wave 0 Gaps (to be resolved by Plan 01-03)

Plan 01-03 Task 1 installs vitest. **A new Task 3 must create test stubs** for all four test files before Wave 1 executes:

- [ ] `src/components/Home/HomeScreen.test.jsx` — covers HOME-01, HOME-02
- [ ] `src/components/Home/TreeCard.test.jsx` — covers HOME-03
- [ ] `src/components/Tree/TreeNode.test.jsx` — covers TREE-02, TREE-03
- [ ] `src/components/Tree/TreeCanvas.test.jsx` — covers TREE-01

Stub format (each file):

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Stubs — fleshed out as components are implemented in Wave 1
describe('ComponentName', () => {
  it.todo('renders correctly')
  it.todo('requirement-specific behaviour')
})
```

These stubs satisfy Nyquist sampling — vitest can discover and run them without failing.

---

## Test Coverage Map

| Requirement | Covered By | Test File |
|-------------|-----------|-----------|
| HOME-01 | HomeScreen renders tree list | HomeScreen.test.jsx |
| HOME-02 | "Start New Tree" button click | HomeScreen.test.jsx |
| HOME-03 | Linked tree indicator visible | TreeCard.test.jsx |
| HOME-04 | App loads to home by default | App.jsx store default state |
| TREE-01 | Root node has highest y position | TreeCanvas.test.jsx |
| TREE-02 | Rung-specific className applied | TreeNode.test.jsx |
| TREE-03 | Dormant nodes have opacity-50 | TreeNode.test.jsx |
| TREE-05 | onNodeClick handler wired | TreeCanvas.test.jsx |
| TREE-06 | Dormant node click handler wired | TreeCanvas.test.jsx |
| TREE-07 | Continue button rendered on active Rung 2 | TreeNode.test.jsx |

---

*Phase: 01-home-screen-static-tree-ui*
*Validation strategy created: 2026-04-08*
