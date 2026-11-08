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
| Personal information and profile management (§2) | In Progress | Profile, contact, vehicle and document summary screens exist, and a profile photo is required during onboarding. Editing partner details after submission is not implemented. |
| KYC and document verification (§2) | In Progress | Aadhaar, PAN, licence and RC are mock file selections; review, expiry and restriction workflows are pending. |
| Vehicle details and verification (§2) | In Progress | Bike, scooter, bicycle and on-foot partners are supported; model, colour and registration are captured where they apply (not for walking partners). Vehicle verification is pending. |
| Training and onboarding (§2) | In Progress | Five timed modules with completion state; the onboarding quiz is not implemented. |
| Partner availability and service areas (§7) | Pending | Availability is a single online/offline switch; shifts, zones, leave and capacity are not modelled. |
| Delivery booking and requests (§4) | Pending | Requests are pre-seeded offers; requester, payer, package details and quotes are not modelled. |
| Partner assignment and acceptance (§5) | Pending | Acceptance works for the single signed-in partner; priority, timeouts and fallback are pending. |
| Pickup, transit and drop milestones (§10) | Completed (mock) | Accepted → at pickup → picked up → on the way → at drop → delivered, each with a timestamp. |
| Delivery proof and confirmation (§10) | Completed (mock) | Drop OTP is checked against a demo code and stored as proof on the job; photo/signature proof is pending. |
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
- **2026-11-08 — M10: 2 MB document limit.** KYC uploads reject files larger than
  2 MB with an inline message, and the KYC step states the limit before upload.

