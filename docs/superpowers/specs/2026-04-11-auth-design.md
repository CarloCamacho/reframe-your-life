# Auth Design — Sign In / Sign Up with Ladder Migration

**Date:** 2026-04-11  
**Project:** Reframe Your Life  
**Feature:** Email authentication with anonymous-to-named account migration

---

## Overview

Add email-based sign-in (passwordless primary, password secondary) to allow users to restore saved ladders across devices and sessions. All Firestore data is already scoped to `users/{uid}/trees`, so named accounts just need to carry the same UID forward via Firebase account linking.

---

## Auth States

| State | Description | Account button |
|---|---|---|
| Loading | App init, waiting for `onAuthStateChanged` | Hidden (loading screen) |
| Anonymous | Silent sign-in on load | "Sign in" |
| Email link sent | Awaiting user to click magic link | Modal: "Check your inbox" |
| Authenticated | Named email account | Truncated email + "Sign out" |

---

## Components

### `useAuth.js` (modified)

Extends existing anonymous auth hook with:

- **`sendSignInLink(email)`** — sends Firebase email-link, stores email in `localStorage` (`ryl_email_for_signin`) for cross-device recovery
- **`completeEmailLinkSignIn()`** — called on app load; checks `isSignInWithEmailLink(window.location.href)`, retrieves stored email, calls `linkWithCredential` (anon → email) or falls back to `signInWithEmailLink` for returning users
- **`signInWithPassword(email, password)`** — `signInWithEmailAndPassword` with same account-linking logic
- **`createWithPassword(email, password)`** — `createUserWithEmailAndPassword` with `linkWithCredential`
- **`signOut()`** — signs out named user; `onAuthStateChanged` triggers new anonymous session

**Account linking logic (shared):**  
1. Try `linkWithCredential(auth.currentUser, credential)`  
2. If `auth/email-already-in-use` → fall back to `signInWithCredential(auth, credential)` (switches to existing UID; anonymous ladders left behind)

### `AuthModal.jsx` (new)

Modal overlay triggered by account button. Two modes controlled by local state:

**Primary (passwordless):**
1. Email input + "Send magic link" button
2. On submit: show "Check your inbox — we sent a link to {email}" + "Resend" link
3. Small "Use password instead" link below button switches to password mode

**Secondary (password):**
- Email + password inputs
- Toggle between "Sign in" and "Sign up" below the form
- "Back to magic link" link

**Dismiss:** click backdrop or ✕. Anonymous session continues unaffected.

### `HomeScreen.jsx` (modified)

Add account button top-right of header:
- **Anonymous:** person icon + "Sign in" label (ghost button style)
- **Authenticated:** person icon + truncated email (e.g. `ian@...`) + chevron → dropdown with "Sign out"

### Email link handler (in `useAuth.js`)

On every app load, `useEffect` checks `isSignInWithEmailLink(window.location.href)`. If true, retrieves email from `localStorage` (or prompts user to enter it if on a different device), then completes sign-in.

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Email link opened on different device | Prompt for email address; stored `ryl_email_for_signin` won't be present |
| Linking to existing account | `auth/email-already-in-use` → fall back to `signInWithCredential`; anon ladders left behind |
| Sign out | New anonymous session created automatically; user starts fresh as anon |
| Password account on existing email-link account | Same `linkWithCredential` → existing account fallback |

---

## What Doesn't Change

- Firestore data model (`users/{uid}/trees/...`) — unchanged
- `TreeCanvas`, `ChatPanel` — no auth changes needed
- UID in Zustand store (`appStore`) — same mechanism, same consumers

---

## Files Changed

| File | Change |
|---|---|
| `src/hooks/useAuth.js` | Add email-link + password auth functions, email link handler on mount |
| `src/components/Auth/AuthModal.jsx` | New — modal with passwordless/password flows |
| `src/components/Home/HomeScreen.jsx` | Add account button to header |
| `src/store/appStore.js` | Add `authModalOpen`, `setAuthModalOpen` state |
