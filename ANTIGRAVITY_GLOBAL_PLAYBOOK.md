# Antigravity Engineering & Workflow Playbook (Global Standards)

> **Mandatory Operating Rules for All Projects:** Follow these practices strictly on every prompt, feature build, refactor, and new chat session.

---

## 1. Session Continuity & `UPDATE_LOG.md` Protocol
1. **Start of Every New Chat / Session:**
   - Before proposing changes or writing code, **always read `UPDATE_LOG.md`** in the project root to restore full context of what has been built, current branch state, known bugs, pending tasks, and architectural decisions.
   - If `UPDATE_LOG.md` does not exist yet on a brand-new repository, create it immediately during initial scaffolding.
2. **End of Every Task / Feature Milestone:**
   - Append a concise, timestamped entry to `UPDATE_LOG.md` covering:
     - **Date & Time**
     - **Branch** (`dev` or `main`)
     - **What Changed** (files created/modified, features implemented)
     - **Architecture / Schema Notes** (any new IndexedDB tables, API routes, or environment variables)
     - **Next Planned Steps / Open Items**
   - Never overwrite previous log entries; keep them in reverse-chronological order (newest at the top).

---

## 2. Git Branching & Commit Discipline (`dev` $\rightarrow$ `main`)
1. **Never commit untested work directly to `main`.**
2. **Default Working Branch:** Perform all active development, feature additions, and bug fixes on the `dev` branch (`git checkout -b dev` if not already created).
3. **Atomic, Meaningful Commits:**
   - Commit logical units of work with clear prefixes: `feat:`, `fix:`, `ui:`, `refactor:`, `docs:`, `chore:`.
   - Always include the updated `UPDATE_LOG.md` in your commits.
4. **Promotion to `main`:**
   - Only merge `dev` into `main` after verifying that the build compiles cleanly (`npm run build`), has zero TypeScript/lint errors, and passes core user-flow checks.
   - Use clean merge commits or fast-forward merges from `dev` $\rightarrow$ `main`, then return to `dev` for subsequent work.

---

## 3. PWA-First, Capacitor-Ready Mobile Architecture
Build every application as an **offline-capable Progressive Web App (PWA) first**, structured cleanly so it can be wrapped into native **iOS and Android** binaries via **Capacitor** without rewriting business logic or UI:
1. **Framework & Styling:**
   - React + TypeScript + Vite (or Next.js static/hybrid export compatible with Capacitor) + Tailwind CSS.
   - Enforce mobile-first responsive viewports (`100dvh`, safe-area insets `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` for iOS notch and Android gesture bars).
2. **PWA Core Requirements:**
   - Valid `manifest.webmanifest` (app name, icons `192x192` and `512x512`, `display: "standalone"`, theme/background colors).
   - Service Worker (via `vite-plugin-pwa` / Workbox) caching the app shell and static assets for full offline startup.
3. **Capacitor Compatibility Guardrails:**
   - Avoid server-only runtime dependencies on the client UI so the frontend bundle builds cleanly into static `dist/` assets.
   - Abstract device hardware APIs (Camera, Biometrics/Passkeys, Local Notifications, Share Sheet, File System) behind clean service wrappers (`src/services/device/`) so web fallbacks (`navigator.mediaDevices`, Web Share API, WebAuthn) can seamlessly swap to Capacitor plugins later.

---

## 4. Local-First Privacy & UX Quality Standards
1. **Local-First Storage:**
   - Store personal user data, documents, and offline states locally in **IndexedDB** (via Dexie.js) first.
   - Cloud sync (e.g., Supabase) must sync lightweight structured state without storing sensitive personal documents/scans on central servers unless explicitly encrypted end-to-end.
2. **Calm, Progressive-Disclosure UI:**
   - Keep screens uncluttered—surface only what the user needs for the current step.
   - Avoid technical jargon, debug badges, or sci-fi/robotic copy in user-facing text. Write in warm, clear, human language.
   - Provide tactile micro-interactions (smooth transitions, optimistic UI updates, clear loading/empty states).
