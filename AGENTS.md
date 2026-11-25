# AGENTS.md — Fafo Delivery Partner App

**Read this file completely before changing any code in this repository.**
It explains what the project is, how it is organised, and the rules every AI
coding agent (and human contributor) must follow.

---

## 1. Project overview and purpose

Fafo Delivery Partner App is the **delivery partner frontend** for an existing
grocery and restaurant delivery platform. The existing platform already manages
shops, restaurants and orders; this repository contains **only** the partner
experience.

The product direction is now **PicDrop + HopNgo**, a wider delivery, marketplace
and mobility platform. This repository remains its **delivery-partner module**.
The PicDrop requirement documents in `docs/` are the source of truth for delivery
behaviour; "Fafo" is the legacy name used by the current prototype. Buyer,
seller, fleet, admin and HopNgo passenger features stay out of scope until the
owner approves a scope change.

A delivery partner uses the app to:

1. Sign in / register with a mobile number.
2. Complete onboarding: personal details, KYC documents, vehicle and bank details.
3. Go online and receive delivery requests.
4. Accept or reject requests, then manage the delivery until completion.
5. Review delivery history, earnings, notifications and support.

Out of scope: grocery store management, restaurant management, a customer app,
a parcel app, a replacement order-management system, and any backend API that
does not already exist. **Do not invent backend endpoints.**

---

## 2. Current development status

**Phases 1–11 — partner app: complete. The Firebase demo-auth bridge and
onboarding persistence are connected, and the admin-to-partner delivery loop is
live: assigned offers arrive via `onSnapshot`, acceptance runs in a Firestore
transaction, and the lifecycle plus GPS position update the shared `deliveries`
document. Notifications are real events; earnings and support stay
mock-driven.**

What exists today:

- Vite + React 19 + TypeScript project with the Tailwind CSS v4 design system.
- Mobile-number + demo OTP (`123456`) sign-in, the default verification path
  until the project's own OTP API is connected. When Firebase is configured the
  verified number signs in to a stable per-number Email/Password demo account so
  Firestore and Storage enforce the UID rules; an existing anonymous account is
  linked to that credential instead of being replaced. The Firebase phone-SMS
  code path stays in `src/services/auth.ts` for the OTP API integration.
  Protected routes redirect back to the requested screen. A signed-in banner
  shows the Firebase error code and a retry action when that session cannot be
  created, and onboarding submission stays blocked until it succeeds.
- Five-step onboarding wizard (personal, KYC + bank, vehicle, training, review).
  Draft progress is saved to `localStorage`; submission uploads files to Storage
  and writes partner records to Firestore.
- Dashboard with online/offline availability, daily stats and live request
  preview; delivery requests with countdown, accept/reject; active delivery with
  timeline, route preview, status actions and issue reporting.
- Live delivery flow with `delivery_admin`: assigned offers arrive through a
  Firestore `onSnapshot` listener, acceptance runs in a transaction, every
  lifecycle step writes to the shared `deliveries/{id}` document, and the
  partner's GPS position is published to it while a job is active. The
  active-delivery screen uses an interactive Leaflet + OpenStreetMap map with
  pickup, drop and partner markers plus OSRM route geometry.
- Searchable history, earnings with period tabs/chart/payouts, notifications with
  read state, support FAQs and tickets, profile with documents and sign-out.
- English, Hindi and Bengali interface with immediate switching from Profile →
  App language. The choice persists in `localStorage`, covers every screen and
  shared component, and switches date, time and currency formatting to the
  matching locale.
- Realistic mock data for earnings, notifications and support; Firebase data
  for the authenticated partner, submitted onboarding, and live deliveries.

**Remaining: earnings, notification and support integration (Phase 12) and
Phase 13 (release QA).** Both need the open decisions in README to be answered.
Distance and ETA still come from the console's service-area estimates, and
closed-app push notifications still need Firebase Cloud Messaging plus a
Cloud Function.

---

## 3. Technology stack

| Technology | Purpose |
| --- | --- |
| React 19 | UI and reusable screens |
| TypeScript | Typed data, props and domain models |
| Vite 8 | Dev server and production build |
| Tailwind CSS v4 | Styling through design tokens (`@theme`) |
| React Router v7 | Client-side routing and navigation state |
| Firebase JS SDK | Auth, Firestore and Storage foundation |
| Leaflet + React Leaflet | Interactive OpenStreetMap delivery map |
| Lucide React | Icon set |
| Oxlint | Linting |

**Only the libraries listed above are installed.** Do not add a dependency unless
the task needs it. Firebase is connected for the demo-OTP auth bridge,
onboarding persistence and the live delivery flow through `src/services/`;
earnings, notification and support screens keep using mock data until their
service layer is connected (see section 15).

---

## 4. Commands

```bash
npm install        # install dependencies
npm run dev        # start the Vite dev server
npm run typecheck  # TypeScript project build check (no emit)
npm run lint       # Oxlint
npm run build      # typecheck + production build
npm run preview    # preview the production build
```

Run `npm run typecheck` and `npm run lint` after any code change. Run
`npm run build` before handing work back when routing or configuration changed.

---

## 5. Folder structure

```
delivery_app/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/        # Button, Input, Card, Toggle, Tabs, StatCard, ...
│   │   ├── deliveries/    # Request card, timeline, route preview
│   │   └── layout/        # AppLayout, AuthLayout, BottomNavigation, headers
│   ├── context/           # Language, auth and app state (provider + hook files)
│   ├── firebase/          # Config and singleton auth, Firestore and Storage
│   ├── hooks/             # Shared hooks (useCountdown)
│   ├── i18n/              # English keys, Hindi/Bengali maps, locale map
│   ├── mock/              # Mock data and demo OTP, separated from UI
│   ├── modules/           # One folder per product module
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── home/
│   │   ├── deliveries/
│   │   ├── history/
│   │   ├── earnings/
│   │   ├── notifications/
│   │   ├── support/
│   │   └── profile/
│   ├── routes/            # Route tree, guards, navigation config, 404
│   ├── styles/theme.css   # Design tokens (@theme)
│   ├── types/             # Shared TypeScript domain types
│   ├── utils/             # Pure helpers (cn, date, format, delivery)
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── AGENTS.md
├── README.md
├── index.html
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

Rules:

- Feature screens live in `src/modules/<module>/`. Feature-only components may be
  added inside that module folder.
- Anything reused by two or more modules belongs in `src/components/common/`.
- Never place mock data inline inside a UI component; put it in `src/mock/`.
- New shared domain types go in `src/types/`.
- Do not create empty folders or speculative files "for later".

Integration phases add `src/services/` (the only Firebase/data layer) and
`src/firebase/` (SDK setup). Keep screens free of data-access code.

---

## 6. Design system

### Colour palette

| Token | Value | Utility examples | Use |
| --- | --- | --- | --- |
| `--color-brand-deep` | `#5123A5` | `bg-brand-deep`, `text-brand-deep` | Deep purple, headings on light purple |
| `--color-brand` | `#713CE0` | `bg-brand`, `text-brand` | Primary actions, active states |
| `--color-brand-hover` | `#6231CF` | `hover:bg-brand-hover` | Primary button hover |
| `--color-brand-soft` | `#EEE7FF` | `bg-brand-soft` | Icon tiles, chips, subtle fills |
| `--color-brand-tint` | `#F6F2FF` | `bg-brand-tint` | Hover surfaces |
| `--color-surface` | `#FFFFFF` | `bg-surface` | Cards, sheets, inputs |
| `--color-canvas` | `#F8F7FC` | `bg-canvas` | App background |
| `--color-line` | `#ECE8F6` | `border-line` | Borders and dividers |
| `--color-ink` | `#1B1430` | `text-ink` | Primary text |
| `--color-ink-muted` | `#6E6789` | `text-ink-muted` | Secondary text |
| `--color-ink-soft` | `#9A93AE` | `text-ink-soft` | Placeholders, inactive icons |
| `--color-success` | `#12A150` | `text-success` | Delivered / online |
| `--color-warning` | `#E08A00` | `text-warning` | Pending / countdown |
| `--color-danger` | `#E0413E` | `text-danger` | Errors, cancellation |

Status colours also have `-soft` backgrounds: `bg-success-soft`,
`bg-warning-soft`, `bg-danger-soft`, `bg-info-soft`.

### Typography

- Font family: **Plus Jakarta Sans**, loaded in `index.html` with a system fallback.
- Headings: bold, tight tracking (`font-bold tracking-tight`).
- Screen title: `text-[19px]`; hero greeting: `text-[22px]`.
- Section title: `text-[15px]`; body: `text-[13px]`; captions: `text-[12px]` or
  `text-[11.5px]`; navigation label: `text-[10.5px]`.
- Text is never smaller than 10.5px. Prefer `text-ink-muted` for descriptions.

### Shape and elevation

- Cards: `rounded-card` (1rem), `border border-line`, no coloured shadow.
- Icon tiles: `rounded-lg`; buttons: `rounded-lg`/`rounded-xl`; badges: `rounded-full`.
- Headers use solid `bg-brand-deep`. No hue gradients, glows or decorative blobs.
- Touch targets: at least 40px; primary controls use `h-11` / `size-11`.
- Transitions: `transition-colors`/`transition-[transform,background-color,…]`
  for state changes. Motion is short, functional and purposeful — route settle,
  overlay slide-up, offer alert, value pop and the online pulse — and every
  effect is disabled under `prefers-reduced-motion`. No hover lift, glow,
  parallax or decorative loops.

### Shared components (`src/components/common/`)

| Component | Notes |
| --- | --- |
| `Button` | `primary`, `secondary`, `outline`, `ghost`, `danger`; `sm`/`md`/`lg`; `isLoading`, `leftIcon`, `rightIcon`, `fullWidth` |
| `IconButton` | Requires `label` for accessibility; `surface`/`soft`/`ghost`/`onBrand` |
| `IconTile` | Decorative icon tile used by cards, lists and empty states; `sm`/`md`/`lg` sizes and `brand`/`success`/`warning`/`danger`/`neutral` tones |
| `Card` | `padding` (`none`/`sm`/`md`/`lg`), `interactive` hover lift, quiet `shadow-card` elevation |
| `Badge` | Tones `neutral`, `brand`, `success`, `warning`, `danger`, `info` |
| `Avatar` | Initials fallback when no image is available |
| `Input` | Label, `hint`, `error`, left/right icon, `useId` wiring |
| `Select` | Same field styling with native `<select>` for accessibility |
| `ProgressBar` | Clamped, ARIA-complete progress indicator |
| `SectionHeading` | Section title with optional subtitle and action |
| `EmptyState` | Icon, title, description and optional action |

Layout components: `AppLayout`, `BottomNavigation`, `ScreenHeader`,
`ModulePlaceholder`. `AppLayout` owns the vertical scroll area
(`main.app-scrollbar`) so the slim scrollbar sits on the app column, not the
browser edge; route changes reset it to the top. Auth screens use the same
scrollbar treatment.

**Do not duplicate these primitives inside a screen.** If a variant is missing,
extend the shared component with a typed prop instead of copying its classes.

---

## 7. Component development rules

- One component per file, named exports (`export function Button`), `PascalCase`
  filenames. `App.tsx` keeps its default export.
- Keep components presentational; data and mock state are passed in as props.
- Prefer composition over prop explosions. Add a prop only when it is used.
- Every interactive element needs an accessible name; icon-only buttons use
  `IconButton` with a `label`. Use `aria-hidden="true"` on decorative icons.
- Use semantic elements: `<button>` for actions, `<a>`/`Link` for navigation,
  `<nav>`, `<header>`, `<main>`.
- Do not add global CSS. All styling is Tailwind utilities plus the tokens in
  `src/styles/theme.css`.
- Never hard-code brand hex values in components; use token utilities.
- Keep screens scroll-safe: content lives above the sticky bottom navigation, so
  pages end with bottom padding (`pb-6`/`pb-8`).

---

## 8. TypeScript conventions

- `strict` is enabled through the Vite TypeScript config. No `any`; prefer
  `unknown` plus narrowing when a type is genuinely unknown.
- `verbatimModuleSyntax` is on: type-only imports must use `import type`.
- `erasableSyntaxOnly` is on: no `enum`, no parameter properties. Use union
  types and `Record<...>` maps instead.
- `noUnusedLocals` / `noUnusedParameters` are on; remove unused imports.
- Export an `interface` for every component's props and extend the relevant
  HTML attribute interface (`ButtonHTMLAttributes`, `InputHTMLAttributes`, ...).
- Keep domain models in `src/types/` and reuse them across modules.
- Type all mock arrays explicitly so later Firestore data must match the shape.

---

## 9. Mock data guidelines

- All mock data lives in `src/mock/`, never in components.
- Mock records must look realistic: Indian names, Kolkata locations, INR
  amounts, plausible distances/timings, `#DEL####` delivery IDs.
- Mock data must match the planned Firestore shape (see the project roadmap)
  so replacing it later does not change component props.
- Export `const` values or small helper functions; no random values at render
  time, so screens stay deterministic.
- When a module moves to Firebase, delete only the mock module it replaces and
  note it in the change summary.
- Never present mock numbers as real earnings in shipped builds — label demo
  data where it could be mistaken for live data.

---

## 10. Responsive design requirements

- Mobile-first. The primary design viewport is **390 × 844 px**; verify new
  screens at 390px width first.
- The app shell is a centered column: `max-w-[430px]`, full height, on the
  neutral canvas with hairline side borders on large screens. Do not stretch
  screens into a desktop dashboard.
- Breakpoints may adjust spacing or allow two-column grids, but the app must keep
  its phone-like proportions.
- Respect safe areas: the bottom navigation already accounts for
  `env(safe-area-inset-bottom)`.
- No horizontal scrolling at any width from 320px up.
- Test at 320, 390, 430, 768 and 1280px widths before finishing a responsive task.
- All screens must remain usable with the on-screen keyboard open (avoid fixed
  elements that cover focused inputs).

---

## 11. Git and commit conventions

- Conventional Commits style: `feat:`, `fix:`, `docs:`, `refactor:`, `style:`,
  `test:`, `chore:` — short imperative subject, e.g.
  `feat(onboarding): add personal details form`.
- Scope is optional but encouraged for module-level changes.
- **Never commit, amend, rebase, push or tag unless the user explicitly asks.**
  The project owner manages commits manually.
- Do not add AI attribution to commits: no `Co-Authored-By` trailers, no
  "generated with" footers and no tool mentions in commit messages.
- Never commit `node_modules/`, `dist/`, `.env*` or editor files.
- Keep commits focused: one logical change per commit, no unrelated formatting.

---

## 12. Testing requirements

There is no test runner yet; do not add one without being asked. Verification is:

1. `npm run typecheck` — must pass with no errors.
2. `npm run lint` — must pass with no new warnings.
3. `npm run build` — required when routing, config or build setup changed.
4. Manual check in the browser at 390px width: navigate every affected route,
   confirm the bottom navigation highlights correctly, no console errors, no
   layout overflow, and interactions respond.

When a test runner is added, unit-test utilities and data transformations, and
component-test the shared primitives. Do not weaken assertions or disable
lint/type rules to make a check pass.

---

## 13. Current development scope

Allowed now:

- Improving any existing screen, the design system, layout and navigation.
- Fixing bugs in the Firebase auth/onboarding flows or the remaining mock flows.
- The demo-OTP authentication bridge, onboarding persistence and Security Rules.
- The live delivery flow with `delivery_admin`: the shared `deliveries`
  collection, transactional acceptance, lifecycle writes and GPS position
  sharing, using the contract documented in README section 12.

Not allowed without explicit instruction:

- Connecting earnings, notifications, support or profile fixtures to live
  Firebase data (the remaining part of Phase 12).
- Real delivery/payment APIs, backend logic or new network services.
- Replacing OpenStreetMap tiles or the OSRM-compatible routing provider with a
  paid service (both are environment-configurable already).
- Changing the colour palette or design language.
- Removing or rewriting working screens.
- Adding dependencies, test runners or CI.
- Building admin/platform-integration features beyond the approved auth,
  onboarding and delivery scope.
- Implementing the remaining PicDrop delivery requirements before the owner has
  answered the open decisions from the analysis.

The PicDrop delivery analysis is complete. Every implementation change must stay
within the approved scope, and `README.md` and this file must be updated in the
same change whenever behaviour, structure or scope moves.

---

## 14. Working agreement for AI agents

Before changing code:

1. Read this file and the files you are about to modify.
2. Understand the existing structure; reuse shared components and types.
3. Make the smallest change that completes the assigned task.
4. Do not rewrite files that do not need changes, and never remove working
   features without permission.
5. Verify with the commands in section 12.
6. In your final message, list **every file created, modified or deleted**, say
   what changed and why, note any checks that could not be run, and mention any
   remaining setup work or open decisions.
7. Keep `README.md` and this file current: when a change alters behaviour,
   structure, commands or scope, update the relevant markdown in the same change
   instead of leaving it for later.

If a requirement conflicts with this document, ask before proceeding.

---

## 15. Firebase integration rules

Firebase is connected for the demo-OTP auth bridge, onboarding persistence and
the live delivery flow. The remaining product modules stay mock-driven until
their service layer is added:

- Keep data access out of components: use `src/services/` as the only layer that
  talks to Firebase, and `src/context/` for shared auth/app state.
- Initialize Firebase once in `src/firebase/index.ts` and import `auth`, `db` and
  `storage` from `src/firebase`. Never import the Firebase SDK directly inside a
  page or component.
- Firestore models must follow the roadmap collections: `partners`,
  `partner_documents`, `vehicles`, `training`, `training_progress`,
  `deliveries`, `delivery_types`, `earnings`, `payments`, `notifications`,
  `support_tickets`, `admin_users`. The `deliveries` contract (offer fields,
  status values, partner-owned fields) is documented in README section 12 and
  enforced by `firestore.rules`; keep both in sync with
  `src/services/deliveryRequests.ts`.
- Store file metadata and storage paths, not file contents, in Firestore.
- Keep configuration in environment variables (`VITE_FIREBASE_*`, plus
  `VITE_MAP_TILE_URL` and `VITE_ROUTE_API_BASE` for the map providers) with the
  tracked `.env.example` template. Never commit secrets, service accounts or API
  keys; `.env` and every other `.env.*` file stay ignored. `VITE_*` values are
  embedded in the browser bundle, so only public Firebase Web App configuration
  belongs there; service-account credentials and private keys must stay
  server-side.
- Authenticate, then restrict reads/writes with Firebase Security Rules so a
  partner can only access their own records; trusted state changes belong in
  Cloud Functions.
- Authentication changes must keep protected routes and session handling
  consistent with the roadmap (logout, expired OTP errors, account status
  gating).
- Keep the frontend usable with mocks if configuration is missing, so demos and
  reviews never depend on live credentials. Live accounts never receive mock
  deliveries: mock data stays behind the `remoteEnabled` check in
  `AppProvider`.

---

## 16. Current implementation state and handoff

> Last updated: 20 November 2026. Read this section before starting work; it
> records what is built, what is intentionally missing, and what an agent
> picking up the project should do next.

### What is implemented

- **Auth** — mobile number + demo OTP (`123456`), the default verification path
  until the project's own OTP API is connected. When Firebase is configured the
  verified number signs in to a stable per-number Email/Password demo account, so
  Firestore and Storage enforce the UID rules. The demo user's display name is
  set to the verified number and `partners/{uid}` is written at sign-in, so the
  number is visible in the Firebase console before onboarding is submitted. An
  older anonymous device account is linked to the stable credential on its next
  sign-in, preserving its UID and records. Re-entering a number resumes the same
  UID and submitted application after sign-out, a number switch, a browser
  restart, cleared browser data or on another device; a new number creates its
  own account. If the Email/Password provider is disabled, the bridge falls back
  to an anonymous session. If no Firebase session can be created, the app falls
  back to the local demo session, shows a **Firebase is not connected** banner
  with the Firebase error code and a retry action on every signed-in screen, and
  refuses to record a local-only onboarding submission. A demo fallback while
  Firebase is configured is treated as unverified and starts in the wizard, so a
  stale locally approved state cannot reach the dashboard. A fresh tab or app
  launch restores a remembered Firebase session only when Firestore confirms a
  submitted or reviewed application; a sign-in-only or draft account starts at
  the login screen. Reloading the running tab keeps the session, returns to
  Home, and restores online/offline presence from `partners/{uid}`; a submitted
  device-only demo session also restores on a fresh launch. App sign-out clears
  the UI session but keeps the device's Firebase account for demo continuity.
  Protected routes return to the requested screen. This demo identity is not
  production authentication; the retained phone-SMS path replaces it when the
  OTP API is connected.
- **Firebase integration** — `src/firebase/` reads `VITE_FIREBASE_*` and exports
  `auth`, `db` and `storage`. `src/services/auth.ts` verifies the demo OTP,
  maintains the stable per-number demo account, links an existing anonymous
  account and owns the retained phone-SMS functions; `src/services/partner.ts`
  records the sign-in number in Firestore and can recover it from the account
  document, and `src/services/partnerOnboarding.ts` handles Storage uploads and
  the Firestore partner, document, vehicle and training records. The partner
  document is fetched from the server before an application is treated as
  missing, and sign-in-only snapshots cannot downgrade a submitted state. If
  Firestore has no application for a new stable UID, a submitted or fully
  completed local application for the same number is restored. Submission
  failures surface the Firebase error code next to the error message.
  delivery_admin lists a sign-in-only `partners/{uid}` as **KYC pending** with
  approval disabled until onboarding is submitted, and refreshes synced partner
  records every 60 seconds and on window focus. Delivery, earnings, notification
  and support data remain mock.
- **Onboarding** — five design-aligned steps (Personal, KYC + bank, Vehicle,
  Training, Review) with a purple stepper header. The current test build is
  text-only: `src/config/media.ts` hides the profile-photo and document upload
  controls, and KYC cards collect Aadhaar, PAN, licence, RC and bank numbers for
  manual review. Vehicle tiles (bike, scooter, bicycle, on foot), licence and
  registration fields are shared with the vehicle step. Draft progress is
  stored under `fafo.partner.onboarding.<phone>`, one draft per verified number.
  All required text fields are validated. Submission writes `partners`,
  `partner_documents`, `vehicles` and `training_progress` documents in
  Firestore. The upload code remains for when Storage is provisioned; set
  `mediaUploadsEnabled` to `true` only after re-testing uploads. Draft partners
  are redirected back to the wizard until they submit; the wizard header offers
  Sign out. The wizard hides the bottom navigation while a draft is being
  completed; the submitted confirmation
  renders inside the shell.
- **Application status** — Profile → Application status shows pending,
  submitted, under review, approved or rejected, with submitted and updated
  dates and a four-step tracker. The submitted state comes from Firestore; the
  labelled demo control for review outcomes appears only when Firebase is not
  configured because no verification service exists.
- **Dashboard** — light header, availability switch, three headline stats, six
  quick actions and a request preview. Requests only appear when online. The
  application-status card is shown only until approval. For live sessions the
  stats are computed from real deliveries completed today (rating shows "New"
  until a rating source exists); the offline prototype keeps its labelled demo
  figures. Demo fixtures never seed a live account: support tickets and payout
  datasets stay empty until real records exist, while live earnings are derived
  from completed deliveries. The `src/mock/partner.ts` fixture was removed —
  Profile and Home render the onboarding record and the Firebase session.
- **Orders** — Available / Active / Completed tabs. Available requests are gated
  behind availability and the empty state offers a "Go online" action. Offers
  past their `expiresAt` are removed on a one-second clock, and Accept/Reject is
  disabled while another delivery is active.
- **Live delivery flow** — offers assigned in `delivery_admin` are written to
  `deliveries/{deliveryId}` over the Firestore REST API (assignment
  write-through, built from the console's audit events) and arrive in the
  partner app through `subscribePartnerDeliveries` (`onSnapshot`, filtered to
  the signed-in UID). Acceptance, rejection, every lifecycle step, OTP
  completion and cancellation each run in a Firestore transaction in
  `src/services/deliveryRequests.ts`, so duplicate acceptance is impossible and
  retries are idempotent. Offer expiry, reassignment and cancellation surface
  as actionable errors and refresh from the listener. Live accounts derive
  requests, the active delivery and history entirely from Firestore; mock
  deliveries stay behind the demo-session check in `AppProvider`.
- **Active delivery** — accepted → pickup arrived → picked up → on the way → drop
  arrived → delivered, with per-stage primary actions, an interactive
  Leaflet/OpenStreetMap map in a **Current location** section (pickup, drop and
  live partner markers, OSRM route line, follow-my-location control that fits
  once per delivery), external
  turn-by-turn navigation per leg, customer contact, issue reporting, a live
  location-sharing status chip (with the last successful GPS update time), and
  OTP completion against the `dropOtp` the console issued. Development builds
  also accept the test-only delivery code `4821` (configurable with
  `VITE_DEMO_DELIVERY_OTP`); production builds disable it unless the variable is
  set explicitly, and the administrator code remains the primary check.
  Completion can also carry a text recipient name, a short handover note and the
  last GPS fix in `proof`; no media storage is required. Completed and cancelled
  jobs move to history.
- **GPS tracking** — `usePartnerTracking` wraps `watchPosition` while a
  delivery is active and publishes throttled fixes (≥25 m movement or one
  minute, accuracy ≤150 m) to `currentLocation` on the delivery document.
  Permission denial, GPS loss, background tabs and unsupported devices are
  shown honestly; the watcher is cleared on completion, cancellation and
  unmount. A Screen Wake Lock is requested while a delivery is active where the
  browser supports it; this is not background tracking. Separately,
  `partners/{uid}` keeps `isOnline` and `availability`
  (`Available` / `On Delivery` / `Offline`) in step: presence publishes
  immediately when the switch changes, even when geolocation is denied or
  unavailable, and `lastLocation` / `lastLocationUpdatedAt` update as fixes
  arrive. Availability flips immediately when a delivery starts or ends.
- **Notifications** — live listeners turn real events into in-app
  notifications: new assigned offers, deliveries the Administrator cancels,
  offers that expire or get reassigned, and account decisions (approved or
  suspended). A new offer also opens a global Accept/Reject overlay on every
  screen, plays a generated chime and vibrates where supported; notification
  rows deep-link to Orders, Profile or Earnings. Live notifications are
  persisted as text in `notifications/{uid_eventId}`, so the list and read state
  survive a reload; the Profile alert preference mutes sound/browser alerts but
  not the visual card. The first snapshot after load is a baseline, so reloads
  never replay events. When the tab is backgrounded and permission is granted,
  a system notification is shown; closed-app push needs FCM plus a Cloud
  Function and is not built.
- **History, earnings, notifications, support, profile** — searchable history,
  read/unread notifications, FAQ + ticket creation, and profile with documents,
  language, alerts and sign-out. A declined offer stays `assigned` on the shared
  document so the console can reassign it, but the partner's history treats it
  as a cancellation: a red **Cancelled by you** badge, the decline reason and ₹0
  earned, grouped under the Cancelled filter and excluded from delivered counts
  and earnings. Support tickets are read from and written to
  `support_tickets`, so they survive a refresh; reporting a delivery issue also
  creates a ticket for operations. The Earnings screen calculates live
  today/week/month totals, chart buckets, average and recent jobs from completed
  deliveries in `history`, so it matches the dashboard. Month bars use the
  calendar buckets 1–6, 7–12, 13–18, 19–24 and 25–end; hovering a bar shows its
  amount and clicking it opens that range's statement list. Payouts and
  incentives remain labelled demo/empty until settlement is connected. Every
  section header has a back control with an explicit fallback; Home is the root
  and has none.
- **Language** — Profile → App language switches every screen, shared component,
  validation message and mock notification/FAQ string immediately between
  English, Hindi and Bengali. The selection persists under
  `fafo.partner.language`; dates, times and amounts use the matching `en-IN`,
  `hi-IN` or `bn-IN` locale. User-entered content, names, addresses, IDs and
  delivery data are not translated.
- **Appearance** — the moon/sun button in the Home header’s top-right corner
  switches the whole app between the light and dark token palettes. The choice
  persists under `fafo.partner.theme` and `index.html` applies it before the first
  paint. Brand headers stay deep purple; surfaces, text, borders, status tones
  and map controls have dark variants.

### Intentionally missing (do not fake these)

- No live earnings, notification, support or payment data. Firebase is
  connected for auth, onboarding and the delivery flow only; there are no push
  notifications or payments.
- No seller, buyer, fleet, admin or HopNgo passenger surface. Those belong to
  other PicDrop + HopNgo modules and are out of scope here.
- Document uploads use Firebase Storage when configured; on submit, Firestore
  stores metadata and paths, not file contents. There is no document-level
  review workflow. Files over 2 MB are rejected before the name is recorded.
- Earnings, payouts, ratings and dashboard totals are demo constants, labelled
  as demo where they could be mistaken for live data.
- Distance and ETA on console-assigned deliveries are service-area estimates
  from the console, not routing-engine figures. The public OpenStreetMap tile
  servers and the OSRM demo server are defaults, not SLA-backed services;
  `VITE_MAP_TILE_URL` and `VITE_ROUTE_API_BASE` exist for production services.
- Offers created before the console started issuing `dropOtp` cannot be
  completed — the partner is told to contact operations. There is no demo OTP
  in a live session; the demo code `4821` exists only in the offline prototype.
- Partner location updates stop when the browser tab is backgrounded; there is
  no background tracking. Continuous tracking needs a native/PWA layer.
- Closed-app push notifications need Firebase Cloud Messaging plus a Cloud
  Function that fans out assignment events; only in-app notifications and
  background-tab system alerts exist.
- Onboarding quiz, working shifts, service zones and post-submission editing are
  not built.

### Verification (run before handing work back)

```bash
npm run typecheck   # must pass
npm run lint        # 0 warnings, 0 errors
npm run build       # required when routing/config changes
```

Browser smoke test at 390px and 320px: login → onboarding steps → dashboard
online/offline → accept a request → advance to drop OTP → notifications →
support ticket → profile sign-out. Check for horizontal overflow and console
errors.

### Next recommended work

1. Connect the application-status review flow to a real verification service,
   then add document-level review states and eligibility gating before going
   online.
2. Persist earnings, notifications and support tickets in the planned service
   layer (requests, history and the active delivery are already live).
3. Replace the demo OTP fallback (`4821`) with the backend-issued delivery code
   end to end, and add customer contact details to the console's offer when its
   privacy review permits.
4. Add onboarding editing after submission (currently the submitted screen is
   read-only and the profile button says "View partner details").
5. Design alignment for the remaining screens (history, support, profile).

### Working agreements that still apply

- The project owner reviews and commits changes; do not commit or push unless
  explicitly asked. History already exceeds 30 commits, so keep new commits
  meaningful rather than padding the count.
- Keep `README.md`, this file, `CHANGELOG.md` and the two `docs/PicDrop-*.md`
  files current in the same change as behaviour or scope changes.
- `docs/` and `CHANGELOG.md` may be untracked in the owner's working tree; do
  not delete them.
