# Fafo Delivery Partner App

A mobile-first web app for delivery partners who handle grocery and restaurant
orders from the existing Fafo platform.

The app is designed as a phone experience: it runs in the browser, looks like a
modern mobile app, and is built for a 390 × 844 px screen. On larger screens it
stays a centered app column instead of stretching into a desktop dashboard.

> **Status:** Phases 1–11 of the partner experience are complete, and the
> admin-to-partner delivery loop (Phase 12) is now live. Firebase demo-auth
> and onboarding persistence stay connected; delivery offers assigned from
> `delivery_admin` arrive through a live Firestore listener (`onSnapshot`),
> acceptance is atomic via a Firestore transaction, and the delivery
> lifecycle — pickup, transit, drop and OTP completion — updates the shared
> `deliveries/{id}` document the console reads. While a delivery is active the
> app shares the partner's GPS position on that document (throttled by time
> and movement), shown live on the console's tracking map. The active-delivery
> screen uses an interactive Leaflet + OpenStreetMap map with pickup, drop and
> partner markers plus OSRM route geometry; both tile and routing providers
> are configurable. Notifications are real and persisted; earnings are derived
> from completed deliveries, while payouts/incentives and support remain mock.
> The demo OTP remains the default sign-in until the OTP API lands, and this test
> build hides media uploads because Storage is not configured.
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
| Authentication | Responsive sign-in/OTP with the brand hero retained on every width (fixed 480px on phones so the keyboard cannot reflow it), a smooth 220ms form-sheet lift on focus, mobile number + demo OTP (`123456`, the default until the OTP API lands), stable per-number Firebase demo account when configured, protected routes with redirect back, logout | Built (Firebase bridge) |
| Onboarding | Five steps matching the design: personal, KYC and bank, vehicle, training, review. The first step starts with an English/Hindi/Bengali language selector; training has five short lesson modules, each with a 37-39 s portrait video (thumbnail opens a full-screen player; every module is narrated in Hindi with a music bed), a progress bar and completion on video end (the player closes and the module ticks itself; the Mark as complete button remains). This test build is text-only for documents: profile-photo and document uploads are hidden | Built (Firebase) |
| KYC & documents | Aadhaar, PAN, licence, RC and bank details as text for manual verification; no Storage dependency | Built (text-only test mode) |
| Vehicle information | Bike, scooter, bicycle or on foot; model, colour, licence and registration where applicable | Built (Firebase) |
| Training & approval | Training checklist and submitted-application status | Built (Firebase) |
| Application status | Pending, submitted, under review, approved or rejected with a progress timeline and rejection/suspension reasons; decisions arrive live from `delivery_admin` | Built (Firebase + admin) |
| Home dashboard | Light header with avatar, greeting, top-right light/dark toggle and notifications, availability switch, three headline stats, six quick actions and request preview | Built (live + demo fallback) |
| Delivery requests | Assigned offers from `delivery_admin` arrive live (`onSnapshot`), with countdown, transactional accept/reject, a global sound/vibration alert, and expired-offer removal | Built (Firebase) |
| Active delivery | Interactive OpenStreetMap, timeline, status actions, OTP plus text handover proof, contact, navigation and issue reporting; development builds also accept the test delivery code `4821` | Built (Firebase) |
| Map & tracking | Leaflet + OpenStreetMap markers for pickup, drop and the partner's GPS position; solid pickup→drop route plus a dotted live approach route that re-routes after 500 m; follow mode and configurable providers | Built (live) |
| History | Search, status filter and delivery-level earnings; declined offers appear under Cancelled with a red badge and ₹0 earned; tap any row for full delivery details | Built (live + demo fallback) |
| Earnings & payments | Today/week/month totals, an animated Recharts trend and recent deliveries calculated from completed jobs; month uses 1-6, 7-12, 13-18, 19-24, 25-end buckets; bars show hover amounts and open that bucket's statements; recent jobs open the delivery details sheet; a withdrawal flow lets the partner enter an editable UPI ID, confirm a demo phone OTP and track the request live (an operations ticket is raised at High priority and credit is promised within 24 hours); payouts/incentives remain demo/empty | Built (live withdrawals; demo payouts) |
| Notifications | Real-event in-app notifications persisted in Firestore with read state and deep links; a new offer also opens a global Accept/Reject alert; background tab gets a system alert | Built (live) |
| Help & support | FAQs, ticket submission, live ticket feed and status updates; delivery issues create a ticket automatically | Built (live tickets persisted; FAQs are static help content) |
| Profile & settings | Partner details, post-onboarding email/address/vehicle editing, English/Hindi/Bengali language switching, persisted alert sound/vibration preference, application status and sign-out | Built (live partner record) |

### Demo access

The demo OTP is the default verification path for now: enter any valid 10-digit
Indian mobile number (for example `9832979005`) and use the code **`123456`**.
No SMS is sent; the project's own OTP API will replace this step later.

When `VITE_FIREBASE_*` is configured, accepting the demo code also signs the
partner in with a **stable per-number Firebase demo account** (Email/Password,
derived from the verified number), so the app talks to Firebase under the
UID-based Security Rules instead of staying fully local. The fixed demo password
lives in `src/services/auth.ts` and is not a real credential; it exists only
until the project's OTP API replaces the demo OTP. One number resolves to one
UID across sign-outs, number switches, browser restarts and devices. An existing
anonymous device account is linked to the number's stable credential on its next
sign-in, so its Firestore records are preserved.

If the Email/Password provider is disabled, the bridge falls back to the previous
anonymous session. If no Firebase session can be created, the app falls back to a
local demo session and shows a **Firebase is not connected** banner on every
signed-in screen with the Firebase error code and a **Retry connection** action.
Onboarding submission is blocked in that state, so a local draft is never
presented as a Firebase submission. This identity bridge is demo-only and must
not be treated as production authentication.

The Firebase phone-SMS code path (`sendPhoneOtp` / `confirmPhoneOtp`) stays in
`src/services/auth.ts` for when the OTP API integration begins.

**Delivery completion demo code.** Development builds accept **`4821`** in the
active-delivery OTP field as a test override, even when `delivery_admin` issued
a different `dropOtp`. The admin code is still checked first, and a completion
made with the demo code is marked `proof.demoOverride: true`. Production builds
disable the override unless `VITE_DEMO_DELIVERY_OTP=4821` is set at build time;
leave it empty for a real deployment. The hint is shown only while the override
is enabled.

## 4. Technology stack

| Technology | Version | Used for |
| --- | --- | --- |
| [React](https://react.dev/) | 19 | Building the interface |
| [TypeScript](https://www.typescriptlang.org/) | 7 | Types and safer data handling |
| [Vite](https://vite.dev/) | 8 | Development server and production build |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Styling with design tokens |
| [React Router](https://reactrouter.com/) | 7 | Routing, guards and navigation |
| [Firebase](https://firebase.google.com/docs/web/setup) | 13 | Auth, Firestore and Storage SDK foundation |
| [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.dev/) | 1.9 / 5 | Interactive delivery map on OpenStreetMap tiles |
| [Lucide React](https://lucide.dev/) | latest | Icons |
| [Recharts](https://recharts.org/) | latest | Interactive earnings chart |
| [OpenStreetMap](https://www.openstreetmap.org/) | — | Map tiles (no key); OSRM for route geometry |
| [Oxlint](https://oxc.rs/) | latest | Code linting |

Firebase provides the demo-OTP auth bridge, onboarding persistence, the live
partner-document listener, and the shared `deliveries` collection. Earnings,
notification and support fixtures come from `src/mock/` and are shown only for
the offline prototype; live accounts start empty.

## 5. Current development status

All partner-facing screens in the roadmap are implemented and connected to a
shared mock state layer:

- `/login` and `/verify-otp` — mobile number entry, demo OTP verification with a
  resend timer and clear error messages. When Firebase is configured, the
  verified number signs in to its stable demo account. Re-entering that number
  resumes the same Firebase UID and submitted application after a sign-out,
  number switch, browser restart or on another device; a new number gets its own
  account and starts onboarding. An existing anonymous account is linked to the
  stable credential instead of being replaced.
- Protected app shell with Home, Orders, History, Earnings, Profile and a
  404 screen, plus Notifications, Active Delivery, Support and Onboarding, all
  inside the same shell with the bottom navigation.
- Every section header carries a back control (Orders, History, Earnings,
  Profile, Notifications, Support, Active delivery, Onboarding and 404). Home is
  the app root, so it has no back button.
- A fresh app launch or new tab skips the login screen only when Firestore
  confirms the remembered account already has a submitted or reviewed
  application. A sign-in-only or draft account starts at the login screen.
  Reloading the running tab keeps the signed-in session, returns to Home and
  restores the last online/offline state from `partners/{uid}`; signing out
  returns to the login screen. App sign-out keeps the device's Firebase session so the same
  number can resume after OTP; use a different number to switch accounts. The
  stable demo account also makes the same number resolve to the same partner
  record on another device or after browser data is cleared, but this remains a
  demo identity, not real phone verification.
- Onboarding drafts are saved per verified mobile number under
  `fafo.partner.onboarding.<phone>`. All required text and number fields are
  validated; every file upload, including the profile photo and KYC documents,
  is optional.
  Submitting uploads selected files to Storage when it is available and saves
  partner, document, vehicle and training records to Firestore; signing in again
  reloads the submitted application from Firestore. If a newly created stable
  account has no Firestore application but this device still holds a submitted
  (or fully completed) local application for the same number, the app restores
  that application instead of reopening the wizard. A failed restore shows a
  retry banner and never silently downgrades the submitted state to a draft.
- Signing in records the verified mobile number in `partners/{uid}` immediately.
  Until onboarding is submitted, `delivery_admin` lists that partner as **KYC
  pending** and keeps approval disabled.
- Onboarding is mandatory: draft applications are held inside the wizard, and
  Home, Orders, Earnings and Profile only open once the application is
  submitted. A Firebase-configured session that falls back to the device-only
  demo account is treated as unverified and starts in the wizard, so it cannot
  inherit an old locally approved state. The bottom navigation is hidden while
  the draft form is open.
- A profile photo is **optional** on the personal step; it must be JPG or PNG and
  within 2 MB, is downscaled locally to a 256px preview, is shown on Home and
  Profile, and is uploaded to Firebase Storage on submission.
- KYC collects the Aadhaar, PAN, driving-licence and vehicle-RC numbers beside
  optional upload controls, with JPG/PDF and 2 MB guidance. The document numbers
  remain required; the files are optional. The licence and registration fields
  share state with the vehicle step, so either screen can be used; bicycle and
  on-foot partners are not required to provide either. The bank account row also
  offers an optional bank passbook or cancelled-cheque upload. All files accept
  JPG or PDF up to 2 MB; larger files are rejected inline and are not recorded
  as uploaded. If Storage is unavailable, submission stores document metadata
  and the small profile preview inline in Firestore instead of blocking. If an
  upload fails during submission, the error panel also offers **Submit without
  documents**, which retries the Firestore write with metadata only.
- Application status is available from Profile → Application status. It shows
  pending, submitted, under review, approved or rejected with submitted and
  updated dates plus a four-step tracker. The submitted state is read from
  Firestore, and the Administrator's decision arrives through a live listener.
  A rejected application shows the Administrator's reason; a suspended account
  shows a suspension notice instead of the availability switch. The Home
  application-status card is shown only until approval, so an approved partner
  sees the availability control and delivery overview without the approval
  prompt. The labelled demo control is shown only when Firebase is not
  configured because no verification service is connected.
- Accepting a request moves it into an active delivery with a live status
  timeline; the job closes only after the demo drop OTP is verified, and
  completed or cancelled jobs are added to history. A request the partner
  declines is filed under **Cancelled** with a red **Cancelled by you** badge,
  its decline reason and ₹0 earned, even while the console can still reassign it.
- Available requests are only shown while the partner is online; the Orders
  screen offers a "Go online" action when availability is off.
- Notifications can be read individually or all at once; support tickets can be
  raised and tracked.
- Profile → App language switches the whole interface immediately between
  English, Hindi and Bengali. The first onboarding step offers the same three
  choices up front, so new partners can start in their preferred language. The
  choice is saved in `localStorage`, every screen,
  shared component, validation message and the mock notification/FAQ copy uses
  the selected language, and dates, times and rupee amounts follow the matching
  `en-IN`, `hi-IN` or `bn-IN` locale.
- The **moon/sun button in the Home header’s top-right corner** switches the app
  between the light and dark token palettes immediately. The choice is saved
  under `fafo.partner.theme` and is applied before the first paint.
- Motion is short and purposeful: screens settle in on navigation, the reject
  sheet and offer alert slide up, the earnings bars grow, unread counts pop and
  the online dot pulses. `prefers-reduced-motion` turns all of it off.

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
│   │   ├── deliveries/       # DeliveryRequestCard, DeliveryTimeline,
│   │   │                     # MapPreview, DeliveryMap (Leaflet)
│   │   └── layout/           # AppLayout, AuthLayout, BottomNavigation,
│   │                         # ScreenHeader, ModulePlaceholder
│   ├── context/              # LanguageProvider, AuthProvider, AppProvider, hooks
│   ├── firebase/             # SDK config plus auth, db and storage exports
│   ├── services/             # Auth bridge, onboarding persistence, live
│   │                         # delivery requests and location publishing
│   ├── hooks/                # useCountdown, usePartnerTracking (GPS)
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
├── SECURITY.md               # Threat model, rules and production checklist
├── firebase.json             # Firestore and Storage rules deployment config
├── firestore.rules           # Owner + delivery_admin access rules
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

Demo fixtures are the **offline prototype's** content and are shown only when
Firebase is not configured (or the connection failed and the app fell back to
the device-only demo session). `src/mock/` holds realistic India-based data
for delivery requests, completed deliveries, earnings, payouts, notifications,
onboarding defaults and support FAQs. A signed-in Firebase account — including
a brand-new number — never receives any of it: its requests, active delivery,
history, notifications and tickets start empty and fill only with real records.

`src/context/AppProvider.tsx` owns the interactive state behind those screens:
online availability, requests, the active delivery, history, notifications,
support tickets, dashboard figures and onboarding progress.
`src/context/AuthProvider.tsx` owns the Firebase session, with a local demo
fallback when configuration is absent.

- Firebase persists the authenticated session. A fresh launch restores it only
  when Firestore confirms a submitted or reviewed application; a sign-in-only or
  draft account returns to `/login`. Reloading the running tab keeps the session,
  and submitted onboarding data is stored in Firestore and Storage.
- Draft onboarding progress and the language choice use `localStorage`.
- Live dashboard figures (deliveries today, earnings today) are computed from
  real completed deliveries; the rating cell shows "New" until a rating source
  exists. The offline prototype keeps its labelled demo figures.
- The Earnings screen uses the same completed-delivery source as the dashboard
  for live accounts: today/week/month totals, per-delivery average, chart and
  recent jobs are derived from `history`. Payout history and incentives stay
  labelled demo/empty until settlement is connected.
- **Withdrawals.** The available balance is the delivered earnings minus every
  request that is not rejected. The partner enters an amount and a UPI ID
  (prefilled with the last one, editable each time), confirms a demo phone OTP
  (`123456`, shown in the sheet) and gets the "amount will take 24 hours to
  credit" notice. One atomic write creates a `payments/{uid_request}` row with
  status `requested` and a `support_tickets` row with `priority: 'High'` and a
  "High priority · Withdrawal request" subject, so operations sees it in the
  existing ticket feed. `payments` is admin-updated to `processing`, `paid` or
  `rejected`; the Earnings list is an `onSnapshot`, so the status changes
  without a reload. Demo sessions persist the same list in `localStorage`.
- Demo earnings figures exist only in the offline prototype; live earnings are
  not mock numbers.

Screens read state from the context hooks (`useApp`, `useAuth`) and render typed
models from `src/types/`. The old `src/mock/partner.ts` fixture was removed:
Profile and Home render the signed-in partner from the onboarding record and
the Firebase session.

## 12. Firebase setup and connected scope

### Connected now

- `src/firebase/config.ts` reads the six `VITE_FIREBASE_*` values and exports a
  configuration check. `src/firebase/index.ts` initializes one Firebase app and
  exports `auth`, `db` and `storage`.
- `src/services/auth.ts` verifies the demo OTP and signs the partner in to a
  stable per-number Email/Password demo account when configured. A returning
  number signs back into the same UID; an existing anonymous account is linked
  to that credential before the UID can be replaced. If the provider is
  disabled, the bridge falls back to an anonymous session. The Firebase
  phone-SMS functions stay there for the upcoming OTP API. `AuthProvider`
  restores the Firebase session, recovers the number from the demo account when
  local storage cleared, exposes the signed-in UID to the app and records the
  Firebase error code when the bridge fails.
- `src/components/layout/FirebaseStatusBanner.tsx` shows that error code across
  the signed-in app with a retry action. The onboarding submit path refuses to
  write a local-only "submitted" state while the app is on the demo session, and
  shows the Firebase error code when a write fails.
- `src/services/partner.ts` records the signed-in mobile number under
  `partners/{uid}` immediately, so the Firebase console reflects a login before
  onboarding is submitted. The demo Auth user's display name is set to the same
  number, and an existing device account's number can be recovered from this
  document before linking it to a stable credential. The merge write is skipped
  for an already-reused document, so it cannot briefly hide a submitted
  application from the first read.
- `src/services/partnerOnboarding.ts` uploads the profile photo and selected
  documents to Storage, then writes `partners/{uid}`, `partner_documents/{uid}`,
  `vehicles/{uid}` and `training_progress/{uid}`. Signing in again rebuilds the
  onboarding state from those records; the partner document is read from the
  server so a cached sign-in copy cannot be mistaken for a missing application.
  If no remote application exists, a submitted or fully completed local
  application for the same number is written to the new stable UID. The account
  watcher ignores sign-in-only snapshots so they cannot move a submitted
  partner back into the wizard.
- `watchPartnerAccount()` in the same service subscribes to `partners/{uid}` and
  applies Administrator decisions without a reload: `applicationStatus`,
  `status`, `adminReview.reason`, and `adminSuspension.reason`. `AppProvider`
  forces the partner offline and disables the availability switch unless the
  application is approved and the account is active.
- `firestore.rules` and `storage.rules` restrict each partner to their own UID.
  The rules also allow the `delivery_admin` administrator UID to read/write
  `partners/{uid}` and read `partner_documents`, `vehicles`, and
  `training_progress`. `firebase.json` points the Firebase CLI at both rule
  files and `.firebaserc` sets `delivery-231a0` as the default project. Each
  write is validated by a single rule function: Firestore rejects a request that
  evaluates more than 1,000 expressions, so the partner update rule checks the
  profile and submission shapes together instead of validating twice.
- If configuration is absent, the app uses the local demo OTP and keeps data in
  `localStorage`, so UI work does not depend on live credentials.

### Administrator actions from delivery_admin

The admin console writes these fields on `partners/{uid}` through the Firestore
REST API. It syncs partner records after a real Firebase sign-in and refreshes
them every 60 seconds and when the window regains focus; demo access uses the
seeded partners instead.

| Field | Meaning |
| --- | --- |
| `applicationStatus` | `draft`, `submitted`, `under_review`, `approved`, `rejected` |
| `status` | `pending`, `active`, `paused` |
| `adminReview` | decision, reason, application ID, reviewer, review time, admin partner ID |
| `adminSuspension` | active flag, reason, updater, update time, admin partner ID |
| `adminPartnerId` | admin directory record linked to this account |
| `statusUpdatedAt`, `updatedAt` | ISO timestamps |

- **Approve:** `applicationStatus: approved` and `status: active`. The partner can
  go online, and the Home application-status card is removed by the live listener.
- **Reject:** `applicationStatus: rejected`, `status: pending`, and the reason in
  `adminReview.reason`. The app shows that reason on Home and Application
  status.
- **Suspend:** `status: paused`, `adminSuspension.active: true`, and a reason.
  The partner is forced offline and receives no requests.
- **Reinstate:** `status: active` and `adminSuspension.active: false`. The
  availability switch works again when the application is approved.
- **New sign-ins:** `partners/{uid}` created at sign-in carries the verified
  phone and no application fields. The admin KYC queue shows it as **KYC
  pending**; approval is refused until onboarding writes
  `applicationStatus: submitted`.

The admin UID is allow-listed in `firestore.rules`. Replace it if the Firebase
administrator account is recreated, then redeploy the rules.

### Live delivery and location sharing

Deliveries assigned from `delivery_admin` land in the shared
`deliveries/{deliveryId}` collection and reach the partner through a live
`onSnapshot` subscription (`src/services/deliveryRequests.ts`) filtered to the
signed-in UID — no polling and no refresh. The console's assignment
write-through publishes each offer with:

- identifiers (`deliveryId`, `displayId`) and the partner's name, vehicle type
  and Firebase UID (`partnerUid`);
- category, pickup and destination names, addresses and coordinates;
- distance, ETA, earnings, item count, payment mode and handling notes;
- the customer's 4-digit drop code (`dropOtp`) and an absolute `expiresAt`
  response window (the console's offer timeout);
- status `assigned` plus the title-case `adminStatus` (`Pending`).

**Acceptance is atomic.** `acceptAssignedDelivery` re-reads the document inside
a Firestore transaction: an expired, cancelled, reassigned or already-accepted
offer fails with an actionable message, and Firestore rules independently
reject any status change that does not follow the forward path. Expired offers
also leave the Available list on a one-second clock without waiting for a new
snapshot. The request then opens the active delivery. Accept is disabled while
another delivery is active.

**Lifecycle.** Every step — `accepted`, `pickup_arrived`, `picked_up`,
`in_transit`, `drop_arrived`, `delivered` — is written to the same document in
a transaction with a timestamped `events` entry, so retries are idempotent and
the console sees progress within seconds. Rejecting an offer asks for a short
text reason and records it in `partnerResponse` without changing the status;
cancelling records a reason.
Delivery completes only when the customer's OTP matches the `dropOtp` the
console issued with the assignment — there is no fallback code. If an offer
has no code (created before the console started issuing them), the app refuses
to close the job and tells the partner to contact operations. The same
completion can carry text-only handover details (recipient name, short note)
and the last GPS fix, stored in `proof`; no photo, signature image or audio is
required.

**Notifications.** The live listeners turn events the partner did not create
themselves into in-app notifications: a new assigned offer, a delivery the
Administrator cancelled, an offer that expired or was reassigned, and account
decisions (approved or suspended) from the partner-document watcher. A new
offer also opens a global Accept/Reject card on every screen, plays a short
generated chime and vibrates where supported, so a partner on Profile or
History cannot miss it. Notification items deep-link to Orders, Profile or
Earnings. Live notifications are also persisted in
`notifications/{uid_eventId}` as text, so the list and read state survive a
reload; the first delivery snapshot remains a baseline so old events are not
replayed. The Profile preference **Alert sound & vibration** mutes the chime
and browser alert but keeps the visual request card. When the tab is in the
background and the partner has granted browser-notification permission, a
system alert is shown. Browser notifications only work while the app is open —
notifying a closed app needs Firebase Cloud Messaging plus a Cloud Function
that fans out assignment events, which this project does not run yet.

**Location sharing.** While a delivery is active, `usePartnerTracking` wraps
`navigator.geolocation.watchPosition` and publishes fixes that moved ≥25 m (or
once a minute) to `currentLocation` on the delivery document — latitude,
longitude, accuracy and timestamp. Fixes worse than 150 m accuracy update the
partner's own map but are not published. Permission denial, GPS loss and
background tabs are reported honestly on the active-delivery screen ("Location
permission denied — your position is not shared"); tracking stops and the
watcher is cleared when the delivery completes, is cancelled or the screen
unmounts. While a delivery is active the app also requests a Screen Wake Lock
where supported, so the phone screen does not sleep and interrupt foreground
GPS; this is not background tracking. Separately, `partners/{uid}` keeps the online presence and
availability (`Available` / `On Delivery` / `Offline`) in step: `isOnline` and
`availability` publish immediately when the switch changes, independently of
geolocation, and position fields (`lastLocation`, `lastLocationUpdatedAt`)
update as fixes arrive. A denied or unavailable GPS permission therefore cannot
make an online partner look offline to the console. Availability flips to
`On Delivery` the moment a delivery starts and back to `Available` when it ends,
so the console can distinguish an online partner from a busy one.

**Map.** The active-delivery screen uses an interactive Leaflet map
(`src/components/deliveries/DeliveryMap.tsx`) with distinct pickup, drop and
partner markers, two route lines from an OSRM-compatible service, and a
follow-my-location control. The solid line is the planned pickup→drop leg and is
always visible before pickup; the dotted line is the partner's approach to the
pickup (or to the drop after pickup). The approach line starts at the live
marker and is re-requested once the partner has moved 500 m, so it follows the
ride without a request per GPS fix; the previous geometry stays on screen while
the re-route is in flight. The map fits once per delivery instead of
refitting on every GPS fix; follow mode pans to each new fix while it is on.
Tiles default to OpenStreetMap and routes to the public OSRM demo server; both
are configurable via `VITE_MAP_TILE_URL` and `VITE_ROUTE_API_BASE` because
neither public service is SLA-backed. Missing or zeroed coordinates show a
location-unavailable state instead of a wrong map, and a failed route fetch
only hides the line — markers stay.

`delivery_admin` reads the same collection over REST (polling, since its REST
connection has no live subscription), shows the partner's latest position on
the tracking map, and can cancel an assigned delivery — which the partner's
listener turns into a cancelled job in history. The dedicated Tracking page
refreshes every 15 seconds while visible, with a 5-second cache and a
two-minute stale warning; other console pages keep the one-minute cadence.

A live partner session starts with no requests or history. Demo requests remain
available only when Firebase is not configured so the prototype can still be
explored offline; live accounts never receive mock deliveries.

### Required Firebase Console setup

1. Open **Authentication** and click **Get started** if the project has never
   used it; on the Spark plan the public API cannot initialize Authentication,
   so the console button is required. Enable **Sign-in method → Email/Password**
   for the stable per-number demo accounts, and create the
   `admin@picdrop.demo` account used by `delivery_admin`; its UID must match the
   allow-list in `firestore.rules`. Optionally enable **Anonymous** as the
   fallback for projects where Email/Password cannot be enabled. Add `localhost`
   under Authentication → Settings → Authorized domains. When the SMS flow
   returns, also enable **Phone** and add test phone numbers under Phone → Phone
   numbers for testing.
2. Create a **Firestore Database**. **Storage is optional in this text-only
   test build**: media upload controls are hidden and document numbers are
   reviewed manually, so no bucket or Blaze plan is required. When Storage is
   added later, initialize it in the same project, set the bucket name to match
   `VITE_FIREBASE_STORAGE_BUCKET`, and set `mediaUploadsEnabled` in
   `src/config/media.ts` to `true` after re-testing uploads.
3. Deploy the rules and the composite indexes with the Firebase CLI:

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

   The withdrawal feed needs the `payments` (partnerUid, requestedAt) index in
   `firestore.indexes.json`; the rule deploy alone is not enough. A new index may
   take a few minutes to build.

   Alternatively paste `firestore.rules` and `storage.rules` into the matching
   rules editors in Firebase Console.
4. Put the Web App configuration into `.env.local` and restart `npm run dev`.

### Verifying the connection

1. Sign in with the demo OTP. **Authentication → Users** should list an
   Email/Password user `p<10-digit-number>@fafo-demo.app` whose display name is
   the mobile number, and **Firestore → Data → partners** should contain a
   document with `phone` (`+91…`), `authProvider: demo-otp` and
   `lastSignInAt`. Signing out and entering the same number again should return
   the same UID. An older anonymous user is linked to this account on its next
   sign-in.
2. If the app shows the **Firebase is not connected** banner, read its error
   code:

   | Code | Meaning |
   | --- | --- |
   | `auth/configuration-not-found` | Authentication has not been initialized in the project |
   | `auth/operation-not-allowed` | The Email/Password (and fallback Anonymous) provider is not enabled |
   | `auth/unauthorized-domain` | `localhost` (or the deployed host) is not an authorized domain |
   | `auth/network-request-failed` | The browser cannot reach Firebase |

3. Fix the console setting and press **Retry connection** in the banner. The
   banner disappears once a Firebase session exists.
4. Complete onboarding and submit. **Firestore** should then contain
   `partners/{uid}`, `partner_documents/{uid}`, `vehicles/{uid}` and
   `training_progress/{uid}`, and **Storage** should contain
   `partners/{uid}/…`. A submission error shows `permission-denied` when the
   rules are not deployed. A missing bucket is detected by a short preflight
   before the upload. In that case submission still succeeds: document metadata
   and the small profile preview are written to Firestore, while any selected
   files are uploaded only when Storage is configured.

### Still mock

Payouts, incentives and ratings remain demo data for the offline prototype only.
Live earnings are calculated from completed deliveries, but no payout settlement
exists yet. Notifications for live accounts are real persisted events; the
labelled mock notification/support fixtures exist only for the prototype. The
old `src/mock/partner.ts` fixture was removed; Profile renders the onboarding
record and the session.
Distance and ETA for console-assigned deliveries are the estimates the console
computes from service-area coordinates (approximate, not routing-engine
figures). The delivery drop code is whatever the console issued — there is no
demo fallback in a live session, and offers without a code cannot be completed
until operations verifies the drop. No earnings, payout or payment collection
is written by this integration.

> **Security:** Vite embeds every `VITE_*` value in the browser bundle.
> `.env.local` keeps the values out of Git, not out of the browser. Firebase Web
> App values are public identifiers; protect data with Authentication,
> Firestore/Storage Security Rules, authorized domains and API key
> restrictions. Never put service-account credentials, private keys or admin SDK
> secrets in a `VITE_*` variable.
>
> The full review — XSS and injection surface, rule boundaries, demo-auth
> limitations, App Check, DDoS/quotas and recommended headers — is in
> [`SECURITY.md`](SECURITY.md). Enable App Check with
> `VITE_RECAPTCHA_SITE_KEY` before public traffic, and never expose this demo's
> fixed OTP/password as production authentication.

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
| 9 | Maps, location permission and routes | OpenStreetMap preview 🟡 |
| 10 | History, earnings and payments | ✅ Live history and earnings; payouts pending |
| 11 | Notifications, support and profile settings | ✅ Complete feature set |
| 12 | Admin and existing-platform integration | 🟡 Admin decisions, assigned offers, lifecycle, notifications and live earnings connected; payout settlement and support remain pending |
| 13 | Quality checks and release preparation | ⏳ Pending |

## Decisions still open

- The existing platform's technology and how delivery jobs will be exchanged.
- Whether both systems share one Firebase project or talk through APIs.
- How delivery jobs are assigned (automatic, manual, or by the existing platform).
- Which routing provider supplies distance, ETA and turn-by-turn directions.
- Which documents are mandatory for verification and who approves them.
- How earnings are calculated and when payouts are created.
- Whether an admin panel is part of this project.
- The final delivery format (mobile web app / PWA vs native app).
