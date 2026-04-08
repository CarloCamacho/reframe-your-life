---
phase: 02-firebase-auth-firestore-persistence
created: 2026-04-08T14:24:54Z
updated: 2026-04-08T14:24:54Z
discussion_mode: skipped (user chose sensible defaults)
---

# Phase 2 Context: Firebase Auth + Firestore Persistence

## Canonical Refs

- `.planning/REQUIREMENTS.md` — AUTH-01..03
- `.planning/ROADMAP.md` — Phase 2 goal and plan breakdown
- `src/services/firebase.js` — existing Firebase init (db, auth, analytics already exported)
- `src/store/appStore.js` — existing Zustand store to extend
- `src/data/mockTrees.js` — mock data to replace

## Decisions

### All gray areas deferred to researcher + planner defaults

User selected "skip — use sensible defaults." Downstream agents should apply Firebase best practices throughout.

**Firestore data model:** Use `users/{uid}/trees/{treeId}` collection with a separate `users/{uid}/trees/{treeId}/nodes/{nodeId}` subcollection. This keeps documents small, scales to large trees, and gives Phase 3's AI clean write targets per node. Do NOT embed nodes in the tree document.

**Auth integration:** Implement a `useAuth` hook that calls `signInAnonymously` on mount and exposes `uid` + `loading`. Wrap `App` in an `AuthProvider` (or call the hook at the top of `App.jsx`) so `uid` is available app-wide before any Firestore reads. Show nothing (or a minimal loading state) until auth resolves — do not render home screen before UID is known.

**Zustand store shape:** Extend the existing `appStore.js` with `uid`, `trees` (array), and a `setUid` / `setTrees` action rather than splitting into separate stores. Phase 3 will add conversation state to the same store; keep it unified until there's a clear reason to split.

**Real-time listeners:** Use `onSnapshot` for the tree list (HOME screen stays live). One-time `getDocs` is fine for reading a single tree's nodes when navigating to the canvas — real-time per-node updates are not needed until Phase 3.

**Mock data removal:** Delete `src/data/mockTrees.js` once Firestore reads are wired. Do not keep it as a fallback — the goal is to replace, not supplement.

**Error / offline handling:** Keep it simple for v1. If Firestore is unreachable, the UI stays in loading state — no offline queue, no optimistic updates. AUTH-01..03 only require persistence on the same device/browser; full offline support is out of scope.

## Locked Constraints (from PROJECT.md)

- Anonymous auth only — no login UI, no Google sign-in (v2)
- API keys must never be stored in Firestore — localStorage only (not relevant this phase but carries forward)
- Firestore region: `australia-southeast1` (already configured)

## Deferred Ideas

[none]
