---
status: complete
phase: 01-home-screen-static-tree-ui
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md]
started: 2026-04-08T14:17:10Z
updated: 2026-04-08T14:18:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 10
name: Complete
expected: All tests passed.
awaiting: none

## Tests

### 1. App loads on home screen
expected: Run `bun run dev` and open http://localhost:5173. The home screen appears showing the Kellian Labs branding and a list of tree cards. No blank screen, no errors in console.
result: pass

### 2. Tree list renders three cards
expected: The home screen shows three tree cards, each with a name, a coloured status badge (green = active, yellow = in-progress, grey = complete), and created/updated dates. Cards are sorted with most-recently-updated first.
result: pass

### 3. Linked-tree indicator on a card
expected: One of the tree cards (the "Start my own business" one) shows a linked-tree indicator — a small icon or label that visually distinguishes it as a child tree linked from another tree.
result: pass

### 4. Start New Tree button
expected: A prominent "Start New Tree" button is visible on the home screen. Tapping/clicking it does not crash the app (it sets the active tree to 'new' — the actual new-tree flow comes in a later phase, so no further action is expected yet).
result: pass

### 5. Navigate to tree canvas
expected: Tapping/clicking any tree card navigates from the home screen to the tree canvas view. The home screen disappears and a tree diagram appears.
result: pass

### 6. 7-node static tree renders
expected: The tree canvas shows a complete example tree: 1 root node at the bottom, 2 Rung 2 nodes in the middle, and 4 Rung 3 leaf nodes at the top. Edges connect them in a tree shape.
result: pass

### 7. Node styling by rung
expected: The three rung levels are visually distinct — root, Rung 2, and Rung 3 nodes each have different colours/styles matching the app's theme tokens (blue, green, etc.).
result: pass

### 8. Dormant node at half opacity
expected: One of the Rung 2 nodes looks visually muted — lower opacity (~50%) and a muted border — indicating it is dormant (a non-selected branch from Rung 2).
result: pass

### 9. Continue button on active Rung 2 node
expected: The active (non-dormant) Rung 2 node shows a small "Continue" button rendered on the node itself. Clicking it logs to the console (the actual conversation flow comes in Phase 3).
result: pass

### 10. Back to Home button
expected: The tree canvas shows a "Back to Home" button. Clicking it returns you to the home screen showing the tree list again.
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
