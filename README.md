<div align="center">

<!--
  REFRAME YOUR LIFE — Logo (SVG inline)
  Render in GitHub by wrapping in HTML comment-free div
-->

```
                    ╭─────────────────────────────────────╮
                    │                                     │
                    │   ┌──────────────────────────────┐  │
                    │   │  🟢  Start a business         │  │
                    │   │  🟢  Talk to a career coach   │  │
                    │   │  🟢  Run a 30-day experiment  │  │
                    │   └──────────┬───────────────────-┘  │
                    │              │  Rung 3 — Actions      │
                    │   ┌──────────┴───────────────────-┐  │
                    │   │  🔵  More autonomy at work     │  │
                    │   └──────────┬───────────────────-┘  │
                    │              │  Rung 2 — Outcome      │
                    │   ┌──────────┴───────────────────-┐  │
                    │   │  🌱  How might I find work     │  │
                    │   │      that feels meaningful?    │  │
                    │   └──────────────────────────────┘  │
                    │              Rung 1 — Problem         │
                    │                                     │
                    ╰─────────────────────────────────────╯
```

# Reframe Your Life

### *Design your life, one reframe at a time*

**A Kellian Labs project**

---

![Status](https://img.shields.io/badge/status-in%20development-orange?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Hosting-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![React Flow](https://img.shields.io/badge/React%20Flow-tree%20viz-FF0072?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-enabled-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

</div>

---

## What is Reframe Your Life?

Reframe Your Life is a personal life design tool inspired by the **Reframing Ladder** framework from Bill Burnett and Dave Evans (*How to Live a Meaningful Life*, Stanford Life Design Lab).

Most people who feel stuck on a life problem — career, relationships, purpose, transitions — either overthink it or avoid it entirely. Reframe Your Life offers a third path: a warm, AI-facilitated conversation that guides you from *"I don't know what to do"* to *"here are three things I could try this week"* — and makes your thinking visible as a growing, branching tree you can return to, expand, and build over time.

> *"Problem-finding precedes problem-solving. If you're working on the wrong problem, it doesn't matter."*
> — Bill Burnett & Dave Evans, Stanford Life Design Lab

---

## The Framework — Three Rungs

The entire app is built around a single, powerful three-step ladder.

### 🌱 Rung 1 — Frame the Problem
> *"How might I… [problem]?"*

You describe what you're stuck on in plain language. The AI facilitator reformulates it into a clean design question and checks it with you before moving on. This single act of reframing — from complaint to question — changes everything about how you approach it.

### 🔵 Rung 2 — Explore the Outcome
> *"What would I get if… my problem was solved?"*

You imagine the problem resolved and describe what you'd have, feel, or experience. The AI surfaces **three distinct outcome options** from your response. You pick the one that resonates most — or ask for alternatives. The options you don't choose become **dormant branches** on your tree, available to explore later.

### 🟢 Rung 3 — Generate Actions
> *"How might I… achieve that outcome?"*

With your chosen outcome as the new target, the AI helps surface **three to five small, low-risk, prototypable actions** — the kind of experiments Burnett and Evans champion. These become the leaves of your branch and the starting point for actually doing something.

---

## The Three-Rung Rule

Burnett and Evans are deliberate about stopping at three rungs. Go further and you risk runaway abstraction — climbing the ladder until you arrive at *"I just want total freedom and inner peace"*, which is true, but completely unactionable.

**Reframe Your Life enforces this by design. There is no Rung 4.**

That said, sometimes a Rung 3 action is itself a wicked problem — *"start my own business"* isn't a single step, it's a new challenge entirely. For these cases, any Rung 3 node can be used to **Go Deeper**, which spawns a new linked tree with that action as the root. The integrity of each individual tree stays intact while your thinking can grow across a connected network of trees — fractal depth, without the drift.

---

## Key Features

- **AI Facilitation** — conversational, warm, like a Stanford design lab coach. You talk in your own words; the AI structures it into the framework.
- **Depth-Prompting** — if your response only surfaces one idea, the AI won't proceed. It asks *"what else might be possible?"* until divergent thinking has been protected.
- **Growing Tree Visualisation** — built with React Flow. Your problem sits at the root, branches grow upward as you climb the rungs. Dormant branches stay visible — nothing is a dead end.
- **Go Deeper** — spawn a linked child tree from any Rung 3 action node for complex challenges that need their own ladder.
- **Multi-Provider AI** — choose your AI provider (Anthropic Claude, OpenAI GPT-4o, or Google Gemini). Your API key stays on-device in localStorage, never stored server-side.
- **Persistent Trees** — all trees saved to Firebase Firestore. Return, expand, and grow your thinking over time.
- **PWA Ready** — add to your home screen on iOS or Android for a near-native experience.
- **Light / Dark Mode** — calm, considered UI in both themes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Tree Visualisation | React Flow |
| Styling | Tailwind CSS |
| State Management | Zustand |
| AI Facilitation | Abstracted service layer — Anthropic / OpenAI / Google Gemini |
| Database | Firebase Firestore |
| Auth | Firebase Auth (anonymous v1, Google sign-in planned) |
| Hosting | Firebase Hosting |
| PWA | Vite PWA Plugin |
| Version Control | GitHub → Firebase CI/CD |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project (Firestore + Hosting enabled)
- An API key from at least one AI provider:
  - [Anthropic Console](https://console.anthropic.com) *(recommended)*
  - [OpenAI Platform](https://platform.openai.com)
  - [Google AI Studio](https://aistudio.google.com)

### Installation

```bash
# Clone the repo
git clone https://github.com/CarloCamacho/reframe-your-life.git
cd reframe-your-life

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Firebase config to .env
# (API keys are entered in-app via Settings, not .env)

# Start dev server
npm run dev
```

### Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialise
firebase login
firebase init

# Deploy
firebase deploy
```

### Adding Your API Key

On first launch, go to **Settings → AI Provider**, select your provider, and paste your API key. It's stored in your browser's localStorage only — never sent to any server other than your chosen AI provider.

---

## Project Structure

```
reframe-your-life/
├── public/
│   ├── favicon.ico
│   └── manifest.json              # PWA manifest
├── src/
│   ├── components/
│   │   ├── Tree/
│   │   │   ├── TreeCanvas.jsx     # React Flow canvas
│   │   │   ├── TreeNode.jsx       # Custom node component
│   │   │   └── TreeControls.jsx   # Zoom, fit, expand controls
│   │   ├── Chat/
│   │   │   ├── ChatPanel.jsx      # AI conversation panel
│   │   │   ├── ChatMessage.jsx    # Individual message bubble
│   │   │   └── ChatInput.jsx      # User input field
│   │   ├── Home/
│   │   │   ├── HomeScreen.jsx     # Tree list + New Tree CTA
│   │   │   └── TreeCard.jsx       # Tree summary card
│   │   └── UI/
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       └── NodeDetail.jsx
│   ├── hooks/
│   │   ├── useTree.js             # Tree CRUD operations
│   │   ├── useAI.js               # Provider-agnostic AI hook
│   │   └── useAuth.js             # Firebase auth
│   ├── services/
│   │   ├── firebase.js            # Firebase init
│   │   ├── firestore.js           # Firestore operations
│   │   └── ai/
│   │       ├── aiService.js       # Provider-agnostic entry point
│   │       ├── anthropic.js       # Anthropic adapter
│   │       ├── openai.js          # OpenAI adapter
│   │       └── gemini.js          # Google Gemini adapter
│   ├── store/
│   │   └── appStore.js            # Zustand global state
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── docs/
│   └── AGENTS.md                  # Claude Code project spec
├── .env.example
├── firebase.json
├── firestore.rules
├── vite.config.js
└── tailwind.config.js
```

---

## Roadmap

### v1 — Current Build
- [x] Project scaffold + spec
- [ ] Home screen with saved trees
- [ ] AI-facilitated three-rung ladder
- [ ] React Flow tree visualisation
- [ ] Dormant branches + Go Deeper
- [ ] Multi-provider AI (Anthropic / OpenAI / Gemini)
- [ ] Firebase persistence + anonymous auth
- [ ] PWA manifest
- [ ] Firebase Hosting deployment

### v2 — Planned
- [ ] Google sign-in + cross-device sync
- [ ] Export tree as PDF
- [ ] Share a tree with someone
- [ ] Onboarding experience for new users

### Later
- [ ] Push notification reminders (*"You have a dormant branch to explore"*)
- [ ] Multiple languages
- [ ] Community trees (anonymised, opt-in)

---

## Philosophy

Reframe Your Life is built on a handful of design principles that inform every decision:

- **Mobile-first** — designed for iPhone, enhanced for desktop
- **Calm UI** — muted palette, generous whitespace, nothing urgent
- **The tree is the hero** — it should feel satisfying to watch it grow
- **Low friction** — new tree started in under 60 seconds
- **No dead ends** — every dormant branch is useful data, not failure
- **Three rungs, no more** — the constraint is a feature, not a limitation
- **Fractal depth** — complexity is handled by connecting trees, not breaking the ladder

---

## About

Built by [Ian](https://github.com/CarloCamacho) under the **Kellian Labs** brand.

Inspired by the work of Bill Burnett and Dave Evans at Stanford's Life Design Lab — particularly their book *How to Live a Meaningful Life* (2025). This project is an independent tool and is not affiliated with or endorsed by Stanford University or the Life Design Lab.

---

<div align="center">
  <sub>Kellian Labs · Perth, Western Australia · 2026</sub>
</div>
