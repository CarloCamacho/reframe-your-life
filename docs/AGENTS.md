# Reframe Your Life — AGENTS.md
> Project spec for Claude Code sessions. This is the single source of truth for the app.

---

## 1. Project Overview

**App Name:** Reframe Your Life  
**Brand:** Kellian Labs  
**Tagline:** Design your life, one reframe at a time  
**Type:** Responsive Progressive Web App (PWA)  
**Repo:** github.com/CarloCamacho/reframe-your-life  
**Hosting:** Firebase Hosting (initial), custom domain later  

### Purpose
Reframe Your Life is a personal life design tool based on the reframing ladder framework from Bill Burnett and Dave Evans (*How to Live a Meaningful Life*, Stanford Life Design Lab). It guides users through a structured, AI-facilitated conversation to move from a stuck problem to an actionable plan — visualised as a growing branching tree.

### Target User
People who feel stuck on a life problem — career, relationships, purpose, transitions — and want a structured way to think through it. Designed to be used on mobile or desktop, solo, in a reflective moment.

### Philosophy
- The AI acts as a warm, encouraging Stanford design lab facilitator — not a chatbot, not a therapist
- The framework does the heavy lifting; the user just talks in their own words
- The tree visualisation makes the thinking visible and navigable
- Progress is saved so the user can return, expand branches, and grow their thinking over time

---

## 2. The Reframing Ladder Framework

This is the core intellectual model. Every interaction maps to this structure.

### The Three Rungs

**Rung 1 — Frame the Problem**
> "How might I… [problem]?"

The user describes what they're stuck on in plain language. The AI reformulates it into a clean "How might I…" problem statement and confirms it with the user before proceeding.

**Rung 2 — Explore the Outcome**
> "What would I get if… [my problem was solved]?"

The AI asks the user to imagine the problem solved and describe what they'd have, feel, or experience. The user responds in their own words. The AI generates **three distinct outcome options** from the user's response, each phrased as a clear benefit or state. The user selects the one that resonates most (or asks the AI to generate alternatives).

**Rung 3 — Generate Actions**
> "How might I… [achieve that outcome]?"

With the chosen outcome as the new target, the AI asks the user how they might get there. The user responds freely. The AI surfaces **three to five actionable ideas or experiments** — small, low-risk, prototypable steps in the Burnett/Evans tradition. These become the leaves of the branch.

### Branching Logic
- Each Rung 2 outcome that is NOT selected becomes a **dormant branch** — visible on the tree, expandable later
- The user can return to any dormant branch at any time and continue down that path
- A branch can be marked as **explored**, **paused**, or **closed**
- Multiple trees can exist — one per life problem or theme

### The Three-Rung Rule
Burnett and Evans deliberately cap the ladder at three rungs. Going further risks runaway abstraction — where the user keeps asking "what would I get if *that* was solved?" until they arrive at "total freedom and inner peace," which is true but completely unactionable. The framework's power lies in landing at Rung 3 with something *concrete and doable today*.

**The app enforces this by design — there is no Rung 4.**

However, a Rung 3 action node can itself be a complex problem that deserves its own exploration. For these cases the app offers a **"Go Deeper"** option on any Rung 3 node, which spawns a new linked tree with that action as the root problem (Rung 1). This preserves the three-rung integrity of every individual tree while allowing genuine complexity to be explored across *connected trees*.

**Go Deeper rules:**
- Available on any Rung 3 action node
- Spawns a new tree pre-populated with the action as the problem statement
- The spawned tree is visually linked to its parent node — shown as a connected tree icon on the home screen and on the node itself
- The AI acknowledges the link: *"This looks like it might be its own challenge worth exploring. Want to start a new reframe from here?"*
- The parent tree is unaffected — the original Rung 3 node is marked as **"deepened"** rather than complete
- Recommended use cases called out in the UI tooltip: complex life transitions, action ideas that are themselves wicked problems (e.g. "start my own business"), or any Rung 3 result where the user's instinct is "but I don't know how to do that"

---

## 3. Screen Flow

### 3.1 Home Screen
- Lists all saved trees with name, date created, last updated, and status (active / paused / complete)
- "Start New Tree" button — prominent CTA
- Kellian Labs branding, minimal chrome

### 3.2 New Tree Setup
- AI facilitator introduces itself briefly (one short paragraph, warm tone)
- Asks: *"What's the problem or situation you'd like to reframe today? Just describe it in your own words — there's no wrong answer."*
- User types freely
- AI reformulates into a "How might I…" statement and asks: *"Does this capture it? Or would you like to adjust it?"*
- User confirms or edits
- Tree is created and saved with this as the root node

### 3.3 Tree View (Main Screen)
- Vertical tree, root (problem) at the bottom, growing upward
- Nodes are clearly labelled by rung:
  - 🌱 **Root** — the problem statement
  - 🔵 **Rung 2** — outcome options (selected = solid, dormant = faded)
  - 🟢 **Rung 3** — action ideas (leaves of the branch)
- Active branch is highlighted
- Dormant branches are visible but visually subdued
- Tap any node to see its full content
- Tap a dormant branch to expand it (triggers the AI conversation for that branch)
- "Continue" button on active branch to keep going
- Tree animates as new nodes are added (grows upward)

### 3.4 AI Conversation Panel
- Slides up from bottom on mobile, side panel on desktop
- Conversational, not form-based
- Shows current rung context at top (e.g. "Rung 2 — Exploring Outcomes")
- AI message, then user input field
- "Regenerate options" button available at Rung 2 and Rung 3
- Responses from AI are concise — max 3 sentences of facilitation, then the options

### 3.5 Node Detail View
- Tap any node to see full content
- Shows the question stem, the user's raw response, and the AI's formulation
- Option to edit the AI's formulation
- Option to add a personal note

### 3.6 Settings
- **AI Provider selection** — user selects their preferred provider before entering a key:
  - Anthropic (Claude Sonnet) — default
  - OpenAI (GPT-4o)
  - Google (Gemini Pro)
- **API key entry** — one key field per provider, stored in localStorage, never sent anywhere except the selected provider's API endpoint
- Active provider is shown in the header/settings with a subtle indicator
- Switching provider mid-session is allowed but prompts: *"Switching provider will use your new key from the next message. Your tree progress is unaffected."*
- Theme toggle (light/dark)
- Export tree as PDF or JSON
- Delete tree

---

## 4. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend framework | React 18 + Vite | Component model suits tree UI; strong Claude Code support |
| Tree visualisation | React Flow | Mature, interactive, supports custom nodes and animation |
| Styling | Tailwind CSS | Utility-first, fast to build responsive layouts |
| AI facilitation | Abstracted AI service layer | Supports Anthropic (default), OpenAI, Google Gemini — provider + key selected by user, stored in localStorage |
| Database | Firebase Firestore | Real-time, easy auth integration, scales well |
| Hosting | Firebase Hosting | Free tier, `firebase deploy` workflow, CDN-backed |
| Auth | Firebase Auth (Google + anonymous) | Anonymous first, Google sign-in to persist across devices |
| PWA | Vite PWA plugin | Adds manifest + service worker for "Add to Home Screen" |
| Version control | GitHub (CarloCamacho/reframe-your-life) | Source of truth, CI/CD to Firebase |

---

## 5. Data Model (Firestore)

```
users/{userId}
  trees/{treeId}
    id: string
    name: string
    createdAt: timestamp
    updatedAt: timestamp
    status: 'active' | 'paused' | 'complete'
    rootNode: Node
    linkedFromTreeId: string | null   // set if this tree was spawned via "Go Deeper"
    linkedFromNodeId: string | null   // the Rung 3 node that spawned this tree

  nodes/{nodeId}
    id: string
    treeId: string
    parentId: string | null
    rung: 1 | 2 | 3
    questionStem: string        // "How might I..."
    userRawResponse: string     // what the user typed
    aiFormulation: string       // what the AI produced
    userNote: string            // optional personal note
    status: 'active' | 'dormant' | 'explored' | 'closed' | 'deepened'
    deepenedTreeId: string | null     // set if "Go Deeper" was used on this node
    children: nodeId[]
    createdAt: timestamp

// Stored in localStorage only (never in Firestore)
aiProviderSettings: {
  activeProvider: 'anthropic' | 'openai' | 'gemini'
  keys: {
    anthropic: string
    openai: string
    gemini: string
  }
}
```

---

## 6. AI Facilitator Persona

The AI should always:
- Speak like a warm, encouraging Stanford design lab coach
- Keep messages short — 2-3 sentences max before presenting options
- Use plain, conversational language — no jargon
- Validate the user's input before reformulating ("That's a great place to start...")
- Never tell the user what they *should* do — only surface options
- Frame everything as an experiment, not a commitment
- Use "might" and "could" over "should" and "must"

### Depth-Prompting Behaviour
When the user's response contains only one detectable option, idea, or outcome, the AI must **not** proceed to the next rung. Instead it should gently prompt for more:

- *"What else might be possible here?"*
- *"What other outcomes could you imagine?"*
- *"How do you think you'd feel if this was fully resolved?"*
- *"Is there another angle you haven't considered yet?"*

This continues until at least **two or three distinct responses** have been surfaced. The AI then synthesises them into the structured options for that rung. This mirrors the Burnett/Evans philosophy that the first answer is rarely the most interesting one — divergent thinking must be protected before converging on a choice.

The AI should frame this prompting as curiosity, not as pushing back: *"That's one possibility — what else comes to mind?"* not *"You need to give more options."*

### System Prompt (base)
```
You are a warm, encouraging life design facilitator in the tradition of Stanford's Life Design Lab. 
You guide users through the Reframe Your Life framework — a structured ladder approach to moving 
from feeling stuck to having an actionable plan.

Your role is to ask good questions, listen carefully, and help the user see their situation from 
new angles. You never tell users what to do. You surface options and possibilities. You treat 
every response as valid data, not a problem to fix.

Keep your messages short — 2-3 sentences of facilitation, then present clearly numbered options. 
Use plain, warm language. Avoid jargon. Frame everything as low-stakes experiments, not life commitments.

IMPORTANT: If the user's response contains only one detectable idea or outcome, do not proceed. 
Gently prompt for more with questions like "What else might be possible?" or "How might you feel 
if this were fully resolved?" Protect divergent thinking before converging on options. Only 
present structured options once you have at least two or three distinct threads to work with.

Current framework context will be provided with each message.
```

---

## 7. Project Structure

```
reframe-your-life/
├── public/
│   ├── favicon.ico
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/
│   │   ├── Tree/
│   │   │   ├── TreeCanvas.jsx       # React Flow canvas
│   │   │   ├── TreeNode.jsx         # Custom node component
│   │   │   └── TreeControls.jsx     # Zoom, fit, expand controls
│   │   ├── Chat/
│   │   │   ├── ChatPanel.jsx        # AI conversation panel
│   │   │   ├── ChatMessage.jsx      # Individual message
│   │   │   └── ChatInput.jsx        # User input field
│   │   ├── Home/
│   │   │   ├── HomeScreen.jsx       # Tree list
│   │   │   └── TreeCard.jsx         # Individual tree summary card
│   │   └── UI/
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       └── NodeDetail.jsx
│   ├── hooks/
│   │   ├── useTree.js               # Tree CRUD operations
│   │   ├── useAI.js                 # Provider-agnostic AI hook (reads active provider from store)
│   │   └── useAuth.js               # Firebase auth
│   ├── services/
│   │   ├── firebase.js              # Firebase init + config
│   │   ├── firestore.js             # Firestore operations
│   │   └── ai/
│   │       ├── aiService.js         # Provider-agnostic interface (single entry point)
│   │       ├── anthropic.js         # Anthropic API adapter
│   │       ├── openai.js            # OpenAI API adapter
│   │       └── gemini.js            # Google Gemini API adapter
│   ├── store/
│   │   └── appStore.js              # Zustand global state
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example                     # API key template
├── firebase.json
├── firestore.rules
├── vite.config.js
├── tailwind.config.js
└── AGENTS.md                        # This file
```

---

## 8. V1 Scope (Build This First)

- [ ] Home screen with saved trees list, including linked tree relationships
- [ ] New tree creation with AI-facilitated Rung 1
- [ ] Rung 2 — three outcome options, user selects one
- [ ] Rung 3 — three to five action ideas generated
- [ ] Depth-prompting — AI detects thin responses and asks "what else?" before proceeding
- [ ] Three-rung hard cap — no Rung 4, enforced by design
- [ ] "Go Deeper" option on Rung 3 nodes — spawns linked child tree
- [ ] Linked tree indicator on home screen and node detail view
- [ ] Vertical tree visualisation with React Flow
- [ ] Dormant branches visible on tree
- [ ] Tap to expand dormant branch
- [ ] Node detail view (tap any node)
- [ ] Firebase Firestore persistence
- [ ] Anonymous auth (no login required for v1)
- [ ] AI provider selection (Anthropic / OpenAI / Google Gemini)
- [ ] API key entry per provider in settings, stored in localStorage
- [ ] Light/dark mode
- [ ] Mobile-responsive layout
- [ ] Firebase Hosting deployment

---

## 9. Out of Scope for V1

- Google sign-in / cross-device sync
- PDF/JSON export
- Sharing trees with others
- Push notifications / reminders
- Onboarding tutorial
- Multiple languages
- In-app payments or subscription

---

## 10. Design Principles

- **Mobile-first** — design for iPhone, enhance for desktop
- **Calm UI** — muted palette, generous whitespace, nothing urgent or alarming
- **The tree is the hero** — it should feel satisfying to watch it grow
- **Low friction** — user should be able to start a new tree in under 60 seconds
- **No dead ends** — every closed branch should feel like useful data, not failure
- **Three rungs, no more** — the constraint is a feature, not a limitation; enforce it with clarity and warmth
- **Fractal depth** — complexity is handled by connecting trees, not breaking the ladder

---

## 11. First Claude Code Session Checklist

1. Scaffold the Vite + React project
2. Install dependencies: React Flow, Tailwind, Firebase SDK, Zustand
3. Set up Firebase project and add config to `.env`
4. Build HomeScreen with mock data including one linked tree example
5. Build TreeCanvas with a static example tree showing all three rungs
6. Confirm layout and node styling before wiring up data

---

*Last updated: April 2026 — Kellian Labs (v1.2 — three-rung rule, Go Deeper / linked trees)*
