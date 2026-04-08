# Reframe Your Life

## What This Is

Reframe Your Life is a personal life design PWA built on the reframing ladder framework from Bill Burnett and Dave Evans (Stanford Life Design Lab). It guides users through a structured, AI-facilitated conversation — moving from a stuck problem to an actionable plan — visualised as a growing branching tree. Built for mobile and desktop, it's designed for solo, reflective use.

## Core Value

The tree grows as the user thinks — turning fuzzy stuck feelings into concrete, doable actions through a structured three-rung conversation.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Home screen listing all saved trees with status and linked-tree relationships
- [ ] New tree creation with AI-facilitated Rung 1 ("How might I…" problem framing)
- [ ] Rung 2 — AI generates three distinct outcome options; user selects one
- [ ] Rung 3 — AI generates three to five action ideas as leaves
- [ ] Depth-prompting — AI detects thin responses and asks "what else?" before proceeding
- [ ] Three-rung hard cap enforced by design — no Rung 4 ever
- [ ] "Go Deeper" on Rung 3 nodes — spawns a linked child tree pre-seeded with that action as the root problem
- [ ] Dormant branches — unselected Rung 2 options visible on tree, expandable later
- [ ] Vertical React Flow tree (root at bottom, grows upward) with custom node components
- [ ] Node detail view — tap any node to see question stem, user response, AI formulation
- [ ] Firebase Firestore persistence (anonymous auth, per-user data)
- [ ] AI provider selection: Anthropic (default), OpenAI, Google Gemini — key stored in localStorage only
- [ ] Light/dark mode
- [ ] Mobile-responsive layout (mobile-first)
- [ ] Firebase Hosting deployment

### Out of Scope

- Google sign-in / cross-device sync — deferred to v2; anonymous auth sufficient for v1
- PDF/JSON export — v2 feature
- Sharing trees with others — v2 feature
- Push notifications / reminders — not core to v1 value
- Onboarding tutorial — low friction by design; not needed for v1
- Multiple languages — English only for v1
- In-app payments or subscription — v2+
- Rung 4 — deliberately prohibited; use "Go Deeper" for complexity

## Context

- **Framework source:** Burnett & Evans, *How to Live a Meaningful Life*, Stanford Life Design Lab
- **Scaffold:** Vite + React 18, `@xyflow/react`, Firebase 11, Zustand 5, Tailwind 4 — all installed
- **Firebase:** Project `reframe-your-life` connected; Firestore DB created in `australia-southeast1`; rules deployed; `.env` populated
- **AI layer:** Provider-agnostic — Claude Sonnet (default), GPT-4o, Gemini Pro; keys in localStorage only
- **Brand:** Kellian Labs — calm UI, muted palette, generous whitespace
- **Tree UX:** Vertical, grows upward; root at bottom; dormant branches subdued but visible

## Constraints

- **Tech stack:** React 18 + Vite + Tailwind 4 + React Flow + Firebase + Zustand — locked
- **Three-rung rule:** Hard cap at Rung 3. "Go Deeper" is the only escape valve, and it spawns a new tree.
- **API keys:** Must never be stored in Firestore — localStorage only
- **Auth:** Anonymous auth for v1; no login required
- **Hosting:** Firebase Hosting, `firebase deploy` workflow

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Anonymous auth for v1 | Eliminates login friction; Google sign-in deferred to v2 | — Pending |
| Provider-agnostic AI layer | Users own their API keys; no vendor lock-in | — Pending |
| React Flow for tree viz | Mature, interactive, supports custom nodes and animation | — Pending |
| Three-rung hard cap | Burnett/Evans principle — prevents runaway abstraction | — Pending |
| "Go Deeper" over Rung 4 | Preserves ladder integrity while handling genuine complexity | — Pending |
| Firestore in australia-southeast1 | Closest region to target users | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-08 after initialization*
