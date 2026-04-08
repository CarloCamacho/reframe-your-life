# Roadmap: Reframe Your Life

**Created:** 2026-04-08
**Milestone:** v1 — Full feature-complete PWA

---

## Phase 1 — Home Screen + Static Tree UI

**Goal:** Deliver a working visual foundation — the home screen and a static tree canvas showing all three rungs with proper node styling. No AI, no data — just the UI skeleton that proves the layout and tree feel right.

**Requirements:** HOME-01..04, TREE-01..07

**Plans:** 3 plans

Plans:
- [ ] 01-01-PLAN.md — Home screen with TreeCard list, linked-tree indicator, Start New Tree CTA
- [ ] 01-02-PLAN.md — Static tree canvas with custom TreeNode component and 7-node example tree
- [ ] 01-03-PLAN.md — App shell: bun install, Zustand store, Tailwind theme tokens, React Flow CSS, App.jsx routing

**Done when:** Home screen renders with mock tree list including one linked-tree example; tree canvas renders the static example tree with all node types correctly styled; layout is mobile-responsive.

---

## Phase 2 — Firebase Auth + Firestore Persistence

**Goal:** Replace mock data with real Firestore-backed data. Anonymous auth on launch, trees and nodes persisted per user, hooks wired into the UI.

**Requirements:** AUTH-01..03

### Plans

1. **Anonymous auth** — `useAuth.js` hook; sign in anonymously on launch; persist UID across sessions
2. **Firestore service** — `firestore.js` CRUD for trees and nodes; real-time listeners for tree list
3. **Wire home + tree to Firestore** — Replace mock data; create/read/update trees from Firestore; `useTree.js` hook

**Done when:** App signs in anonymously on launch; creating a new tree persists it to Firestore; refreshing the page restores the tree list.

---

## Phase 3 — AI Conversation Engine

**Goal:** Implement the full three-rung AI facilitation flow — Rung 1 problem framing, Rung 2 outcome options, Rung 3 action ideas — with depth-prompting and the provider-agnostic AI service layer.

**Requirements:** AI-01..11

### Plans

1. **AI service layer** — `aiService.js` + adapters for Anthropic, OpenAI, Gemini; reads active provider + key from Zustand store
2. **Chat panel UI** — `ChatPanel.jsx`, `ChatMessage.jsx`, `ChatInput.jsx`; slides up on mobile, side panel on desktop; shows rung context
3. **Rung 1 flow** — Problem intake → "How might I…" reformulation → user confirmation → tree root node created
4. **Rung 2 flow** — Outcome elicitation → depth-prompting if thin → three options generated → user selects → dormant branches created for non-selected options
5. **Rung 3 flow** — Action elicitation → depth-prompting → three–five actions generated → leaf nodes added → three-rung cap enforced

**Done when:** User can complete a full Rung 1→2→3 conversation; depth-prompting triggers on thin responses; tree updates live as each rung completes; no Rung 4 is ever accessible.

---

## Phase 4 — Go Deeper + Node Detail

**Goal:** "Go Deeper" on any Rung 3 node spawns a linked child tree. Dormant branches can be expanded. Tapping any node opens a detail view.

**Requirements:** DEEP-01..05, NODE-01..03

### Plans

1. **Go Deeper** — "Go Deeper" button on Rung 3 nodes; spawn linked tree pre-seeded with action as root; mark parent node "deepened"; show link indicator
2. **Dormant branch expansion** — Tap dormant Rung 2 node to trigger AI conversation for that branch path
3. **Node detail view** — `NodeDetail.jsx`; shows question stem, raw response, AI formulation; edit AI formulation; add personal note

**Done when:** "Go Deeper" creates a linked tree visible on home screen; dormant branches are expandable; node detail shows all content fields and allows editing.

---

## Phase 5 — Settings + API Key Management

**Goal:** User can select their AI provider, enter API keys (stored in localStorage only), and toggle light/dark mode.

**Requirements:** SET-01..05

### Plans

1. **Settings screen** — `SettingsScreen.jsx`; provider selection; API key entry per provider; active provider indicator; mid-session switch confirmation
2. **Theme** — Light/dark mode toggle wired to Tailwind and persisted in localStorage

**Done when:** User can enter an Anthropic key, switch to OpenAI, enter that key, and switch back — each switch uses the correct key; theme toggle persists across refreshes.

---

## Phase 6 — PWA + Firebase Hosting Deployment

**Goal:** App is deployable to Firebase Hosting, installable as a PWA, and all SPA routing works.

**Requirements:** DEP-01..03

### Plans

1. **PWA setup** — `vite-plugin-pwa`; `manifest.json`; service worker; app icons; "Add to Home Screen" prompt
2. **Build + deploy** — `vite build` clean; `firebase deploy` to `reframe-your-life` project; verify SPA rewrites; smoke test on live URL

**Done when:** `firebase deploy` succeeds; app is live at Firebase Hosting URL; PWA install prompt appears on mobile; refreshing a deep link works.

---

## Phase Summary

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| 1 | Home + Tree UI | Visual foundation with mock data |
| 2 | Auth + Persistence | Real Firestore data, anonymous auth |
| 3 | AI Conversation | Full Rung 1→2→3 flow |
| 4 | Go Deeper + Detail | Linked trees, node editing |
| 5 | Settings | Provider/key management, theme |
| 6 | PWA + Deploy | Live on Firebase Hosting |

---
*Roadmap created: 2026-04-08*
*Last updated: 2026-04-08 after Phase 1 planning*
