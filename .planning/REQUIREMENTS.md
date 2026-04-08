# Requirements: Reframe Your Life

**Defined:** 2026-04-08
**Core Value:** The tree grows as the user thinks — turning fuzzy stuck feelings into concrete, doable actions through a structured three-rung conversation.

## v1 Requirements

### Home & Navigation

- [ ] **HOME-01**: User sees a list of all saved trees with name, date created, last updated, and status (active/paused/complete)
- [ ] **HOME-02**: User can tap "Start New Tree" to begin a new reframing session
- [ ] **HOME-03**: Linked trees (spawned via "Go Deeper") are visually indicated on the home screen
- [ ] **HOME-04**: App loads directly to the home screen on return visits

### Tree Visualisation

- [ ] **TREE-01**: Tree renders vertically with root node at the bottom, growing upward
- [ ] **TREE-02**: Nodes are visually distinguished by rung (Root / Rung 2 / Rung 3) with clear labels and colour coding
- [ ] **TREE-03**: Active branch is highlighted; dormant branches are visible but visually subdued
- [ ] **TREE-04**: Tree animates as new nodes are added
- [ ] **TREE-05**: User can tap any node to open the node detail view
- [ ] **TREE-06**: User can tap a dormant branch to expand it (triggers AI conversation for that path)
- [ ] **TREE-07**: "Continue" button on active branch resumes the AI conversation

### AI Conversation

- [ ] **AI-01**: AI facilitator introduces itself and asks the user to describe their problem in their own words (Rung 1)
- [ ] **AI-02**: AI reformulates the user's problem into a "How might I…" statement and confirms with the user
- [ ] **AI-03**: AI asks the user to imagine the problem solved and describe what they'd have/feel/experience (Rung 2 setup)
- [ ] **AI-04**: AI generates exactly three distinct outcome options from the user's Rung 2 response
- [ ] **AI-05**: User selects one outcome option (or requests alternatives)
- [ ] **AI-06**: AI asks how the user might achieve the chosen outcome (Rung 3 setup)
- [ ] **AI-07**: AI generates three to five actionable ideas from the user's Rung 3 response
- [ ] **AI-08**: Depth-prompting — if user response contains only one detectable idea, AI prompts for more before proceeding
- [ ] **AI-09**: Three-rung hard cap enforced — no Rung 4 is ever offered or accessible
- [ ] **AI-10**: "Regenerate options" available at Rung 2 and Rung 3
- [ ] **AI-11**: AI persona is warm, encouraging, Stanford design lab facilitator — short messages, options clearly numbered

### Go Deeper

- [ ] **DEEP-01**: "Go Deeper" option is available on any Rung 3 action node
- [ ] **DEEP-02**: Selecting "Go Deeper" spawns a new linked tree pre-seeded with that action as the Rung 1 problem
- [ ] **DEEP-03**: Parent Rung 3 node is marked "deepened" (not complete)
- [ ] **DEEP-04**: Spawned tree displays a visual link indicator back to its parent tree/node
- [ ] **DEEP-05**: Linked tree relationship is shown on the home screen

### Node Detail

- [ ] **NODE-01**: Tapping any node shows its question stem, the user's raw response, and the AI's formulation
- [ ] **NODE-02**: User can edit the AI's formulation
- [ ] **NODE-03**: User can add a personal note to any node

### Settings & Configuration

- [ ] **SET-01**: User can select their preferred AI provider (Anthropic / OpenAI / Google Gemini)
- [ ] **SET-02**: User can enter an API key per provider — stored in localStorage only, never in Firestore
- [ ] **SET-03**: Active provider shown in settings with a subtle indicator
- [ ] **SET-04**: Switching provider mid-session shows a confirmation message
- [ ] **SET-05**: Light/dark mode toggle

### Persistence & Auth

- [ ] **AUTH-01**: App signs the user in anonymously on first launch (no login required)
- [ ] **AUTH-02**: User's trees and nodes are stored in Firestore under their anonymous UID
- [ ] **AUTH-03**: Data persists across sessions on the same device/browser

### Deployment

- [ ] **DEP-01**: App builds and deploys to Firebase Hosting via `firebase deploy`
- [ ] **DEP-02**: SPA routing rewrites configured so deep links work
- [ ] **DEP-03**: App is installable as a PWA ("Add to Home Screen")

## v2 Requirements

### Cross-Device Sync

- **SYNC-01**: User can sign in with Google to sync trees across devices
- **SYNC-02**: Anonymous session can be upgraded to Google account without data loss

### Export

- **EXP-01**: User can export a tree as PDF
- **EXP-02**: User can export a tree as JSON

### Sharing

- **SHARE-01**: User can share a read-only link to a tree

### Notifications

- **NOTF-01**: User can set a reminder to revisit a paused tree

## Out of Scope

| Feature | Reason |
|---------|--------|
| Rung 4 | Deliberately prohibited — Burnett/Evans principle; "Go Deeper" handles complexity |
| In-app payments | v2+ |
| Multiple languages | English only for v1 |
| Onboarding tutorial | Low friction by design; AGENTS.md warmth covers it |
| Admin dashboard | No moderation needed for anonymous single-user data |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HOME-01..04 | Phase 1 | Pending |
| TREE-01..07 | Phase 1 | Pending |
| AUTH-01..03 | Phase 2 | Pending |
| AI-01..11 | Phase 3 | Pending |
| DEEP-01..05 | Phase 4 | Pending |
| NODE-01..03 | Phase 4 | Pending |
| SET-01..05 | Phase 5 | Pending |
| DEP-01..03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 36 total
- Mapped to phases: 36
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-08 after initial definition*
