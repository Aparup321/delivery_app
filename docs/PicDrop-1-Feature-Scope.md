# PicDrop — Developer Feature Scope

**Document 1 · Section-wise feature checklist**
Nomad • PicDrop · Requirements draft · 6 November 2026

> **Scope inventory only.** Includes discussed features and recommended operational controls.
> Phasing is a proposal; inclusion here does not imply all features are required for the first release.

---

## Contents

1. [Accounts and access](#1-accounts-and-access)
2. [Onboarding, verification and safety](#2-onboarding-verification-and-safety)
3. [Seller-owned delivery teams](#3-seller-owned-delivery-teams)
4. [Delivery booking and package details](#4-delivery-booking-and-package-details)
5. [Partner discovery and assignment](#5-partner-discovery-and-assignment)
6. [HopNgo roles and combined trips](#6-hopngo-roles-and-combined-trips)
7. [Scheduling and capacity](#7-scheduling-and-capacity)
8. [Rate cards and quotation](#8-rate-cards-and-quotation)
9. [Free delivery and subsidies](#9-free-delivery-and-subsidies)
10. [Tracking and fulfilment](#10-tracking-and-fulfilment)
11. [Fleets and external integrations](#11-fleets-and-external-integrations)
12. [Payments, reporting and administration](#12-payments-reporting-and-administration)
13. [Proposed release boundary](#13-proposed-release-boundary)

---

## 1. Accounts and access

- Buyer and seller access to book and track deliveries.
- Individual delivery-partner onboarding for foot, cycle, bike, car and commercial vehicles.
- Shared partner identity across PicDrop and HopNgo; multiple eligible roles per account.
- Seller-owned private delivery teams and optional shared-pool participation with consent.
- Third-party fleet accounts with fleet administrators and linked riders.
- Nomad operations/admin access with role-based permissions.

## 2. Onboarding, verification and safety

- Mobile OTP, profile photo, identity verification, bank details and applicable vehicle documents.
- Separate platform verification status, seller endorsement and fleet affiliation.
- Nomad Verified and not-yet-Nomad-verified pool labels; no misleading verification badges.
- Document review, expiry alerts, suspension, blocked accounts and audit trail.
- Package eligibility, prohibited items, value limits, vehicle capacity and service-area restrictions.
- Emergency/support access, incident reporting, delivery disputes and claims workflow.

## 3. Seller-owned delivery teams

- Seller invitations, rider acceptance, team membership, working hours and vehicle allocation.
- Private mode and consent-based shared mode; seller-priority availability controls.
- Manual assignment, reassignment, workload monitoring and delivery performance reports.
- Tracking, OTPs, proof of delivery and COD reconciliation for seller-owned jobs.
- Direct seller payroll or optional platform settlement; separate software-fee configuration.

## 4. Delivery booking and package details

- Seller-initiated, buyer-initiated and order-linked bookings.
- Pickup/drop contacts, addresses, map pins and serviceability checks.
- Package category, quantity, dimensions, weight, declared value and handling instructions.
- Immediate delivery, scheduled same-day and future-date delivery.
- Standard/express options, upfront quotes and payer selection.
- Return, failed-delivery, cancellation and optional multiple-stop workflows.

## 5. Partner discovery and assignment

- Preferred partners saved by sellers/buyers with consent and visible verification status.
- Configurable priority: seller team/preferred partners, Nomad Verified pool, eligible other pool, fleet and external provider.
- Filter by availability, location, vehicle, capacity, price, trust eligibility and service area.
- Automatic offer/acceptance, manual selection, timeouts, fallback and reassignment.
- No automatic paid fallback without the payer approving the price change.
- Optional quotation/bidding for oversized or custom jobs in a later phase.

## 6. HopNgo roles and combined trips

- Taxi-only, delivery-only and combined-trip availability preferences.
- Sequential taxi/delivery jobs without overlap; combined trips only when explicitly enabled.
- Combined-trip route, passenger consent, package suitability, capacity and detour controls.
- Separate passenger and package tracking visibility, fares, proofs and ledger entries.
- Admin enablement subject to transport, insurance and safety review.

## 7. Scheduling and capacity

- Partner working days, shifts, breaks, zones and leave calendar.
- Customer-facing delivery windows, booking cutoffs, lead times and blackout dates.
- Capacity based on feasible routes, duration, vehicle and committed partner/fleet capacity.
- Checkout slot holds, booking confirmation, release on timeout/cancellation and prevention of overbooking.
- Advance partner reservation or confirmed fleet capacity with later rider allocation.
- Reminders, readiness checks, rescheduling, no-show handling and backup fulfilment.
- Recurring deliveries and route batching as later-phase options.

## 8. Rate cards and quotation

- Zone- and vehicle-specific base fare, included distance and additional-distance charges.
- Minimum fare, weight/dimension bands, capacity caps and handling charges.
- Waiting allowance/fee, pickup approach distance policy, extra stops, returns and cancellation fees.
- Day/time availability, express/night/peak rules and applicable toll/parking policy.
- Partner-selected rates within admin-controlled bounds; validated and versioned changes.
- Suggested benchmark, comparable local median/average and allowed range.
- Itemised customer quote, partner earnings preview, quote expiry and price-change approval.

## 9. Free delivery and subsidies

- Seller rules by cart threshold, eligible items, customer segment, location, schedule and payment method.
- Full delivery subsidy, capped subsidy and optional shared funding.
- Validity periods, usage limits, budgets, rule priority and stacking controls.
- Checkout eligibility messages and separation of customer fee from carrier charges.
- Seller authorisation for subsidies and fallback-cost caps; itemised accounting.
- Refund, partial cancellation, return and threshold-recalculation policy.

## 10. Tracking and fulfilment

- Accepted, assigned, pickup-arrived, picked-up, in-transit, drop-arrived and delivered milestones.
- Pickup/drop OTP and optional photo/signature proof.
- Active-job live location, ETA, delay alerts and customer communications.
- Failed attempt reasons, reattempt, return-to-origin and lost/damaged parcel reporting.
- Offline event sync, location-permission handling and proof retention controls.

## 11. Fleets and external integrations

- Fleet onboarding, verification, contract, zones, service hours and capacity.
- Fleet rider invitations, reassignment, availability and performance tracking.
- Fleet rate contracts, SLAs, billing, commission and reconciliation.
- External-provider manual booking initially; API quote/book/track/cancel integrations later.
- Provider-specific payment, refund, proof, webhook and exception mapping.

## 12. Payments, reporting and administration

- Customer fees, seller subsidies, carrier gross charges, platform fees, partner payouts and taxes recorded separately.
- Commission or markup contracts by provider type; exclude inappropriate pass-through items from commission.
- Seller-owned delivery software subscription/per-job pricing, independent of rider salary.
- Prepaid payments, optional COD, collections, payouts, refunds and reconciliation.
- Seller, partner, fleet and platform dashboards with operational and financial metrics.
- Admin controls for pricing, service zones, promotions, disputes and provider suspension.
- Role-based data access, consent, active-job tracking limits, retention and audit logs.

## 13. Proposed release boundary

| MVP (proposed) | Later phases (proposed) |
| --- | --- |
| Individual/seller-owned teams · verification · basic preferred/pool assignment · manual fleets · rate cards · immediate/scheduled bookings · free-delivery rules · tracking · proof · settlement | Provider APIs · advanced routing · recurring jobs · bidding · combined HopNgo passenger-plus-parcel trips |

> **Before sign-off:** confirm compliance, verification thresholds, fees, subsidy caps, service limits and the cancellation/claims policy.

---

## 14. Delivery module implementation status

> Maintained during development. A feature is marked **Completed** only after it
> has been implemented and tested in this repository. The original sections above
> are preserved unchanged.

| Feature (source section) | Status | Notes |
| --- | --- | --- |
| Partner registration and onboarding (§1, §2) | In Progress | Five-step wizard matching the design (personal, KYC and bank, vehicle, training, review) with validation and saved progress; verification lifecycle, service areas and package capability are not modelled yet. |
| Personal information and profile management (§2) | In Progress | Profile, contact, vehicle and document summary screens exist, and the profile photo upload is optional during onboarding. Editing partner details after submission is not implemented. |
| KYC and document verification (§2) | In Progress | Aadhaar, PAN, driving-licence and RC numbers are required; their uploads are optional. Review, expiry and restriction workflows are pending. |
| Vehicle details and verification (§2) | In Progress | Bike, scooter, bicycle and on-foot partners are supported; model, colour, licence and registration are captured where they apply (not for bicycle or walking partners). Vehicle verification is pending. |
| Training and onboarding (§2) | In Progress | Five timed modules with completion state; the onboarding quiz is not implemented. |
| Partner availability and service areas (§7) | Pending | Availability is a single online/offline switch; shifts, zones, leave and capacity are not modelled. |
| Delivery booking and requests (§4) | Pending | Requests are pre-seeded offers; requester, payer, package details and quotes are not modelled. |
| Partner assignment and acceptance (§5) | Pending | Acceptance works for the single signed-in partner; priority, timeouts and fallback are pending. |
| Pickup, transit and drop milestones (§10) | Completed (mock) | Accepted → at pickup → picked up → on the way → at drop → delivered, each with a timestamp. |
| Delivery proof and confirmation (§10) | Completed (mock) | Drop OTP is checked against a demo code and stored as proof on the job; photo/signature proof is pending. |
| Route preview and map pins (§4, §10) | Completed (mock) | OpenStreetMap tiles show pickup and destination markers from mock coordinates; live location, routing and serviceability checks are pending. |
| Delivery history and earnings (§12) | In Progress | History reflects mock job state; earnings figures are demo constants and are not derived from jobs. |
| Seller-related delivery management (§3) | Pending | No seller surface in this app yet. |
| Administrative controls (§12) | Pending | No admin surface yet. |

### Milestone log

- **2026-11-07 — M1: job lifecycle and proof (prototype).** Normal progression now
  covers pickup arrival and drop arrival, and completing a job requires the demo
  delivery OTP. Tested in the browser and with typecheck, lint and build.
- **2026-11-07 — M2: dashboard and navigation aligned to the design.** The partner
  dashboard now uses a light header, three headline stats and a six-tile quick
  action grid, and the navigation label is "Orders". Seller, customer and HopNgo
  screens shown in the design remain out of scope.
- **2026-11-07 — M3: onboarding rebuilt to the design.** Onboarding is now five
  steps with the purple stepper header, KYC document rows with per-document
  status, vehicle-type tiles, training modules and a review screen. Address sits
  in Personal and bank details in KYC, so no existing field was dropped. The flow
  renders without the bottom navigation, matching the design.
- **2026-11-07 — M4: QA pass and behaviour fixes.** Verified every route at 390px
  and 320px with no console errors or horizontal overflow. Fixed availability
  gating on Orders, bicycle registration requirements, date-of-birth age
  validation, the submitted-profile action label and the 404 copy. Typecheck,
  lint and build pass.
- **2026-11-07 — M5: on-foot delivery option.** Onboarding now offers bike,
  scooter, bicycle and on foot. Walking partners skip model, colour and
  registration, and profile and review show the on-foot state.
- **2026-11-07 — M6: footer navigation on every authenticated screen.**
  Onboarding now renders inside the standard app shell, so Home, Orders,
  History, Earnings, Profile, Notifications, Support, Active delivery and every
  onboarding step keep the bottom navigation.
- **2026-11-07 — M7: consistent back navigation.** Orders, History, Earnings and
  Profile gained a header back button, and Support, Active delivery and the 404
  screen now fall back to a defined parent route. Home remains the root.
- **2026-11-07 — M8: required profile photo.** The personal step blocks progress
  without a photo, downscales the image to a 256px local preview, shows it in the
  review summary, and uses it as the avatar on Home and Profile.
- **2026-11-08 — M9: per-number onboarding.** Each verified mobile number keeps
  its own draft under `fafo.partner.onboarding.<phone>`, new numbers start blank,
  and draft applications are redirected to the wizard until submitted. The demo
  OTP stays `123456`.
- **2026-11-08 — M10: 2 MB upload limit.** KYC documents and the profile photo
  reject files larger than 2 MB with an inline message, and both upload surfaces
  state the limit before selection.
- **2026-11-08 — M11: anti-slop UI pass.** Removed hue gradients, coloured
  shadows, header blobs, emoji greetings, hover lifts and uppercase tracked
  labels. The dashboard now uses a flat stat strip and a compact tool list; cards,
  buttons and navigation use quiet hairlines, one accent and 11px minimum labels.
- **2026-11-08 — M12: application status tracking.** Profile → Application status
  shows pending, submitted, under review, approved or rejected with dates and a
  four-step tracker. Home and the submitted screen reflect the current stage; a
  labelled demo control previews each state. Verification remains mock data.
- **2026-11-08 — M13: full-screen onboarding form.** The bottom navigation is
  hidden while a draft application is being completed, giving the KYC form the
  full screen. The submitted confirmation still renders inside the app shell.
- **2026-11-08 — M14: vehicle document numbers moved.** The driving licence and
  registration numbers now sit on the vehicle step for bike and scooter
  partners, while KYC keeps the licence and RC uploads; bicycle and on-foot
  partners skip both numbers. Validation, review and profile summaries follow
  the new layout.
- **2026-11-08 — M15: Firebase SDK foundation.** Installed the Firebase Web SDK
  and added configuration plus single-instance Auth, Firestore and Storage
  exports under `src/firebase/`.
- **2026-11-08 — M16: Firebase phone auth and onboarding persistence.** The
  existing login screens now use Firebase Phone Authentication, with the local
  demo OTP retained only when configuration is absent. Onboarding submission
  uploads the profile photo and KYC files to Storage and writes partner,
  document, vehicle and training records to Firestore; the submitted state is
  reloaded on the next sign-in. Owner-only Firestore and Storage rules and a
  Firebase CLI config were added. Delivery, earnings, notification, support and
  admin data remain mock.
- **2026-11-15 — M17: KYC number fields and upload scroll fix.** Driving-licence
  and vehicle-RC number fields now sit beside their KYC uploads and share state
  with the vehicle step. The hidden file input is positioned within the upload
  tile, so opening the bank-passbook picker no longer scrolls the form to the
  top.
- **2026-11-15 — M18: optional KYC files.** Aadhaar, PAN, licence, RC and
  passbook uploads no longer block submission; the document numbers remain
  required. Selected files upload to Storage when it is available. Without
  Storage, the partner record stores document metadata and the 256px profile
  preview inline in Firestore so onboarding can still complete. A failed upload
  also exposes **Submit without documents** in the error panel.
- **2026-11-15 — M19: OpenStreetMap route preview.** The active-delivery map now
  loads OpenStreetMap raster tiles and positions pickup/destination markers from
  mock coordinates. Routing, live location, distance and ETA remain mock. Tiles
  need no API key; attribution is shown on the map.
- **2026-11-17 — M20: optional profile photo and enforced onboarding.** The
  profile photo no longer blocks the personal step, so every upload is optional
  while all required text fields, document numbers and applicable vehicle
  details remain validated. A Firebase-configured session that falls back to the
  device-only demo account is treated as unverified, starts in the wizard at the
  personal step, and cannot reuse a stale locally approved state to reach the
  dashboard.
- **2026-11-17 — M21: fresh-launch sign-in and number switching.** A new tab or
  browser launch no longer reuses the running tab's session marker: sign-in-only
  and draft accounts open the sign-in screen (submitted accounts restore under
  M22), while reloading the running tab keeps the session. Starting a new sign-in
  while signed in no longer redirects back to the old session, so a different
  mobile number reaches the OTP screen.
- **2026-11-17 — M22: onboarded-session restore and KYC-pending queue.** A
  remembered Firebase session now restores straight to the dashboard on a fresh
  launch once Firestore confirms a submitted or reviewed application; a
  sign-in-only or draft account still starts at login, and a submitted
  device-only demo session restores too. Reloading a restored session no longer
  falls into the onboarding wizard because the offline location publish waits for
  the initial Firestore onboarding read. delivery_admin lists a sign-in-only
  partner record as **KYC pending** with approval disabled until onboarding is
  submitted, and refreshes synced records every 60 seconds and on window focus.
- **2026-11-26 — M23: light/dark appearance and purposeful motion.** The Home
  header's moon/sun button switches the whole partner app between the light and
  dark token palettes, persists under `fafo.partner.theme` and is applied before
  first paint; brand headers stay deep purple. Motion is limited to short,
  functional feedback: screens settle in, the reject sheet and offer alert slide
  up, earnings bars grow with a stagger, unread counts pop and the online dot
  pulses. Every effect is removed under `prefers-reduced-motion`.
- **2026-11-26 — M24: declined requests filed as cancellations.** A request the
  partner rejects stays `assigned` on the shared document so the console can
  reassign it, but the partner's History now files it under **Cancelled** with a
  red **Cancelled by you** badge, the decline reason and ₹0 earned. Delivered
  counts, the summary bar and earnings exclude it, and Orders → Completed uses
  the same outcome instead of labelling every non-cancelled record as delivered.
- **2026-11-26 — M25: training modules with real content.** The Training step no
  longer shows bare checklist rows. Each of the five modules opens into a short
  summary, three key points and a **Mark as complete** action; a progress bar
  tracks completion, a completed module shows a green check, and finishing one
  opens the next unfinished module. Completion still persists per number in the
  draft and `training_progress` document. Lesson copy is translated into Hindi
  and Bengali.

