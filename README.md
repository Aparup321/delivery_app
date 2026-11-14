# Fafo Delivery Partner App

A mobile-first web app for delivery partners who handle grocery and restaurant
orders from the existing Fafo platform.

The app is designed as a phone experience: it runs in the browser, looks like a
modern mobile app, and is built for a 390 × 844 px screen. On larger screens it
stays a centered app column instead of stretching into a desktop dashboard.

> **Status:** Phases 1–11 of the partner experience are complete as an
> interactive prototype. Firebase Phone Authentication and onboarding
> persistence (Firestore + Storage) are connected when `VITE_FIREBASE_*` is
> configured; without configuration the app falls back to the demo OTP.
> Deliveries, earnings, notifications, support, map and payment data remain
> mock. A real map provider and the existing-platform integration (Phases
> 12–13) are not connected yet.
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
| Authentication | Mobile number + demo OTP (`123456`, the default until the OTP API lands), anonymous Firebase session when configured, protected routes with redirect back, logout | Built (Firebase bridge) |
| Onboarding | Five steps matching the design: personal (with required profile photo), KYC and bank, vehicle, training, review | Built (Firebase) |
| KYC & documents | Aadhaar and PAN numbers with upload controls, plus licence, RC and bank passbook uploads; files go to Storage and metadata to Firestore | Built (Firebase) |
| Vehicle information | Bike, scooter, bicycle or on foot; model, colour, licence and registration where applicable | Built (Firebase) |
| Training & approval | Training checklist and submitted-application status | Built (Firebase) |
| Application status | Pending, submitted, under review, approved or rejected with a progress timeline; submitted state comes from Firestore, review outcomes are demo | Built (Firebase + demo review) |
| Home dashboard | Light header with avatar and greeting, availability switch, three headline stats, six quick actions and request preview | Built (mock) |
| Delivery requests | Request cards with countdown, accept or reject | Built (mock) |
| Active delivery | Timeline, status actions, drop OTP proof, contact and issue reporting | Built (mock) |
| Map & tracking | Illustrated route preview and distance/ETA | Demo preview |
| History | Search, status filter and delivery-level earnings | Built (mock) |
| Earnings & payments | Today/week/month totals, chart, incentives and payouts | Built (mock) |
| Notifications | Request, account, delivery and payment alerts with read state | Built (mock) |
| Help & support | FAQs, ticket submission and ticket status | Built (mock) |
| Profile & settings | Partner details, documents, English/Hindi/Bengali language switching, alerts, application status and sign-out | Built (mock) |

### Demo access

The demo OTP is the default verification path for now: enter any valid 10-digit
Indian mobile number (for example `9832979005`) and use the code **`123456`**.
No SMS is sent; the project's own OTP API will replace this step later.

When `VITE_FIREBASE_*` is configured, accepting the demo code also signs the
partner in with an **anonymous Firebase session**, so the app talks to Firebase
under the UID-based Security Rules instead of staying fully local. If that
session cannot be created, the app falls back to a local demo session and shows
a **Firebase is not connected** banner on every signed-in screen with the
Firebase error code and a **Retry connection** action. Onboarding submission is
blocked in that state, so a local draft is never presented as a Firebase
submission.

The Firebase phone-SMS code path (`sendPhoneOtp` / `confirmPhoneOtp`) stays in
`src/services/auth.ts` for when the OTP API integration begins.

## 4. Technology stack

| Technology | Version | Used for |
| --- | --- | --- |
| [React](https://react.dev/) | 19 | Building the interface |
| [TypeScript](https://www.typescriptlang.org/) | 7 | Types and safer data handling |
| [Vite](https://vite.dev/) | 8 | Development server and production build |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Styling with design tokens |
| [React Router](https://reactrouter.com/) | 7 | Routing, guards and navigation |
| [Firebase](https://firebase.google.com/docs/web/setup) | 13 | Auth, Firestore and Storage SDK foundation |
| [Lucide React](https://lucide.dev/) | latest | Icons |
| [Oxlint](https://oxc.rs/) | latest | Code linting |

Firebase provides the demo-OTP auth bridge plus Firestore and Storage
persistence for partner onboarding. The delivery, earnings, notification and
support data still come from `src/mock/`.

## 5. Current development status

All partner-facing screens in the roadmap are implemented and connected to a
shared mock state layer:

- `/login` and `/verify-otp` — mobile number entry, demo OTP verification with a
  resend timer and clear error messages. When Firebase is configured, the
  verified number signs in with an anonymous Firebase session.
- Protected app shell with Home, Orders, History, Earnings, Profile and a
  404 screen, plus Notifications, Active Delivery, Support and Onboarding, all
  inside the same shell with the bottom navigation.
- Every section header carries a back control (Orders, History, Earnings,
  Profile, Notifications, Support, Active delivery, Onboarding and 404). Home is
  the app root, so it has no back button.
- Firebase restores the session across reloads; signing out returns to the
  login screen.
- Onboarding drafts are saved per verified mobile number under
  `fafo.partner.onboarding.<phone>`. Submitting uploads selected files to
  Storage and saves partner, document, vehicle and training records to
  Firestore; signing in again reloads the submitted application from Firestore.
- Draft applications are held inside the onboarding wizard; Home, Orders,
  Earnings and Profile only open once the application is submitted. The bottom
  navigation is hidden while the draft form is open.
- A profile photo is mandatory on the personal step; it must be JPG or PNG and
  within 2 MB, is downscaled locally to a 256px preview, is shown on Home and
  Profile, and is uploaded to Firebase Storage on submission.
- KYC collects the Aadhaar and PAN numbers beside their upload controls and
  provides upload-only cards for the driving licence and vehicle RC, with
  JPG/PDF and 2 MB guidance. For bike and scooter partners, the licence and
  registration numbers are entered on the vehicle step; bicycle and on-foot
  partners are not asked for either. The bank account row also offers an optional
  bank passbook or cancelled-cheque upload. All files accept JPG or PDF up to
  2 MB; larger files are rejected inline and are not recorded as uploaded.
- Application status is available from Profile → Application status. It shows
  pending, submitted, under review, approved or rejected with submitted and
  updated dates plus a four-step tracker. The submitted state is read from
  Firestore; the labelled demo control is shown only when Firebase is not
  configured because no verification service is connected.
- Accepting a request moves it into an active delivery with a live status
  timeline; the job closes only after the demo drop OTP is verified, and
  completed or cancelled jobs are added to history.
- Available requests are only shown while the partner is online; the Orders
  screen offers a "Go online" action when availability is off.
- Notifications can be read individually or all at once; support tickets can be
  raised and tracked.
- Profile → App language switches the whole interface immediately between
  English, Hindi and Bengali. The choice is saved in `localStorage`, every screen,
  shared component, validation message and the mock notification/FAQ copy uses
  the selected language, and dates, times and rupee amounts follow the matching
  `en-IN`, `hi-IN` or `bn-IN` locale.

**Remaining:** the rest of Phase 12 (delivery, earnings, notification, support
and admin integration) and Phase 13 (release QA). Both depend on the open
decisions listed at the end.

## 6. Folder structure

```
delivery_app/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/           # Button, IconButton, Card, Badge, Avatar, Input,
│   │   │                     # Select, OtpInput, Toggle, ProgressBar,
│   │   │                     # SegmentedTabs, StatCard, SectionHeading, EmptyState,
│   │   │                     # IconTile
│   │   ├── deliveries/       # DeliveryRequestCard, DeliveryTimeline, MapPreview
│   │   └── layout/           # AppLayout, AuthLayout, BottomNavigation,
│   │                         # ScreenHeader, ModulePlaceholder
│   ├── context/              # LanguageProvider, AuthProvider, AppProvider, hooks
│   ├── firebase/             # SDK config plus auth, db and storage exports
│   ├── services/             # Auth bridge and onboarding persistence
│   ├── hooks/                # useCountdown
│   ├── i18n/                 # English keys and Hindi/Bengali translations
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
├── firebase.json             # Firestore and Storage rules deployment config
├── firestore.rules           # Owner-only partner records
├── storage.rules             # Owner-only uploads, 2 MB and image/PDF limits
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

The app falls back to the demo OTP when Firebase is not configured, so UI work
still runs without a live project. To use Firebase Phone Auth and onboarding
persistence, create `.env.local` from `.env.example`, fill in the six
`VITE_FIREBASE_*` values from Firebase Console, enable Phone sign-in, Firestore
and Storage, and deploy the rules in this repository. `.env` and every other
`.env.*` file, including `.env.local`, stay untracked.

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

Style rules: flat cards (`rounded-card`, 16px) with hairline borders and a
one-pixel neutral shadow, 40–44px touch targets, short colour transitions, and a
centered `max-w-[430px]` app column on every size. The app column owns its
vertical scrolling, with a 6px brand-tinted scrollbar on its right edge; auth
screens use the same treatment and pull their card over the brand header.

## 11. Mock data and app state

Firebase is connected for authentication and onboarding only. `src/mock/` still
holds realistic Kolkata-based data for the partner fixture, delivery requests,
completed deliveries, earnings, payouts, notifications, onboarding defaults and
support FAQs.

`src/context/AppProvider.tsx` owns the interactive state behind those screens:
online availability, requests, the active delivery, history, notifications,
support tickets and onboarding progress. `src/context/AuthProvider.tsx` owns the
Firebase session, with a local demo fallback when configuration is absent.

- Firebase persists the authenticated session; submitted onboarding data is
  stored in Firestore and Storage and reloaded on the next sign-in.
- Draft onboarding progress and the language choice use `localStorage`.
- Delivery and notification changes live in memory and reset on reload.
- Every figure shown on the earnings screen is demo data and labelled as such.

Screens read state from the context hooks (`useApp`, `useAuth`) and render typed
models from `src/types/`. Two exceptions still import fixtures directly — the
signed-in partner (`src/mock/partner.ts`, used by Home and Profile) and the
earnings summary (`src/mock/earnings.ts`, used by Home) — and will move behind
the service layer with the remaining backend integration.

## 12. Firebase setup and connected scope

### Connected now

- `src/firebase/config.ts` reads the six `VITE_FIREBASE_*` values and exports a
  configuration check. `src/firebase/index.ts` initializes one Firebase app and
  exports `auth`, `db` and `storage`.
- `src/services/auth.ts` verifies the demo OTP and signs the partner in with an
  anonymous Firebase session when configured; the Firebase phone-SMS functions
  stay there for the upcoming OTP API. `AuthProvider` restores the Firebase
  session, exposes the signed-in UID to the app and records the Firebase error
  code when the bridge fails.
- `src/components/layout/FirebaseStatusBanner.tsx` shows that error code across
  the signed-in app with a retry action. The onboarding submit path refuses to
  write a local-only "submitted" state while the app is on the demo session, and
  shows the Firebase error code when a write fails.
- `src/services/partner.ts` records the signed-in mobile number under
  `partners/{uid}` immediately, so the Firebase console reflects a login before
  onboarding is submitted. The anonymous Auth user's display name is set to the
  same number.
- `src/services/partnerOnboarding.ts` uploads the profile photo and selected
  documents to Storage, then writes `partners/{uid}`, `partner_documents/{uid}`,
  `vehicles/{uid}` and `training_progress/{uid}`. Signing in again rebuilds the
  onboarding state from those records.
- `firestore.rules` and `storage.rules` restrict each partner to their own UID.
  `firebase.json` points the Firebase CLI at both rule files and `.firebaserc`
  sets `delivery-231a0` as the default project.
- If configuration is absent, the app uses the local demo OTP and keeps data in
  `localStorage`, so UI work does not depend on live credentials.

### Required Firebase Console setup

1. Open **Authentication** and click **Get started** if the project has never
   used it; on the Spark plan the public API cannot initialize Authentication,
   so the console button is required. Then enable **Sign-in method →
   Anonymous** so the demo-OTP bridge can create a Firebase session. Add
   `localhost` under Authentication → Settings → Authorized domains. When the
   SMS flow returns, also enable **Phone** and add test phone numbers under
   Phone → Phone numbers for testing.
2. Create a **Firestore Database** and a **Storage** bucket in the same project
   as the Web App configuration. The bucket name must match
   `VITE_FIREBASE_STORAGE_BUCKET`.
3. Deploy the rules with the Firebase CLI:

   ```bash
   firebase deploy --only firestore:rules,storage
   ```

   Alternatively paste `firestore.rules` and `storage.rules` into the matching
   rules editors in Firebase Console.
4. Put the Web App configuration into `.env.local` and restart `npm run dev`.

### Verifying the connection

1. Sign in with the demo OTP. **Authentication → Users** should list an
   anonymous user whose display name is the mobile number, and
   **Firestore → Data → partners** should contain a document with `phone`
   (`+91…`), `authProvider` and `lastSignInAt`.
2. If the app shows the **Firebase is not connected** banner, read its error
   code:

   | Code | Meaning |
   | --- | --- |
   | `auth/configuration-not-found` | Authentication has not been initialized in the project |
   | `auth/operation-not-allowed` | The Anonymous provider is not enabled |
   | `auth/unauthorized-domain` | `localhost` (or the deployed host) is not an authorized domain |
   | `auth/network-request-failed` | The browser cannot reach Firebase |

3. Fix the console setting and press **Retry connection** in the banner. The
   banner disappears once the anonymous session exists.
4. Complete onboarding and submit. **Firestore** should then contain
   `partners/{uid}`, `partner_documents/{uid}`, `vehicles/{uid}` and
   `training_progress/{uid}`, and **Storage** should contain
   `partners/{uid}/…`. A submission error shows `permission-denied` when the
   rules are not deployed and a `storage/…` code when the bucket or its rules
   are missing. Uploads stop retrying after about 15 seconds, so a missing
   bucket or a blocked network surfaces instead of leaving the submit spinner
   running.

### Still mock

Deliveries, delivery requests, earnings, payouts, notifications, support tickets,
partner ratings, the map preview and the delivery OTP are still demo data. They
need the remaining Phase 12 service layer; no delivery or payment collection is
written by this change.

> **Security:** Vite embeds every `VITE_*` value in the browser bundle.
> `.env.local` keeps the values out of Git, not out of the browser. Firebase Web
> App values are public identifiers; protect data with Authentication,
> Firestore/Storage Security Rules, authorized domains and API key
> restrictions. Never put service-account credentials, private keys or admin SDK
> secrets in a `VITE_*` variable.

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
| 12 | Admin and existing-platform integration | 🟡 Firebase auth bridge + onboarding connected; deliveries, earnings, notifications, support and admin pending |
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
