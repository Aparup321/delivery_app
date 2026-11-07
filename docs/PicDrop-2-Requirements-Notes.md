# PicDrop — Requirements & Operating Notes

**Document 2 · Features, flows, pricing and conditions**
Nomad • PicDrop · Requirements draft · 6 November 2026

> This document consolidates the discussed requirements. All fares, commissions, windows and limits
> below are **proposed configuration examples** — not approved commercial terms or market benchmarks.
> Legal, tax, insurance and transport compliance require review before launch.

---

## Contents

1. [Product model and boundaries](#1-product-model-and-boundaries)
2. [Users, onboarding and permissions](#2-users-onboarding-and-permissions)
3. [Seller-owned delivery team](#3-seller-owned-delivery-team)
4. [Booking and fulfilment flow](#4-booking-and-fulfilment-flow)
5. [Assignment and fallback](#5-assignment-and-fallback)
6. [Scheduled delivery and capacity](#6-scheduled-delivery-and-capacity)
7. [HopNgo operating modes](#7-hopngo-operating-modes)
8. [Rate-card fields and formula](#8-rate-card-fields-and-formula)
9. [Pricing bounds and benchmarks](#9-pricing-bounds-and-benchmarks)
10. [Free-delivery conditions](#10-free-delivery-conditions)
11. [Financial model and examples](#11-financial-model-and-examples)
12. [Fleet and external-provider operations](#12-fleet-and-external-provider-operations)
13. [Tracking, security and reporting](#13-tracking-security-and-reporting)
14. [Core data and implementation](#14-core-data-and-implementation)
15. [Delivery phases and decisions](#15-delivery-phases-and-decisions)

---

## 1. Product model and boundaries

- PicDrop is a **delivery marketplace and delivery-management layer** for sellers, buyers, independent partners, seller-owned teams and third-party fleets.
- HopNgo drivers may also register delivery capabilities.
- A single **Delivery Job** must identify: requester, payer, carrier, assigned person, package, route, timing, price, proof and settlement.
- Keep **account identity**, **organisation membership**, **verification** and **operating mode** as separate concepts.
- A seller endorsement does **not** equal Nomad verification.
- A fleet rider remains linked to the fleet when completing that fleet's work.

## 2. Users, onboarding and permissions

- Buyers and sellers can create delivery requests and maintain preferred partners.
- Individual partners register service areas, vehicles, package capabilities, documents and payout details.
- Fleet administrators onboard and manage their own riders.
- Nomad operations approves verification, manages exceptions and administers rules.

**Verification statuses:** Draft → Submitted → Under Review → Approved → Restricted → Suspended.

- Distinguish basic identity checks from a completed **Nomad verification badge**.
- A not-yet-Nomad-verified pool is optional and must **never** bypass mandatory eligibility checks.
- Preferred-partner selection requires the partner's agreement; verification and job eligibility are re-checked at assignment, even for preferred partners.
- Restrict sensitive, high-value or otherwise risky shipments to eligible verified providers; define prohibited goods and value limits before release.

## 3. Seller-owned delivery team

- The seller invites a rider by mobile number; the rider accepts, verifies identity and joins the seller organisation. Avoid duplicate identities when an existing PicDrop/HopNgo partner accepts an invitation.
- The seller configures working hours, vehicle, service area and permitted job types.
- **Private riders** receive only seller-assigned work.
- **Shared participation** requires rider and seller consent, explicit availability and protection of already committed seller jobs. Do not assume a seller can unilaterally offer an employee to the marketplace.
- Seller tools: assignment, reassignment, live active-job tracking, ETA, delivery proofs, delay alerts, COD reconciliation and performance reports.
- End tracking when the authorised work period/job ends; do **not** expose private off-duty location.
- If the seller pays wages directly, record the delivery as **seller-owned fulfilment** — do not invent a marketplace carrier payout or deduct commission from salary.
- Charge the seller a separately agreed **software subscription or per-completed-job fee**. Optional platform-managed rider payments need their own agreement and ledger.

## 4. Booking and fulfilment flow

1. Requester selects pickup/drop locations, contacts, package details, service speed and delivery time.
2. PicDrop validates service area, restricted goods, vehicle fit, declared value and available capacity.
3. System calculates eligible provider quotes and applies any seller-funded delivery offer.
4. Customer reviews the final fee, delivery window, provider class, cancellation rules and payer details. Temporarily hold slot capacity during checkout.
5. Confirm payment or authorised billing; confirm the booking only when capacity is secured. Assign a rider immediately or against a committed fleet/slot capacity.
6. Partner accepts, arrives at pickup, verifies the package and completes pickup proof. Record exceptions before departure.
7. Track the active job, update ETA and send milestone notifications.
8. Verify drop using OTP and any required photo/signature; close COD collection if enabled.
9. Complete settlement, proof storage, rating and reconciliation.

> **Exception handling:** for no response, no-show, failed delivery, wrong address or damaged parcel,
> record a reason and follow a defined retry, support, return or refund path. Reassignment must not
> duplicate the booking or payment.

## 5. Assignment and fallback

- Recommended configurable priority order: seller-owned rider (when selected) → preferred eligible partner → Nomad Verified pool → other eligible pool → contracted fleet → external logistics provider. Seller policy may choose fleet or own team earlier.
- Buyer/seller preferences must not override safety or package constraints.
- Filter candidates by zone, scheduled availability, vehicle capacity, route feasibility, current commitments, verification, quoted price and relevant performance.
- Offer jobs with an acceptance timeout, then move to the next eligible option.
- Preferred availability is **not** a guarantee. If the initial option fails, recompute availability and price.
- Allow automatic fallback only within a previously authorised price/subsidy cap; otherwise request approval or offer rescheduling/cancellation.
- Record the actual fulfilling provider for support and financial liability.

## 6. Scheduled delivery and capacity

- Offer ASAP plus scheduled delivery windows; illustrative MVP windows are **two hours**, not guaranteed transit durations.
- Distinguish pickup window, delivery window and seller preparation time. Apply minimum booking lead time, cutoff, holidays, geography and package constraints.
- A slot must reflect **committed fulfilment capacity**, not merely partners who happen to be online now. Estimate required travel, service time and existing workloads.
- Hold capacity briefly during checkout; reserve it atomically on confirmation; release it on expiry/cancellation.
- A named rider need not always be assigned at booking if a seller/fleet has committed sufficient capacity. Show **"Scheduled — confirmed capacity"** separately from **"Rider assigned"**.
- Without secured capacity, label the request **pending** rather than promising delivery.
- Before pickup, send reminders and check readiness. On capacity loss, trigger a backup provider within authorised cost limits, or obtain approval to reschedule/cancel.
- Recurring deliveries, multi-drop optimisation and batching can follow later.

## 7. HopNgo operating modes

- One partner identity with four modes: **taxi-only**, **delivery-only**, **sequential dual-service** and **explicitly enabled combined trips**.
- Capability is separate from current status: offline, available, reserved or busy.
- Sequential dual-service permits both job categories but prevents conflicting active assignments.
- Combined trips are a separate **gated** feature, not a default. Require applicable legal/permit and insurance clearance, passenger consent, secure parcel placement, capacity checks, detour/time limits and compatible handling conditions. Reject packages that compromise passenger safety or service quality.
- Keep taxi and delivery contracts, fare components, proofs, cancellations and settlements distinct even if the driver completes them on the same route.
- Passenger and parcel customers must not see each other's personal information.
- Recommend deferring combined trips until these controls are validated.

## 8. Rate-card fields and formula

**Service profile** — per zone and mode (foot, cycle, bike, car or commercial vehicle): service radius, working days/times, maximum weight, dimensions, package types and minimum notice.

**Commercial fields:** base fare, included kilometres, extra-kilometre rate, minimum fare, waiting allowance and per-minute charge, weight/size surcharge, handling surcharge, extra stop, return fee, cancellation fee and approved toll/parking policy. Decide whether pickup approach distance is included or separately priced; disclose it upfront.

**Formula:**

```
quoted service fare =
  MAX( minimum fare, base fare + chargeable distance fee + approved package/handling/time charges )
  + permitted pass-through costs, added separately
  + taxes, added separately
```

Define multiplier order and prevent unintended stacking of express, night and peak charges.

**Illustrative bike quote:**

| Component | Amount |
| --- | ---: |
| Base fare (includes first 2 km) | ₹30 |
| Next 3 km @ ₹12/km | ₹36 |
| Weight surcharge | ₹20 |
| **Subtotal** | **₹86** |
| Express premium (+25%, configured) | ₹107.50 |
| Platform commission (agreed 15% of eligible fare) | ₹16.13 (rounded) |
| **Partner payout** | **₹91.37** |

*Example figures only — not approved commercial terms. Any taxes/pass-throughs are separate.*

- Display the payable total **before acceptance** and the partner's expected net earning. Quote a validity period.
- Waiting charges need arrival evidence, a free allowance and customer notification.
- Material package or address changes require repricing approval.

## 9. Pricing bounds and benchmarks

- Prefer simple partner rate cards **within platform-defined bounds** over unrestricted custom pricing for every job.
- Admin owns zone/mode floors and ceilings; partners choose rates within them.
- Floors should consider time, vehicle cost, empty travel and platform deductions; do not derive them solely from the cheapest competitors.
- A possible pilot band is **0.85–1.35× a validated benchmark**, subject to an absolute cost floor and applicable rules. This is a test hypothesis, not a universal recommendation.
- Do not apply a generic taxi surge cap to delivery or assume it is legally applicable.
- Show a comparable **local median** as the main benchmark, with average optionally available.
- Use completed jobs of similar zone, vehicle, distance, time and package class; exclude tips, cancelled jobs, subsidies and anomalous prices.
- Set a sample threshold and date window; if data is insufficient, label the value **"Platform suggested"** rather than "Zone average".
- Rate changes apply prospectively, are versioned and **never** alter accepted jobs. Configurable change frequency and fraud checks discourage manipulation.
- Do not display an acceptance-probability prediction until there is enough evidence to support it.

## 10. Free-delivery conditions

- Free delivery is a customer discount **funded by a named party**; the carrier still earns the agreed fare.
- The seller enables rules and authorises a subsidy budget/cap. PicDrop-funded or shared offers require separate platform approval.
- **Rule fields:** eligible seller, products/categories, minimum eligible cart subtotal, customer segment, zone/radius, standard/express eligibility, scheduled/ASAP eligibility, payment method, validity, usage limits, discount amount/cap, funding split and budget.
- Define whether the qualifying subtotal is before/after merchandise discounts; a practical starting rule is **merchandise subtotal after discounts, excluding delivery and taxes**.
- Support **full subsidy** and **capped subsidy**:

> If the fare is ₹80 and the seller cap is ₹50, the customer pays ₹30. Label this **"Delivery discount up to ₹50"**, not unconditional free delivery. If the seller funds the full ₹80, the customer delivery fee is ₹0.

- Apply rules in a deterministic order: eligibility → authorised offer selection/stacking policy → caps/budget → final fee.
- Reserve subsidy budget with the order. Show any excluded express, toll or other charges clearly before purchase.
- Recommended fallback policy: seller pays only within its approved cap; a higher-cost replacement needs seller approval, a customer-approved balance, or rescheduling. Do not silently remove a confirmed free-delivery promise after acceptance.
- Define partial cancellation and refund rules upfront. If the seller causes an item cancellation, avoid adding a surprise delivery fee to the customer.
- Returns and reattempts should follow the disclosed policy and reason-code allocation.

## 11. Financial model and examples

- Keep **separate fields** for: carrier gross service fare, commission basis/rate, platform commission, customer delivery charge, seller subsidy, platform subsidy, taxes, pass-through charges, tips, cash collected and carrier net payout. Store currency and rounding rules.
- Prevent double-counting subsidies as extra carrier revenue.

**Example (excluding taxes):**

| Field | Value |
| --- | ---: |
| Carrier service fare | ₹80 |
| Seller-funded subsidy | ₹80 |
| Customer delivery charge | ₹0 |
| Platform commission (agreed 15% of ₹80) | ₹12 |
| **Carrier payout** | **₹68** |

> A full ₹80 carrier payout **plus** a ₹12 seller-paid platform fee is a different **gross-up model**
> and must be separately quoted/agreed.

- For individual partners, use an agreed percentage of eligible **delivery service revenue** — not merchandise value. Pilot commissions may be tested commercially; no universal percentage is approved here.
- Define whether waiting, handling and cancellation fees enter the commission basis; generally keep tips and at-cost toll reimbursements out.
- Fleet providers may use negotiated per-job rates and commission, or net procurement plus markup.
- External providers may have a contracted net quote plus disclosed margin/service fee; a Porter integration is **not** assumed available until commercial/API approval.
- Seller-owned riders paid directly by the seller use the **software-fee model**.
- COD merchandise money is **money held for the merchant**, not platform delivery revenue. Reconcile it separately and define collection limits, remittance timing and shortages.
- Final tax/TDS/GST treatment requires qualified review.

## 12. Fleet and external-provider operations

- Fleet onboarding captures: legal entity, applicable verification, bank details, operating zones, modes, hours, committed capacity, rates, SLA and responsibility for parcel loss/damage.
- Fleet admins invite riders and can reassign within their organisation with full audit history.
- Nomad retains a central job record and support visibility.
- Fleet ownership does **not** bypass rider eligibility.
- Prevent a busy fleet rider from accepting conflicting independent jobs.
- Start external partnerships with authorised **manual bookings** if needed.
- Later integrations should support quote validity, booking IDs, status events, tracking, cancellation, proof, reconciliation and **retry-safe booking**.
- Do not show successful booking until the provider confirms it.
- Map provider states and refunds into PicDrop's standard workflow.

## 13. Tracking, security and reporting

- Track active jobs with appropriate user consent and **role-based visibility**: buyers see their delivery; sellers see their orders/team work; fleets see their assigned jobs; operations sees what is needed for support.
- Avoid unrestricted access to rider location or cross-customer data.
- Support intermittent connectivity through event timestamps, queued updates and clear **"Last updated"** indicators.
- Store OTP verification outcomes safely; define proof retention, restricted photo access, audit logs and location retention/deletion policies.
- Dashboards should show: acceptance, on-time pickup/drop, completion, cancellations, failed attempts, distance, earnings, commission, subsidies, COD outstanding and claims.
- Separate scheduled capacity utilisation from real-time partner availability.
- Show seller-owned fleet software charges independently from marketplace delivery revenue.

## 14. Core data and implementation

**Recommended entities:**

User · Organisation · Membership · PartnerProfile · Vehicle · VerificationRecord · Availability · ServiceZone · RateCardVersion · PreferredPartner · DeliveryJob · JobStop · SlotCapacity · SlotReservation · Quote · PromotionRule · SubsidyReservation · Assignment · TrackingEvent · DeliveryProof · Payment · LedgerEntry · Settlement · CODCollection · Dispute

- Each job retains the accepted quote/rate version, promotion snapshot, payer approvals and assignment history.
- Provider changes must preserve the original job ID and financial trail.
- Use **atomic reservations** to prevent oversold slots and **retry-safe operations** to prevent duplicate bookings or charges.
- Notifications, location updates and external-provider events must tolerate duplicates and out-of-order arrival.
- Define explicit allowed job-state transitions and permission checks.

## 15. Delivery phases and decisions

**MVP:**

- Individual and seller-owned onboarding
- Essential verification
- Preferred/general pool
- Manual fleet onboarding
- Simple rate cards
- ASAP and basic scheduled windows
- Capacity reservation
- Tracking, OTP proof
- Free-delivery rules
- Basic payouts/reconciliation and admin controls

**Later:**

- External-provider APIs
- Advanced fleet dashboards
- Recurring delivery and batching/routing
- Custom-job bidding
- Carefully gated HopNgo combined trips

> HopNgo shared identity and delivery-only capability can be implemented **earlier**, without combined
> passenger/parcel trips.

**Decisions required before development sign-off:**

- Launch zones
- Mandatory verification; allowable non-verified jobs
- Modes and package limits
- Commission/software-fee model
- Rate bands
- Subsidy caps
- COD scope
- Insurance/claims
- Cancellation and return policies
- Scheduling promise
- Privacy retention
- The approved MVP boundary

**Acceptance examples:**

- No overbooking of the last slot.
- No invalid vehicle/package match.
- No unapproved price increase on fallback.
- Seller free delivery still pays the carrier.
- Private riders never receive public jobs.
- Accepted quotes survive rate changes.
- Each failed/cancelled job has traceable settlement/refund treatment.

---

## 16. Implementation clarifications

> Additive notes only. The requirements above are unchanged; anything that alters
> an agreed rule will be recorded here with its date and reason.

- **2026-11-07 — Delivery proof is a prototype.** The drop OTP is verified in the
  browser against the demo constant `DEMO_PROOF_OTP` in
  `src/mock/deliveries.ts` (currently `4821`). This is a placeholder, not an
  approved OTP length, provider or customer-side flow. A production OTP service
  and the customer display remain open decisions.
- **2026-11-07 — Internal status names.** Pickup arrival and drop arrival use the
  internal identifiers `pickup_arrived` and `drop_arrived`. These implement the
  milestones in section 10 and do not change any business rule.
- **2026-11-07 — Completion requires proof.** A job cannot move from
  `drop_arrived` to `delivered` through the normal status action; it closes only
  through the proof check. This follows the section 4 and section 10 requirement
  to verify the drop before completion.
- **2026-11-07 — Dashboard visual alignment.** The partner dashboard now follows
  the latest design reference (light header, three headline stats, six quick
  actions, "Orders" navigation label). No delivery rule, workflow or price
  changed; seller, customer and HopNgo surfaces remain outside this app.
- **2026-11-07 — Onboarding grouping and date of birth.** The onboarding wizard
  is grouped into the five design steps. Address remains part of Personal and
  bank details part of KYC, so the data collected is unchanged aside from a
  required date of birth field shown in the design. No eligibility rule was
  added or removed by this grouping.
