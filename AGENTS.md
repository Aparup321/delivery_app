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

**Phases 1–11 — partner app (mock-driven UI): complete.**

What exists today:

- Vite + React 19 + TypeScript project with the Tailwind CSS v4 design system.
- Mobile-number + OTP sign-in (demo code `123456`), persisted session and
  protected routes with redirect back to the requested screen.
- Seven-step onboarding wizard (personal, address, KYC uploads, vehicle, bank,
  training, review) whose progress is saved to `localStorage`.
- Dashboard with online/offline availability, daily stats and live request
  preview; delivery requests with countdown, accept/reject; active delivery with
  timeline, route preview, status actions and issue reporting.
- Searchable history, earnings with period tabs/chart/payouts, notifications with
  read state, support FAQs and tickets, profile with documents and sign-out.
- Realistic mock data for partner, deliveries, earnings, notifications and
  support, all routed through `src/context/` and `src/mock/`.

**Remaining: Phase 12 (backend/platform integration, admin functions) and Phase
13 (release QA).** Both need the open decisions in README to be answered. There
is no Firebase, no real map provider and no backend in this build; earnings and
request timers are demo data.

---

## 3. Technology stack

| Technology | Purpose |
| --- | --- |
| React 19 | UI and reusable screens |
| TypeScript | Typed data, props and domain models |
| Vite 8 | Dev server and production build |
| Tailwind CSS v4 | Styling through design tokens (`@theme`) |
| React Router v7 | Client-side routing and navigation state |
| Lucide React | Icon set |
| Oxlint | Linting |

**No other libraries are installed.** Do not add a dependency unless the task
cannot reasonably be done with what is here. Firebase is **not** installed and
must not be added in the current phase (see section 15).

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
│   ├── context/           # Auth session and app state (provider + hook files)
│   ├── hooks/             # Shared hooks (useCountdown)
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

- Cards: `rounded-card` (1.25rem), `border border-line/80`, `shadow-card`.
- Icon tiles: `rounded-xl`; buttons: `rounded-2xl`; badges: `rounded-full`.
- Headers use `bg-brand-gradient` (the `@utility` defined in `theme.css`).
- Touch targets: at least 40px; primary controls use `h-11` / `size-11`.
- Transitions: `transition-colors` or `transition-all duration-200`. No long or
  bouncy animations.

### Shared components (`src/components/common/`)

| Component | Notes |
| --- | --- |
| `Button` | `primary`, `secondary`, `outline`, `ghost`, `danger`; `sm`/`md`/`lg`; `isLoading`, `leftIcon`, `rightIcon`, `fullWidth` |
| `IconButton` | Requires `label` for accessibility; `surface`/`soft`/`ghost`/`onBrand` |
| `Card` | `padding` (`none`/`sm`/`md`/`lg`), `interactive` hover lift |
| `Badge` | Tones `neutral`, `brand`, `success`, `warning`, `danger`, `info` |
| `Avatar` | Initials fallback when no image is available |
| `Input` | Label, `hint`, `error`, left/right icon, `useId` wiring |
| `Select` | Same field styling with native `<select>` for accessibility |
| `ProgressBar` | Clamped, ARIA-complete progress indicator |
| `SectionHeading` | Section title with optional subtitle and action |
| `EmptyState` | Icon, title, description and optional action |

Layout components: `AppLayout`, `BottomNavigation`, `ScreenHeader`,
`ModulePlaceholder`.

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
- The app shell is a centered column: `max-w-[430px]`, full height, with a purple
  backdrop on large screens. Do not stretch screens into a desktop dashboard.
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
- Fixing bugs in the mock flows (auth, onboarding, deliveries, earnings,
  notifications, support, profile).

Not allowed without explicit instruction:

- Firebase, real APIs, backend logic or new network services.
- Replacing the demo map with a paid provider.
- Changing the colour palette or design language.
- Removing or rewriting working screens.
- Adding dependencies, test runners or CI.
- Building admin/platform-integration features (Phase 12).
- Implementing the PicDrop delivery requirements before the owner has answered
  the open decisions from the analysis.

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

## 15. Future Firebase integration rules

Firebase is a **later phase**. Until then:

- Keep data access out of components: screens receive props from mock modules.
- When integration starts, introduce `src/services/` as the only layer that talks
  to Firebase, and `src/context/` for shared auth/app state.
- Never import the Firebase SDK directly inside a page or component.
- Firestore models must follow the roadmap collections: `partners`,
  `partner_documents`, `vehicles`, `training`, `training_progress`,
  `deliveries`, `delivery_types`, `earnings`, `payments`, `notifications`,
  `support_tickets`, `admin_users`.
- Store file metadata and storage paths, not file contents, in Firestore.
- Keep configuration in environment variables (`VITE_FIREBASE_*`) with the
  tracked `.env.example` template. Never commit secrets, service accounts or API
  keys; `.env` and every other `.env.*` file stay ignored.
- Authenticate, then restrict reads/writes with Firebase Security Rules so a
  partner can only access their own records; trusted state changes belong in
  Cloud Functions.
- Authentication changes must keep protected routes and session handling
  consistent with the roadmap (logout, expired OTP errors, account status
  gating).
- Keep the frontend usable with mocks if configuration is missing, so demos and
  reviews never depend on live credentials.

---

## 16. Current implementation state and handoff

> Last updated: 7 November 2026. Read this section before starting work; it
> records what is built, what is intentionally missing, and what an agent
> picking up the project should do next.

### What is implemented

- **Auth** — mobile number + demo OTP (`123456`), session in `localStorage`
  (`fafo.partner.session`), protected routes that return to the requested screen.
- **Onboarding** — five design-aligned steps (Personal, KYC + bank, Vehicle,
  Training, Review) with a purple stepper header, per-document upload rows,
  vehicle tiles (bike, scooter, bicycle, on foot), a required profile photo and a
  submitted/under-review state. Progress is stored under
  `fafo.partner.onboarding.<phone>`, one draft per verified number, and the demo
  OTP is the same for every number. Draft partners are redirected back to the
  wizard until they submit; the wizard header offers Sign out. The flow renders
  inside the app shell, so the bottom navigation is present on every
  authenticated screen.
- **Dashboard** — light header, availability switch, three headline stats, six
  quick actions and a request preview. Requests only appear when online.
- **Orders** — Available / Active / Completed tabs. Available requests are gated
  behind availability and the empty state offers a "Go online" action.
- **Active delivery** — accepted → pickup arrived → picked up → on the way → drop
  arrived → delivered, with a live timer, route preview, issue reporting and a
  demo drop OTP (`4821`). Completed and cancelled jobs move to history.
- **History, earnings, notifications, support, profile** — searchable history,
  demo earnings, read/unread notifications, FAQ + ticket creation, and profile
  with documents, language, alerts and sign-out. Every section header has a back
  control with an explicit fallback; Home is the root and has none.

### Intentionally missing (do not fake these)

- No backend, Firebase, real map provider, push notifications or payments.
- No seller, buyer, fleet, admin or HopNgo passenger surface. Those belong to
  other PicDrop + HopNgo modules and are out of scope here.
- Document uploads store only the selected file name in local state; no file is
  uploaded and no review workflow exists. Files over 2 MB are rejected before
  the name is recorded.
- Earnings, payouts, ratings and dashboard totals are demo constants, labelled
  as demo where they could be mistaken for live data.
- Onboarding quiz, working shifts and service zones are not built. The profile
  photo is captured (downscaled locally) but not uploaded to storage.

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

1. Verification lifecycle (draft → submitted → under review → approved /
   restricted) with document-level status and eligibility gating.
2. Onboarding editing after submission (currently the submitted screen is
   read-only and the profile button says "View partner details").
3. Persist availability, requests and tickets in the planned service layer when
   the backend phase starts.
4. Design alignment for the remaining screens (login, history, support, profile).

### Working agreements that still apply

- The project owner reviews and commits changes; do not commit or push unless
  explicitly asked. History already exceeds 30 commits, so keep new commits
  meaningful rather than padding the count.
- Keep `README.md`, this file, `CHANGELOG.md` and the two `docs/PicDrop-*.md`
  files current in the same change as behaviour or scope changes.
- `docs/` and `CHANGELOG.md` may be untracked in the owner's working tree; do
  not delete them.
