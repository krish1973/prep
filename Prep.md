# Project Specification: Prep — Family Packing & Event Readiness PWA

> **Prerequisite:** Read and strictly follow `ANTIGRAVITY_GLOBAL_PLAYBOOK.md` (including `UPDATE_LOG.md` tracking, `dev` $\rightarrow$ `main` Git workflow, and PWA-first Capacitor-ready architecture).

---

## 1. Product Vision & Tone
**Prep** is a calm, warm, privacy-first **Family Readiness & Packing Companion** (built as a PWA ready for iOS and Android packaging).
- **Core Purpose:** Help families prepare for both **major trips** (vacations, international flights, visiting relatives) and **everyday high-stakes life moments** (school exams, doctor/clinic visits, sports days, weekend shopping runs) so nothing important is ever forgotten at home or left behind at a hotel.
- **Voice & Visual Tone:** Clean, warm, consumer-friendly aesthetic (soft warm stone `#faf9f6`, crisp white cards `#ffffff`, deep charcoal text `#1c1917`, emerald `#047857` for ready/confirmed states, amber `#d97706` for gentle alerts). **No sci-fi jargon or robotic persona.** The app speaks like a thoughtful, organized family assistant.

---

## 2. Tech Stack & Architecture
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons.
- **Animations:** Framer Motion (or CSS keyframe spring animations) for tactile "pack-into-bag" and "fly-out-of-bag" item transitions.
- **Local-First Storage:** Dexie.js (IndexedDB) for full offline functionality, local document vault, and instant search.
- **Cloud Family Sync:** Supabase (Auth + Realtime Postgres) syncing lightweight event checklists, bag assignments, and family completion statuses.
- **AI & Vision:** Gemini Flash / Flash-Lite API (via lightweight edge proxy or user API config) with response caching and offline rule fallbacks for:
  1. Natural-language event/trip list generation + weather/context awareness.
  2. Camera item recognition, estimated weight calculation, and airline security rule checks.
  3. Local/ephemeral OCR parsing for passport expiry dates and flight ticket baggage allowances.

---

## 3. Core User Journey & Functional Requirements

### Phase 1: Conversational Interactive Onboarding (First-Time Launch)
When a new user opens the app for the first time, guide them through a friendly 6-step interactive walkthrough before showing the main dashboard:
1. **Warm Welcome:** Introduces Prep in plain language—explaining how it helps with trips, school exams, doctor visits, and errands.
2. **Everyday & Travel Scenarios:** Visual cards showing how it adapts across *Vacations & Homecoming*, *School Exams & Sports*, and *Doctor Visits & Errands*.
3. **Interactive "Try Packing" Sandbox:** Lets the user tap a sample item (e.g., *Winter Jacket*) right inside onboarding to watch it animate into a virtual suitcase and update the live weight bar.
4. **Peace-of-Mind Safeguards:** Explains *Before Leaving Home* checks, *Hotel Checkout Return Audits*, and *Offline Encrypted Privacy*.
5. **Household Setup:** Lets the user create/customize family member profiles (Name, Role: Organizer / Parent / Child / Family, Avatar, Color Badge) and share an instant family invite link/QR.
6. **Ready Transition:** Pre-loads realistic sample events so the user can explore immediately, with an option to clear sample data in one tap.

---

### Phase 2: Main App Navigation (4 Clean Tabs)

#### Tab 1: `Today` (Conversational Planner & Family Hub)
- **Natural-Language Event Creator ("Plan something new"):**
  - User types or speaks naturally (e.g., *"Planning a trip to Delhi to meet my brother from Dec 15 to Dec 22"* or *"Daughter has Math exam tomorrow at 8 AM"*).
  - App responds conversationally with relevant context (e.g., destination weather, staying-with-family adjustments like reserving spare bag weight for return gifts, or exam rules like no smartwatches) and generates tailored personal + shared checklists.
- **One-Tap Routine Quick-Starts:**
  - *Weekend Getaway*, *International Trip*, *Homecoming / Visiting Family*, *School Exam*, *Doctor / Lab Visit*, *Shopping Run*.
- **Live Family Readiness Strip:**
  - Displays each family member's live status (`Not Started`, `Packing...`, `Done ✓`) synced across devices.
- **Active Events Feed:**
  - Shows upcoming family events with completion progress bars (`8/11 packed`).

#### Tab 2: `Pack & Bags` (Interactive Packing, Camera Scan & Weight Guard)
- **Virtual Bags & Containers:**
  - Adaptive container terminology based on event type: **Suitcases / Cabin Rollers / Backpacks** (for travel), **School Bag / Exam Pouch** (for exams), **Document Folio** (for clinic/visa visits), **Shopping Tote** (for errands).
  - Tracks **empty tare weight + packed items** against the bag's limit (e.g., `19.6 / 23.0 kg`).
- **Tactile Pack & Unpack Animations:**
  - Tapping an unpacked item animates it dropping into the currently selected bag, stamps *"Packed in [Bag Name] • by [Member Name]"*, and updates the weight gauge.
  - Tapping a packed item animates it back out to the unpacked list.
- **"Show & Pack" Camera Scanner:**
  - Opens device camera (`getUserMedia`) so the user can hold up an item or snap a photo.
  - Identifies the item, estimates its weight, checks **airline security & country rules** (e.g., flags lithium power banks or >100ml liquids and routes them to Cabin vs. Checked baggage), and logs it into the bag.
- **Overweight Alert & 1-Tap Rebalance:**
  - Visual weight gauge shifts from Emerald (`<85%`) $\rightarrow$ Amber (`85–100%`) $\rightarrow$ Rose (`>100%`).
  - When overweight, proactively suggests moving a specific heavy item to an under-loaded family bag with one tap.
- **"Mark [Name] Done" Confirmation Button:**
  - Updates the user's status to `Done ✓` and notifies the family organizer.

#### Tab 3: `Find Item` ("Where Is It?" Instant Lookup)
- Global search across all active events, bags, and family members.
- Typing *"passport"*, *"hall ticket"*, or *"charger"* immediately returns:
  - Status (`Packed` vs. `Not Packed Yet`), **exact bag name**, **whose bag it is**, and **who packed it**.

#### Tab 4: `Docs & Home` (Document Vault & Departure / Return Audits)
- **Local-First Family Document Vault:**
  - Stores passport metadata, visa dates, flight tickets, and exam hall tickets encrypted in IndexedDB (protected by PIN/Biometric lock).
  - **6-Month Validity Alert:** Automatically checks family passport expiry dates against trip return dates and warns early if renewal is needed.
  - **Ticket Baggage Auto-Sync:** Extracts airline weight limits from uploaded ticket details to configure bag limits automatically.
- **Synced "Before Leaving Home" Checklist:**
  - Household tasks (*Turn off water heater & ACs, lock balcony doors, keep physical passports by front door*) synced live across parents with attribution tags (*"Checked by Krish"*).
- **Hotel Checkout "Return Audit" Mode:**
  - Flips the event's packed items and room checks into a reverse verification checklist on return day so chargers, toiletries, and kids' items are never left behind.

---

### Phase 3: App Exit / Lock-Screen Readiness Summary
- Provide a clean **"Departure Summary / Exit View"** (accessible from the top menu or when finishing packing) showing:
  - Overall family readiness badge, exact weight of every bag, total bag count to load into the car/taxi, and critical document location reminders.

---

## 4. Initial Execution Instructions for Antigravity
1. Initialize/verify the Git repository and ensure you are working on the `dev` branch (`git checkout -b dev`).
2. Create `UPDATE_LOG.md` and `ANTIGRAVITY_GLOBAL_PLAYBOOK.md` in the project root.
3. Scaffold the PWA project (Vite + React + TypeScript + Tailwind CSS + `vite-plugin-pwa` + Dexie.js).
4. Implement the 6-step Conversational Onboarding and the 4-tab Prep application with offline persistence and smooth micro-animations.
5. Verify `npm run build` succeeds with zero errors, log the milestone in `UPDATE_LOG.md`, commit to `dev`, and merge cleanly into `main`.