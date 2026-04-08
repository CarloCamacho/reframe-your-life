# Phase 1: Home Screen + Static Tree UI - Research

**Researched:** 2026-04-08
**Domain:** React Flow tree visualisation, Tailwind CSS v4, Zustand v5, SPA routing
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HOME-01 | User sees a list of all saved trees with name, date created, last updated, and status | Mock data array with TreeCard component covers this without Firebase |
| HOME-02 | User can tap "Start New Tree" to begin a new reframing session | CTA button navigates to tree view; no AI needed for Phase 1 |
| HOME-03 | Linked trees (spawned via "Go Deeper") are visually indicated on the home screen | Mock data includes one linked-tree example with `linkedFromTreeId` set |
| HOME-04 | App loads directly to the home screen on return visits | Default view in state-based routing; no persistence needed for Phase 1 |
| TREE-01 | Tree renders vertically with root node at the bottom, growing upward | @xyflow/react with manual BT-style positioning or dagre BT direction |
| TREE-02 | Nodes visually distinguished by rung with labels and colour coding | Custom node component with rung-aware colour tokens |
| TREE-03 | Active branch highlighted; dormant branches visible but subdued | Node status in data drives className/opacity on custom node |
| TREE-04 | Tree animates as new nodes are added | React Flow built-in or CSS transitions; static for Phase 1 |
| TREE-05 | User can tap any node to open node detail view | onClick handler on custom node; no detail modal needed in Phase 1 (wired but empty) |
| TREE-06 | User can tap dormant branch to expand it | onClick on dormant nodes; triggers AI in Phase 3 — stub handler only in Phase 1 |
| TREE-07 | "Continue" button on active branch resumes AI conversation | Button rendered on active branch node; stub handler in Phase 1 |
</phase_requirements>

---

## Summary

Phase 1 is a pure UI skeleton: no Firebase, no AI, no persistence. The goal is proving the visual foundation feels right — home screen + static tree canvas — so later phases can wire up data without redesigning the layout.

The stack is already installed via `package-lock.json` (`@xyflow/react` 12.10.2, `zustand` 5.0.12, `tailwindcss` 4.2.2). No new packages are needed for Phase 1 except `@dagrejs/dagre` if automatic tree layout is used instead of manual position calculation. React Router is NOT installed; simple useState-based view switching is sufficient for Phase 1 (two views: home and tree).

The most technically complex piece is the React Flow tree layout. React Flow has no built-in layout algorithm — positions must be set manually or via a library like dagre. For a static hard-coded tree (Phase 1), manual position calculation is simpler than adding dagre as a dependency. The BT (bottom-to-top) effect is achieved by inverting y-coordinates: root gets the highest y value, children get smaller y values.

**Primary recommendation:** Use manual node positioning (no dagre dependency) for the static Phase 1 tree. Add dagre in Phase 3 when the tree becomes dynamic.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @xyflow/react | 12.10.2 | Tree canvas, node rendering, edges | Project-locked; replaces `reactflow` package entirely in v12 |
| tailwindcss | 4.2.2 | Utility CSS, theme tokens, responsive layout | Project-locked; v4 is CSS-first, no config file |
| @tailwindcss/vite | 4.2.2 | Tailwind v4 Vite integration | Required plugin; replaces PostCSS config |
| zustand | 5.0.12 | Global app state | Project-locked; minimal boilerplate |
| react | 18.3.1 | Component model | Project-locked |
| vite | 6.4.2 | Dev server + build | Project-locked |

[VERIFIED: npm registry via npm view + package-lock.json]

### Supporting (Phase 1 only)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @dagrejs/dagre | 3.0.0 (latest) | Automatic tree layout algorithm | Only if Phase 1 tree complexity warrants it; skip for static hard-coded tree |

[VERIFIED: npm registry — `npm view @dagrejs/dagre version`]

### NOT Installed

| Library | Status | Note |
|---------|--------|------|
| react-router-dom | NOT in lockfile | Not needed for Phase 1; use useState routing |
| firebase | In package.json | Not needed until Phase 2 |

[VERIFIED: package-lock.json inspection]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual position calculation | @dagrejs/dagre | Dagre is easier for dynamic trees but overkill for a static 7-node example |
| useState routing | react-router-dom | React Router needed in Phase 6 for SPA deep-link rewrites; defer install |

**Installation (Phase 1 — nothing new needed):**
```bash
npm install  # installs from existing package-lock.json
```

If dagre is added:
```bash
npm install @dagrejs/dagre
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── Home/
│   │   ├── HomeScreen.jsx       # Tree list, branding, CTA
│   │   └── TreeCard.jsx         # Individual tree summary card
│   └── Tree/
│       ├── TreeCanvas.jsx       # ReactFlow wrapper + node/edge definitions
│       ├── TreeNode.jsx         # Custom node component (rung-aware)
│       └── TreeControls.jsx     # Zoom/fit controls (optional)
├── store/
│   └── appStore.js              # Zustand store: currentView, activeTreeId
├── App.jsx                      # View router (home | tree)
├── main.jsx                     # Entry point (already exists)
└── index.css                    # @import "tailwindcss" + @custom-variant dark + @theme
```

Note: The spec (AGENTS.md §7) includes `services/`, `hooks/`, and `Chat/` directories — these belong to Phase 2+. Do not create them in Phase 1.

### Pattern 1: @xyflow/react v12 Custom Node

**What:** Custom React components replace default nodes, registered via `nodeTypes`.
**When to use:** Always — the spec requires rung-aware node styling.

```jsx
// Source: https://reactflow.dev/learn/customization/custom-nodes
import { Handle, Position } from '@xyflow/react';

// CRITICAL: define nodeTypes outside the component to prevent re-renders
const nodeTypes = { treeNode: TreeNode };

function TreeNode({ data }) {
  // data.rung: 1 | 2 | 3
  // data.status: 'active' | 'dormant' | 'selected'
  // data.label: string
  return (
    <div className={`tree-node rung-${data.rung} status-${data.status}`}>
      <Handle type="target" position={Position.Bottom} />
      <span>{data.label}</span>
      <Handle type="source" position={Position.Top} />
    </div>
  );
}

// In TreeCanvas.jsx:
<ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView />
```

**Handle positions:** For a bottom-to-top tree, parent nodes have `source` at Top; child nodes have `target` at Bottom. This is the OPPOSITE of the default (which grows downward).

### Pattern 2: Bottom-to-Top Manual Positioning

**What:** Place root at highest y value, parent branches at mid y, leaves at lowest y (React Flow y increases downward, so lowest y = highest on screen).
**When to use:** Phase 1 static tree only. Replace with dagre BT in Phase 3.

```js
// Root at bottom of canvas (highest y), leaves at top (lowest y)
// Canvas is ~600px tall, so:
const NODES = [
  { id: 'root',   position: { x: 200, y: 400 }, data: { rung: 1, label: 'How might I...', status: 'active' }, type: 'treeNode' },
  { id: 'r2a',    position: { x: 50,  y: 250 }, data: { rung: 2, label: 'Outcome A',      status: 'selected' }, type: 'treeNode' },
  { id: 'r2b',    position: { x: 200, y: 250 }, data: { rung: 2, label: 'Outcome B',      status: 'dormant' }, type: 'treeNode' },
  { id: 'r2c',    position: { x: 350, y: 250 }, data: { rung: 2, label: 'Outcome C',      status: 'dormant' }, type: 'treeNode' },
  { id: 'r3a',    position: { x: -50, y: 100 }, data: { rung: 3, label: 'Action 1',       status: 'active' }, type: 'treeNode' },
  { id: 'r3b',    position: { x: 100, y: 100 }, data: { rung: 3, label: 'Action 2',       status: 'active' }, type: 'treeNode' },
  { id: 'r3c',    position: { x: 250, y: 100 }, data: { rung: 3, label: 'Action 3',       status: 'active' }, type: 'treeNode' },
];
```

### Pattern 3: Tailwind v4 CSS-First Config

**What:** All theme tokens defined in `index.css` via `@theme`. No `tailwind.config.js`.
**When to use:** Always in this project.

```css
/* src/index.css */
@import "tailwindcss";

/* Class-based dark mode — add/remove .dark on <html> */
@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Rung colour tokens */
  --color-rung-root: #a3a3a3;       /* Root node — muted green-grey */
  --color-rung-2-active: #3b82f6;   /* Rung 2 selected — blue */
  --color-rung-2-dormant: #6b7280;  /* Rung 2 dormant — subdued grey */
  --color-rung-3: #22c55e;          /* Rung 3 — green */

  /* Calm palette */
  --color-surface: #111827;         /* bg-gray-900 equivalent */
  --color-surface-raised: #1f2937;  /* cards */
  --color-text-primary: #f9fafb;
  --color-text-muted: #6b7280;
}
```

[VERIFIED: tailwindcss.com/docs/installation/using-vite + tailwindcss.com/docs/dark-mode]

### Pattern 4: Zustand v5 Store

**What:** Named `create()` import, state + actions in one object.
**When to use:** Phase 1 store only needs currentView and mock tree list.

```js
// Source: zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5
import { create } from 'zustand'

export const useAppStore = create((set) => ({
  // Phase 1: view routing
  currentView: 'home',          // 'home' | 'tree'
  activeTreeId: null,           // string | null

  setView: (view) => set({ currentView: view }),
  setActiveTree: (id) => set({ activeTreeId: id, currentView: 'tree' }),
  goHome: () => set({ currentView: 'home', activeTreeId: null }),
}))
```

**Breaking change from v4:** No default export — use `import { create } from 'zustand'`, not `import create from 'zustand'`.

[VERIFIED: zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5]

### Pattern 5: State-Based View Routing (No React Router)

**What:** `currentView` in Zustand store drives which component App renders.
**When to use:** Phase 1 only. Add React Router in Phase 6 for SPA deep links.

```jsx
// App.jsx
import { useAppStore } from './store/appStore'
import HomeScreen from './components/Home/HomeScreen'
import TreeCanvas from './components/Tree/TreeCanvas'

export default function App() {
  const currentView = useAppStore(s => s.currentView)
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'tree' && <TreeCanvas />}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **nodeTypes defined inside the component:** Causes re-renders on every render. Always define outside.
- **Forgetting `@xyflow/react/dist/style.css` import:** Handles and edges won't render correctly.
- **Setting `width`/`height` in `node.style`:** In v12, provide `width`/`height` directly on the node object (`node.width`, `node.height`), not in `node.style`.
- **Using default export from zustand:** `import create from 'zustand'` is removed in v5; use named import.
- **Adding `tailwind.config.js`:** Not used in v4. All config goes in CSS via `@theme`.
- **Handle positions wrong for upward tree:** In a bottom-to-top tree, source is at `Position.Top` and target is at `Position.Bottom` — opposite of a downward tree.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tree canvas / node rendering | Custom SVG or D3 tree | @xyflow/react | Handles pan/zoom, selection, handles, custom nodes, SSR |
| Tree layout algorithm (Phase 3+) | Manual position math for dynamic trees | @dagrejs/dagre with `rankdir: 'BT'` | Dagre handles spacing, rank ordering, collision avoidance |
| Dark mode toggle logic | Media query listeners + state | @custom-variant dark + localStorage + classList toggle | Standard pattern, no runtime library needed |
| Utility CSS | Custom CSS classes | Tailwind utility classes | Already installed; custom CSS creates specificity problems |

**Key insight:** React Flow's coordinate system always has y increasing downward. There is no "invert" prop — the BT (bottom-to-top) effect is achieved by the layout algorithm (dagre `rankdir: 'BT'`) or by manual inversion of y coordinates. Handle positions must also be inverted (source at top, target at bottom) for the visual to read correctly.

---

## Common Pitfalls

### Pitfall 1: React Flow Container Has No Height

**What goes wrong:** The tree canvas renders as 0px height and nodes are invisible.
**Why it happens:** `<ReactFlow>` requires its parent container to have an explicit height (not just `min-height`).
**How to avoid:** Wrap `<ReactFlow>` in a `div` with `style={{ height: '100vh' }}` or a fixed pixel height. Tailwind `h-screen` works.
**Warning signs:** Empty canvas, no nodes visible, no errors in console.

### Pitfall 2: nodeTypes Object Recreated on Every Render

**What goes wrong:** React Flow logs a warning and re-renders excessively.
**Why it happens:** If `nodeTypes` is defined inside the component function, it's a new object reference each render.
**How to avoid:** Define `const nodeTypes = { treeNode: TreeNode }` at module scope, outside any component.
**Warning signs:** React Flow console warning about nodeTypes changing.

### Pitfall 3: Missing React Flow CSS Import

**What goes wrong:** Node handles are invisible; edge connections don't work; selection handles missing.
**Why it happens:** `@xyflow/react` ships with required CSS that must be explicitly imported.
**How to avoid:** Add `import '@xyflow/react/dist/style.css'` to `main.jsx` or `App.jsx`.
**Warning signs:** Nodes render but handles are invisible; edges appear as raw lines with no styling.

### Pitfall 4: Tailwind v4 `@theme` Variable Names Don't Match Utilities

**What goes wrong:** `bg-rung-root` doesn't apply even though `--color-rung-root` is defined.
**Why it happens:** Tailwind v4 maps `--color-{name}` to `bg-{name}`, `text-{name}`, etc. The naming convention must be exact.
**How to avoid:** Follow the `--color-*` prefix convention exactly; verify with browser devtools.
**Warning signs:** Custom colour classes have no effect; no error in console.

### Pitfall 5: Zustand Default Import

**What goes wrong:** `import create from 'zustand'` throws a module error.
**Why it happens:** Zustand v5 removed the default export.
**How to avoid:** Always use `import { create } from 'zustand'`.
**Warning signs:** "does not provide an export named 'default'" error in console.

### Pitfall 6: node_modules Not Installed

**What goes wrong:** All imports fail; Vite cannot start.
**Why it happens:** `package-lock.json` exists but `node_modules/` does not — packages haven't been installed.
**How to avoid:** Run `npm install` before starting dev server. (Note: project uses npm, not bun, based on the presence of `package-lock.json`.)
**Warning signs:** Vite reports "Cannot find module" on startup.

---

## Code Examples

### Complete TreeCanvas.jsx skeleton

```jsx
// Source: https://reactflow.dev/learn/customization/custom-nodes
import '@xyflow/react/dist/style.css'
import { ReactFlow, Background, Controls } from '@xyflow/react'
import TreeNode from './TreeNode'

// Defined at module scope — NEVER inside a component
const nodeTypes = { treeNode: TreeNode }

// Hard-coded Phase 1 example tree
// Root at bottom (high y), leaves at top (low y)
const INITIAL_NODES = [
  {
    id: 'root',
    type: 'treeNode',
    position: { x: 250, y: 450 },
    data: { rung: 1, status: 'active', label: 'How might I find more meaningful work?' }
  },
  {
    id: 'r2a',
    type: 'treeNode',
    position: { x: 50, y: 280 },
    data: { rung: 2, status: 'selected', label: 'Feel energised and purposeful' }
  },
  {
    id: 'r2b',
    type: 'treeNode',
    position: { x: 280, y: 280 },
    data: { rung: 2, status: 'dormant', label: 'Have financial security' }
  },
  {
    id: 'r2c',
    type: 'treeNode',
    position: { x: 510, y: 280 },
    data: { rung: 2, status: 'dormant', label: 'Be recognised for my skills' }
  },
  {
    id: 'r3a',
    type: 'treeNode',
    position: { x: -80, y: 110 },
    data: { rung: 3, status: 'active', label: 'Talk to 3 people in roles I admire' }
  },
  {
    id: 'r3b',
    type: 'treeNode',
    position: { x: 80, y: 110 },
    data: { rung: 3, status: 'active', label: 'Do a 30-day side project' }
  },
  {
    id: 'r3c',
    type: 'treeNode',
    position: { x: 240, y: 110 },
    data: { rung: 3, status: 'active', label: 'Take one afternoon off to prototype' }
  },
]

const INITIAL_EDGES = [
  { id: 'root-r2a', source: 'root', target: 'r2a' },
  { id: 'root-r2b', source: 'root', target: 'r2b' },
  { id: 'root-r2c', source: 'root', target: 'r2c' },
  { id: 'r2a-r3a',  source: 'r2a',  target: 'r3a' },
  { id: 'r2a-r3b',  source: 'r2a',  target: 'r3b' },
  { id: 'r2a-r3c',  source: 'r2a',  target: 'r3c' },
]

export default function TreeCanvas() {
  return (
    <div style={{ height: '100vh' }}>
      <ReactFlow
        nodes={INITIAL_NODES}
        edges={INITIAL_EDGES}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
```

### TreeNode.jsx with rung colour coding

```jsx
// Source: https://reactflow.dev/learn/customization/custom-nodes
import { Handle, Position } from '@xyflow/react'

const RUNG_STYLES = {
  1: 'border-rung-root text-text-primary',
  2: {
    selected: 'border-rung-2-active bg-rung-2-active/10 text-rung-2-active',
    dormant:  'border-rung-2-dormant text-text-muted opacity-50',
    active:   'border-rung-2-active bg-rung-2-active/10 text-rung-2-active',
  },
  3: 'border-rung-3 bg-rung-3/10 text-rung-3',
}

export default function TreeNode({ data, selected }) {
  const isRoot = data.rung === 1
  const isDormant = data.status === 'dormant'
  const rungStyle = typeof RUNG_STYLES[data.rung] === 'object'
    ? RUNG_STYLES[data.rung][data.status] || RUNG_STYLES[data.rung].active
    : RUNG_STYLES[data.rung]

  return (
    <div
      className={`
        rounded-xl border-2 px-3 py-2 text-sm font-medium max-w-[180px] text-center
        bg-surface-raised cursor-pointer transition-all
        ${rungStyle}
        ${isDormant ? 'opacity-50' : ''}
        ${selected ? 'ring-2 ring-white/40' : ''}
      `}
    >
      {/* Target handle — bottom (receives edge from parent below) */}
      {!isRoot && <Handle type="target" position={Position.Bottom} />}

      <span className="block leading-snug">{data.label}</span>

      {data.status === 'active' && data.rung === 2 && (
        <button className="mt-2 text-xs px-2 py-0.5 rounded bg-rung-2-active text-white">
          Continue
        </button>
      )}

      {/* Source handle — top (sends edge to children above) */}
      {data.rung < 3 && <Handle type="source" position={Position.Top} />}
    </div>
  )
}
```

### Mock tree data for HomeScreen

```js
// src/data/mockTrees.js
export const MOCK_TREES = [
  {
    id: 'tree-1',
    name: 'Find more meaningful work',
    createdAt: new Date('2026-03-15'),
    updatedAt: new Date('2026-04-01'),
    status: 'active',
    linkedFromTreeId: null,
    linkedFromNodeId: null,
  },
  {
    id: 'tree-2',
    name: 'Start my own business',
    createdAt: new Date('2026-04-01'),
    updatedAt: new Date('2026-04-08'),
    status: 'active',
    linkedFromTreeId: 'tree-1',   // linked tree example for HOME-03
    linkedFromNodeId: 'r3a',
  },
  {
    id: 'tree-3',
    name: 'Improve my relationship with money',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-28'),
    status: 'complete',
    linkedFromTreeId: null,
    linkedFromNodeId: null,
  },
]
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import ReactFlow from 'reactflow'` | `import { ReactFlow } from '@xyflow/react'` | v12 (2024) | Package rename; default export removed |
| `node.width` / `node.height` in node.style | `node.width` / `node.height` directly on node object; measured values in `node.measured.*` | v12 | Different for static vs measured dims |
| tailwind.config.js | @theme in CSS | Tailwind v4 (2025) | CSS-first config; no JS config file |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` | Tailwind v4 | Single import line |
| `import create from 'zustand'` | `import { create } from 'zustand'` | Zustand v5 | Default export removed |
| `darkMode: 'class'` in tailwind.config.js | `@custom-variant dark` in CSS | Tailwind v4 | CSS-first dark mode config |

**Deprecated/outdated:**
- `reactflow` npm package: replaced by `@xyflow/react` — do not install `reactflow`
- `tailwind.config.js`: not used in v4 — do not create this file
- PostCSS-based Tailwind setup: replaced by `@tailwindcss/vite` plugin

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Manual BT positioning is simpler than dagre for a 7-node static tree | Architecture Patterns | If the planner wants reusable layout logic from day 1, should add dagre upfront |
| A2 | State-based routing (no React Router) is sufficient for Phase 1 | Architecture Patterns | Low risk — Phase 1 has only 2 views; React Router will be added in Phase 6 |
| A3 | `npm install` is the correct install command (not `bun install`) | Common Pitfalls | package-lock.json suggests npm, but CLAUDE.md says Bun is the package manager — if Bun, run `bun install` instead |

---

## Open Questions (RESOLVED)

1. **npm vs Bun for installation** — RESOLVED: Use `bun install` (CLAUDE.md is authoritative). `bun.lockb` will be generated alongside existing `package-lock.json`, which is harmless.

2. **Colour palette — spec says "muted, calm" but doesn't specify exact colours** — RESOLVED: Dark mode default; `--color-rung-2-active: #3b82f6` (blue-500), `--color-rung-3: #22c55e` (green-500), `--color-rung-root: #a3a3a3` (neutral-400), dormant `#6b7280` (gray-500), surfaces `#111827`/`#1f2937`.

3. **Tree canvas: scrollable or fitView only?** — RESOLVED: `fitView` enabled, `nodesDraggable={false}`, pan/zoom enabled. Pan/zoom deliberately kept for Phase 1; dragging disabled to keep tree feel intentional.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite dev server | ✓ | (assumed — git repo exists) | — |
| npm | Package install | ✓ | (package-lock.json exists) | bun install |
| @xyflow/react | Tree canvas | In lockfile, not installed | 12.10.2 | — (must install) |
| zustand | State management | In lockfile, not installed | 5.0.12 | — (must install) |
| tailwindcss | Styling | In lockfile, not installed | 4.2.2 | — (must install) |

**Missing dependencies with no fallback:**
- All packages in package-lock.json — `node_modules/` does not exist. Wave 0 must run `npm install` (or `bun install`) before any code executes.

[ASSUMED: Node.js is available — repo can be cloned and dev server started]

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected |
| Config file | None |
| Quick run command | N/A — Wave 0 must scaffold tests |
| Full suite command | N/A |

No test infrastructure exists. `nyquist_validation` is enabled in config.json.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HOME-01 | HomeScreen renders mock tree list | unit (render) | `vitest run src/components/Home/HomeScreen.test.jsx` | No — Wave 0 |
| HOME-02 | "Start New Tree" button navigates to tree view | unit (event) | `vitest run src/components/Home/HomeScreen.test.jsx` | No — Wave 0 |
| HOME-03 | Linked tree shows indicator | unit (render) | `vitest run src/components/Home/TreeCard.test.jsx` | No — Wave 0 |
| TREE-01 | Root node has highest y position | unit (data) | `vitest run src/components/Tree/TreeCanvas.test.jsx` | No — Wave 0 |
| TREE-02 | Nodes have correct rung className | unit (render) | `vitest run src/components/Tree/TreeNode.test.jsx` | No — Wave 0 |
| TREE-03 | Dormant nodes have opacity-50 | unit (render) | `vitest run src/components/Tree/TreeNode.test.jsx` | No — Wave 0 |

**Recommended test library:** `vitest` + `@testing-library/react` — matches Vite, no jest config needed.

### Sampling Rate

- **Per task commit:** `vitest run --reporter=verbose`
- **Per wave merge:** `vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `vitest` + `@testing-library/react` not installed — add to devDependencies
- [ ] `src/components/Home/HomeScreen.test.jsx` — covers HOME-01, HOME-02
- [ ] `src/components/Home/TreeCard.test.jsx` — covers HOME-03
- [ ] `src/components/Tree/TreeNode.test.jsx` — covers TREE-02, TREE-03
- [ ] `src/components/Tree/TreeCanvas.test.jsx` — covers TREE-01
- [ ] `vite.config.js` — add `test: { environment: 'jsdom' }` for vitest

---

## Security Domain

Phase 1 handles no user data, no API keys, no auth, no network requests. All data is hard-coded mock data in JSX files.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A — Phase 2 |
| V3 Session Management | No | N/A — Phase 2 |
| V4 Access Control | No | N/A |
| V5 Input Validation | No | No user input in Phase 1 |
| V6 Cryptography | No | No secrets |

No security controls required for Phase 1.

---

## Sources

### Primary (HIGH confidence)
- [reactflow.dev/learn/customization/custom-nodes](https://reactflow.dev/learn/customization/custom-nodes) — custom node API, Handle component, nodeTypes pattern
- [reactflow.dev/learn/troubleshooting/migrate-to-v12](https://reactflow.dev/learn/troubleshooting/migrate-to-v12) — v12 breaking changes vs v11
- [reactflow.dev/api-reference/react-flow](https://reactflow.dev/api-reference/react-flow) — ReactFlow component props
- [tailwindcss.com/docs/installation/using-vite](https://tailwindcss.com/docs/installation/using-vite) — v4 Vite setup, no config file
- [tailwindcss.com/docs/dark-mode](https://tailwindcss.com/docs/dark-mode) — @custom-variant dark syntax
- [zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5](https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5) — v5 create() API, named import
- npm registry (npm view) — verified exact versions for @xyflow/react (12.10.2), zustand (5.0.12), tailwindcss (4.2.2), @dagrejs/dagre (3.0.0)
- package-lock.json — confirmed installed versions

### Secondary (MEDIUM confidence)
- [reactflow.dev/examples/layout/dagre](https://reactflow.dev/examples/layout/dagre) — dagre BT direction, `@dagrejs/dagre` package name
- [reactflow.dev/learn/layouting/layouting](https://reactflow.dev/learn/layouting/layouting) — layout library overview

### Tertiary (LOW confidence)
- WebSearch results on Tailwind v4 dark mode community patterns — cross-verified with official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry and package-lock.json
- Architecture: HIGH — patterns verified against official React Flow and Tailwind docs
- Pitfalls: HIGH — derived from official migration guides and API docs

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (Tailwind v4 and @xyflow/react are fast-moving; re-verify if > 30 days old)
