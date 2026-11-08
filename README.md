# Fafo Delivery Partner App

A mobile-first web app for delivery partners who handle grocery and restaurant
orders from the existing Fafo platform.

The app is designed as a phone experience: it runs in the browser, looks like a
modern mobile app, and is built for a 390 × 844 px screen. On larger screens it
stays a centered app column instead of stretching into a desktop dashboard.

> **Status:** Phases 1–11 of the partner experience are complete as a fully
> interactive prototype using mock data. Sign-in, onboarding, deliveries,
> earnings, notifications, support and profile all work in the browser.
> Firebase, a real map provider and the existing-platform integration
> (Phases 12–13) are not connected yet.
>
> The product direction is now **PicDrop + HopNgo**, and this repository is its
> **delivery-partner module**. The PicDrop delivery requirements have been
> analysed; implementation is waiting on the owner's decisions from that
> analysis. Fafo remains the working name of the current prototype.

---

## 1. What this project is

Fafo Delivery Partner App is the **delivery partner side** of an existing
platform that already manages grocery shops and restaurants.

This repository does **not** replace the existing platform and does not include a
customer app, a shop app, a restaurant app or a parcel app. It only gives delivery
partners the screens they need to work:

- sign in with a mobile number and OTP,
- complete onboarding with KYC, vehicle and bank details,
- go online and receive delivery requests,
- manage a delivery from acceptance to completion,
- review history, earnings, notifications and support.

### Source-of-truth references

Delivery behaviour is specified by the PicDrop requirement documents kept in
`docs/`:

- `docs/PicDrop-1-Feature-Scope.md` — feature inventory, operating rules and the
  proposed release boundary.
- `docs/PicDrop-2-Requirements-Notes.md` — workflows, assignment and capacity
  rules, pricing, subsidies and financial separation.
- The latest PicDrop + HopNgo design image supplied by the project owner is the
  visual reference.

Those documents take precedence over older roadmaps, phase plans and design
references. This README describes how the current prototype was built and is
historical where it conflicts with them. The reference files are working
material for the project and are not part of the deployed application.

## 2. Project objectives

- Make registration and onboarding simple and easy to follow.
- Show available and active deliveries clearly, with distance, time and earnings.
- Let partners update delivery status step by step during a job.
- Give partners a clear view of their delivery history and earnings.
- Keep the data model flexible for future delivery types, without building them.
- Deliver a polished, app-like experience on any screen size.

## 3. Main features

| Module | What it does | Status |
| --- | --- | --- |
| Authentication | Mobile number + demo OTP, persisted session, protected routes, logout | Built (mock) |
| Onboarding | Five steps matching the design: personal (with required profile photo), KYC and bank, vehicle, training, review | Built (mock) |
| KYC & documents | Aadhaar, PAN, licence and RC uploads with review status | Built (mock) |
| Vehicle information | Bike, scooter, bicycle or on foot; model, colour and registration where applicable | Built (mock) |
| Training & approval | Training checklist and submitted-application status | Built (mock) |
| Application status | Pending, submitted, under review, approved or rejected with a progress timeline | Built (mock) |
| Home dashboard | Light header with avatar and greeting, availability switch, three headline stats, six quick actions and request preview | Built (mock) |
| Delivery requests | Request cards with countdown, accept or reject | Built (mock) |
| Active delivery | Timeline, status actions, drop OTP proof, contact and issue reporting | Built (mock) |
| Map & tracking | Illustrated route preview and distance/ETA | Demo preview |
| History | Search, status filter and delivery-level earnings | Built (mock) |
| Earnings & payments | Today/week/month totals, chart, incentives and payouts | Built (mock) |
| Notifications | Request, account, delivery and payment alerts with read state | Built (mock) |
| Help & support | FAQs, ticket submission and ticket status | Built (mock) |
| Profile & settings | Partner details, documents, language, alerts, application status and sign-out | Built (mock) |

### Demo access

No SMS is sent and no account is created. On the login screen enter any valid
10-digit Indian mobile number (for example `9832979005`), then use the demo code
**`123456`** on the verification screen.

## 4. Technology stack

| Technology | Version | Used for |
| --- | --- | --- |
| [React](https://react.dev/) | 19 | Building the interface |
| [TypeScript](https://www.typescriptlang.org/) | 7 | Types and safer data handling |
| [Vite](https://vite.dev/) | 8 | Development server and production build |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Styling with design tokens |
| [React Router](https://reactrouter.com/) | 7 | Routing, guards and navigation |
| [Lucide React](https://lucide.dev/) | latest | Icons |
| [Oxlint](https://oxc.rs/) | latest | Code linting |

Firebase is **not installed yet**.

## 5. Current development status

All partner-facing screens in the roadmap are implemented and connected to a
shared mock state layer:

- `/login` and `/verify-otp` — mobile number entry, 6-digit OTP with a resend
  timer, expiry handling and clear error messages.
- Protected app shell with Home, Orders, History, Earnings, Profile and a
  404 screen, plus Notifications, Active Delivery, Support and Onboarding, all
  inside the same shell with the bottom navigation.
- Every section header carries a back control (Orders, History, Earnings,
  Profile, Notifications, Support, Active delivery, Onboarding and 404). Home is
  the app root, so it has no back button.
- Session persists across reloads; signing out returns to the login screen.
- Onboarding progress is saved per verified mobile number
  (`fafo.partner.onboarding.<phone>`), so each demo number has its own
  application and a new number starts from a blank draft.
- Draft applications are held inside the onboarding wizard; Home, Orders,
  Earnings and Profile only open once the application is submitted. The demo OTP
  is still `123456` for every number.
- A profile photo is mandatory on the personal step; it must be JPG or PNG and
  within 2 MB, is downscaled locally to a 256px preview, is shown on Home and
  Profile, and blocks progress until added.
- KYC documents accept JPG images or PDFs up to 2 MB each. Larger files are
  rejected inline and are not recorded as uploaded.
- Application status is available from Profile → Application status. It shows
  pending, submitted, under review, approved or rejected with submitted and
  updated dates plus a four-step tracker. A labelled demo control lets testers
  preview each stage; no verification service is connected.
- Accepting a request moves it into an active delivery with a live status
  timeline; the job closes only after the demo drop OTP is verified, and
  completed or cancelled jobs are added to history.
- Available requests are only shown while the partner is online; the Orders
  screen offers a "Go online" action when availability is off.
- Notifications can be read individually or all at once; support tickets can be
  raised and tracked.

**Remaining:** Phase 12 (existing-platform integration, admin functions, Firebase)
and Phase 13 (release QA). Both depend on the open decisions listed at the end.

## 6. Folder structure

```
delivery_app/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/           # Button, IconButton, Card, Badge, Avatar, Input,
│   │   │                     # Select, OtpInput, Toggle, ProgressBar,
│   │   │                     # SegmentedTabs, StatCard, SectionHeading, EmptyState
│   │   ├── deliveries/       # DeliveryRequestCard, DeliveryTimeline, MapPreview
│   │   └── layout/           # AppLayout, AuthLayout, BottomNavigation,
│   │                         # ScreenHeader, ModulePlaceholder
│   ├── context/              # AuthProvider, AppProvider, delivery reducer, hooks
│   ├── hooks/                # useCountdown
│   ├── mock/                 # partner, auth (demo OTP), deliveries, earnings,
│   │                         # notifications, onboarding, support
│   ├── modules/
│   │   ├── auth/             # Login and OTP verification
│   │   ├── onboarding/       # Five-step partner setup
│   │   ├── home/             # Dashboard
│   │   ├── deliveries/       # Requests, active delivery
│   │   ├── history/          # Delivery history
│   │   ├── earnings/         # Earnings and payouts
│   │   ├── notifications/    # Notification list
│   │   ├── support/          # FAQs and tickets
│   │   └── profile/          # Profile and settings
│   ├── routes/               # Route tree, ProtectedRoute, navigation, 404
│   ├── styles/theme.css      # Colour, radius, shadow and font tokens
│   ├── types/                # partner, delivery, earnings, notification,
│   │                         # onboarding, support
│   ├── utils/                # cn, date, format, delivery helpers
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── AGENTS.md                 # Rules for AI coding agents
├── README.md
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## 7. Installation

Requirements: **Node.js 20+** (22+ recommended) and **npm 10+**.

```bash
cd delivery_app
npm install
```

No API keys, database or Firebase project are needed — the app runs on local mock
data. `.env.example` documents the configuration for the planned backend and map
integration; copy it to `.env.local` only when that work starts. `.env` and every
other `.env.*` file stay untracked.

## 8. Run the project locally

```bash
npm run dev
```

Open the printed URL (usually <http://localhost:5173>) and sign in with the demo
access described above. For the intended layout, use a 390 × 844 px viewport in
your browser's device mode.

To check the production build:

```bash
npm run build
npm run preview
```

## 9. Available scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts the Vite development server with hot reload |
| `npm run build` | Type-checks and creates the production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | Runs the TypeScript project check without emitting files |
| `npm run lint` | Runs Oxlint on the project |

## 10. Design system

The design follows the supplied purple-and-white mobile reference.

| Name | Value | Used for |
| --- | --- | --- |
| Deep Purple | `#5123A5` | Brand headers, strong accents |
| Primary Purple | `#713CE0` | Primary buttons, active states |
| Light Purple | `#EEE7FF` | Icon tiles, chips, soft fills |
| White | `#FFFFFF` | Cards and inputs |
| Background | `#F8F7FC` | App background |

Supporting tokens: `#1B1430` (text), `#6E6789` (secondary text), `#12A150`
(success), `#E08A00` (pending), `#E0413E` (danger). All colours live in
`src/styles/theme.css` as Tailwind v4 tokens, so the palette changes in one place.

Visual direction: a dispatch-desk tool — flat ink-and-paper surfaces, one solid
deep-purple accent and route-line details. No hue gradients, glows or decorative
blobs.

Style rules: flat cards (`rounded-card`, 16px) with hairline borders, 40–44px touch
targets, short colour transitions, and a centered `max-w-[430px]` app column on every
size.

## 11. Mock data and app state

No backend is connected. `src/mock/` holds realistic Kolkata-based data for the
partner, delivery requests, completed deliveries, earnings, payouts,
notifications, onboarding defaults and support FAQs.

`src/context/AppProvider.tsx` owns the interactive state behind those screens:
online availability, requests, the active delivery, history, notifications,
support tickets and onboarding progress. `src/context/AuthProvider.tsx` owns the
demo session.

- The session and onboarding progress survive a reload (`localStorage`).
- Delivery and notification changes live in memory and reset on reload.
- Every figure shown on the earnings screen is demo data and labelled as such.

Replacing this layer with Firebase should not change the screens: they read state
from the context hooks (`useApp`, `useAuth`) and render typed models from
`src/types/`. Two exceptions still import fixtures directly — the signed-in
partner (`src/mock/partner.ts`, used by Home and Profile) and the earnings
summary (`src/mock/earnings.ts`, used by Home) — and will move behind the planned
service layer with the backend integration.

## 12. Future Firebase integration plan

1. **Authentication** — replace the demo OTP with Firebase phone auth and keep the
   existing protected-route behaviour.
2. **Firestore** — `partners`, `partner_documents`, `vehicles`, `training`,
   `training_progress`, `deliveries`, `delivery_types`, `earnings`, `payments`,
   `notifications`, `support_tickets`, `admin_users`.
3. **Storage** — profile photos, Aadhaar/PAN images, licence, RC and insurance.
4. **Cloud Functions** — assigning deliveries, validating status transitions and
   calculating earnings.
5. **Cloud Messaging** — request and payment notifications.

Rules: configuration comes from `VITE_FIREBASE_*` environment variables, all data
access lives in a single `src/services/` layer, Security Rules restrict each
partner to their own records, files are stored in Storage with only metadata and
paths in Firestore, and the app must remain demo-able without live credentials.

## 13. Git workflow

- Conventional Commits with short imperative subjects, for example
  `feat(deliveries): add request countdown card`.
- One logical change per commit; do not mix unrelated files.
- Never commit `node_modules/`, `dist/`, `.env` files or editor settings.
- Commits carry no AI attribution or co-author trailers; the project owner owns
  the history.
- Run `npm run typecheck` and `npm run lint` before committing.

## 14. Development roadmap

| Phase | Work | Result |
| --- | --- | --- |
| 1 | Project setup, design system, layout and routing | ✅ App shell |
| 2 | Authentication and protected routes | ✅ Demo sign-in |
| 3 | Onboarding: personal and address details | ✅ Saved progress |
| 4 | KYC documents, vehicle and bank details | ✅ Uploads and review |
| 5 | Training and approval status | ✅ Training checklist |
| 6 | Home dashboard with online/offline control | ✅ Work dashboard |
| 7 | Delivery requests with countdown | ✅ Accept or reject |
| 8 | Active delivery timeline and completion | ✅ End-to-end flow |
| 9 | Maps, location permission and routes | Demo route preview 🟡 |
| 10 | History, earnings and payments | ✅ Mock records |
| 11 | Notifications, support and profile settings | ✅ Complete feature set |
| 12 | Admin and existing-platform integration | ⏳ Pending decisions |
| 13 | Quality checks and release preparation | ⏳ Pending |

## Decisions still open

- The existing platform's technology and how delivery jobs will be exchanged.
- Whether both systems share one Firebase project or talk through APIs.
- How delivery jobs are assigned (automatic, manual, or by the existing platform).
- Which map provider supplies routes, distance and ETA.
- Which documents are mandatory for verification and who approves them.
- How earnings are calculated and when payouts are created.
- Whether an admin panel is part of this project.
- The final delivery format (mobile web app / PWA vs native app).
