# Changelog

Notable changes to the PicDrop delivery module. Dates use ISO format, newest
first. Firebase authentication (demo OTP bridge), onboarding persistence and
the admin-to-partner delivery flow are connected; earnings, notification and
support fixtures remain mock for the offline prototype only.

## [Unreleased]

### Added

- **Real-event notifications.** Live listeners now turn events the partner did
  not create themselves into in-app notifications: a new assigned offer, a
  delivery the Administrator cancelled, an offer that expired or was
  reassigned, and account decisions (approved or suspended) from the
  partner-document watcher. Notifications store translation templates and
  values, so they render in the selected language. When the tab is in the
  background and the partner has granted browser-notification permission, a
  system alert is shown; closed-app push still needs Firebase Cloud Messaging
  plus a Cloud Function.
- **Availability sync.** `partners/{uid}` now carries an `availability` field
  (`Available` / `On Delivery` / `Offline`) alongside `isOnline` and
  `lastLocation`. It flips to `On Delivery` the moment a delivery starts and
  back when it ends, so the console can tell an online partner from a busy
  one. Home shows the busy state, and the Available list explains that an
  active delivery blocks accepting another offer.

### Added

- **A new offer is now impossible to miss.** The partner app shows a global
  Accept/Reject card on every screen, plays a short generated chime and vibrates
  where supported. Notification rows deep-link to Orders, Profile or Earnings.
  Expired offers leave the list on a one-second clock, and Accept/Reject is
  disabled while another delivery is active.
- **Text handover proof.** Closing a delivery with the customer's OTP can also
  store a recipient name, a short handover note and the last GPS fix in `proof`.
  This keeps the flow usable without photo, video or audio storage.
- **Test delivery code.** Development builds accept `4821` in the delivery OTP
  field as a test override, configurable with `VITE_DEMO_DELIVERY_OTP` and
  disabled in production unless explicitly set. The administrator-issued
  `dropOtp` remains the primary check, and overrides are marked in `proof`.
- **Live earnings.** The Earnings screen now derives today/week/month totals,
  average per delivery, chart buckets and recent jobs from completed deliveries,
  matching the dashboard. Payout and incentive sections stay honest demo/empty
  records until settlement is connected.
- **Month earnings drill-down.** Month bars now use the calendar buckets 1–6,
  7–12, 13–18, 19–24 and 25–end. Hovering a bar shows its amount; clicking it
  opens the completed deliveries for that date range.
- **Refresh restores Home and presence.** A real page reload returns to Home,
  keeps the signed-in session, and restores the last online/offline state from
  `partners/{uid}`. Explicit sign-out still writes the partner offline.
- **Live support tickets.** The Support screen now subscribes to
  `support_tickets`, so tickets and status updates survive a refresh. Reporting
  a delivery issue creates a ticket automatically.
- **Contact fallback.** Live deliveries without a usable customer number disable
  the Contact action and show a support hint instead of opening an empty dialer.
- **Dark mode.** The moon/sun button in the Home header’s top-right corner
  switches the entire partner app between the light and dark palettes, persists
  under `fafo.partner.theme`, and is applied before first paint. Cards, text,
  borders, status tones, inputs, alerts and map controls all have dark variants.
- **Map follow mode.** The partner map fits once per delivery instead of
  refitting on every GPS fix, and the follow control pans to new fixes while it
  is enabled.
- **Current location section.** The active-delivery screen now groups the live
  map, route, follow control and location-sharing status under a clear
  **Current location** heading.
- **Persisted notifications.** Live notifications are stored as text in
  `notifications/{uid_eventId}` and the read state is written back, so the list
  survives a reload. The Profile preference now persists and mutes the chime and
  browser alert without hiding the visual request card.
- **Rejection reasons.** Rejecting an offer now asks for a short reason and
  stores it in `partnerResponse.reason` for operations.
- **Text-only onboarding.** Profile-photo and document upload controls are
  hidden while no media storage is configured; KYC numbers are reviewed
  manually. The upload code remains behind `src/config/media.ts`.
- **Wake lock during a delivery.** The app requests a Screen Wake Lock while a
  delivery is active where supported, reducing screen-sleep interruptions to
  foreground GPS.

### Fixed

- **The earnings chart now renders live bars.** Bars use fixed pixel heights
  inside a bounded plot area instead of percentage heights that resolved to
  zero, and they recompute from completed deliveries as `history` updates.
- **Admin-assigned offers reach the partner app again.** Delivery assignment and
  cancellation writes now target `deliveries/{deliveryId}` explicitly instead of
  the configured partners collection, so the live listener in the partner app
  receives the offer. An offer previously written under
  `partners/{deliveryId}` never appeared in Orders.
- **Online presence no longer depends on GPS permission.** `isOnline` and
  `availability` publish immediately when the partner goes online, even when
  geolocation is denied or unavailable; only the location fields wait for a fix.
  The deployed Firestore Rules were refreshed so these profile writes are
  accepted.

### Changed

- **The demo OTP is gone from live sessions.** Delivery completion verifies the
  customer's code against the `dropOtp` the console issued with the assignment.
  Offers without a code cannot be completed — the screen explains that
  operations must verify the drop — and the "Demo build: use 4821" hint only
  exists in the offline prototype. The tracking chip on the active-delivery
  screen also shows when the partner's position was last updated.

### Added

- **Assigned deliveries arrive live from the Administrator console.** When
  `delivery_admin` assigns a linked partner, the console publishes an offer to
  `deliveries/{id}` (category, pickup/drop coordinates, distance, ETA, payout,
  item count, payment mode, customer drop code, expiry window) and the partner
  app receives it through a Firestore `onSnapshot` listener filtered to the
  signed-in UID — no polling or refresh. Request cards show an honest countdown
  from the offer's absolute expiry, plus loading, empty and error states with
  per-request pending spinners.
- **Atomic acceptance and rejection.** Accepting re-reads the offer inside a
  Firestore transaction, so an expired, cancelled, reassigned or already-taken
  request fails with an actionable message instead of a double assignment;
  Firestore rules independently enforce the `assigned → accepted` transition
  and reject any partner write that touches console-controlled fields.
  Rejecting records `partnerResponse` without changing the status, and the
  request leaves the partner's list.
- **Transactional delivery lifecycle.** `accepted → pickup_arrived → picked_up
  → in_transit → drop_arrived → delivered/cancelled` each write timestamped
  events to the shared document in a transaction, so retries are idempotent and
  the console's tracking view follows progress within seconds. Completion
  verifies the customer's OTP against the console-issued `dropOtp` (demo
  fallback `4821` remains for sessions without a console code); cancellation
  records a reason.
- **Live GPS sharing on the delivery document.** While a job is active,
  `watchPosition` fixes that moved at least 25 m (or once a minute) and are
  accurate to 150 m or better are published to `currentLocation` with latitude,
  longitude, accuracy and timestamp; the console's tracking map shows the
  partner's latest position. Sharing status (active, paused in background,
  denied, unavailable, unsupported) is shown honestly on the active-delivery
  screen, stops at completion or cancellation, and the watcher is always
  cleaned up.
- **Interactive OpenStreetMap delivery map.** The active-delivery screen now
  uses a Leaflet map with distinct pickup, drop and partner markers, a route
  line from an OSRM-compatible provider focused on the current leg, a recentre
  control and required OSM attribution. Tile and routing providers are
  configurable via `VITE_MAP_TILE_URL` and `VITE_ROUTE_API_BASE`; missing or
  invalid coordinates show a location-unavailable state, and a failed route
  fetch only hides the line. Per-leg external turn-by-turn navigation links
  were added beside the pickup and drop cards.
- `firestore.rules` now allow only the administrator UID to create delivery
  documents, restrict partner updates to partner-owned fields plus the valid
  forward status path (including `assigned → accepted`), and keep location
  writes limited to the assigned partner.
- The Admin console's delivery dialog gained category, item count, payment
  mode and an editable partner-payout field with a distance-based suggestion;
  assignments generate a 4-digit delivery code shown on the delivery detail
  page and published with the offer.

### Changed

- **A new number no longer receives any demo data.** Every demo fixture is now
  confined to the offline prototype (Firebase unconfigured, or the connection
  failed and the app fell back to the device-only session). A signed-in
  Firebase account — including a brand-new number — starts with empty
  notifications, empty support tickets and empty delivery lists, and fills only
  with real records. The Home dashboard figures (deliveries today, earnings
  today) are computed from real completed deliveries and the rating cell shows
  "New" until a rating source exists. Profile no longer shows the demo partner
  ID (`FDP-10248`), the demo 4.8 rating or the demo name fallback: it renders
  the onboarding record, the verified number and the Administrator's partner ID
  once approved. The Earnings screen shows the labelled demo dataset only for
  the offline prototype; live accounts see an honest "No earnings recorded yet"
  state. The unused `src/mock/partner.ts` fixture was removed.
- Mock delivery requests are isolated to the offline prototype. A signed-in
  Firebase account derives its requests, active delivery and history entirely
  from Firestore; demo sessions (Firebase unconfigured or connection failed)
  keep the previous local flow. Delivery actions became async across the
  context so screens navigate only after a write lands, with a shared pending
  state and one actionable error message.

### Fixed

- The Home application-status card is now removed after an Administrator
  approves the KYC application, so an approved partner sees the availability
  control and delivery overview without the approval prompt. Submitted,
  under-review and rejected applications still show their status card.
- Re-entering an already registered mobile number now resumes its submitted
  application instead of reopening the onboarding wizard. The demo bridge uses a
  stable Email/Password Firebase account derived from the number, so the same
  number keeps one UID across sign-outs, number switches, browser restarts,
  cleared browser data and devices. An existing anonymous device account is
  linked to the stable credential on its next sign-in, preserving its Firestore
  records. If a newly created stable UID has no Firestore application, a
  submitted or fully completed local application for the same number is restored
  to it. Firestore is read from the server before an application is treated as
  missing, sign-in-only snapshots can no longer downgrade a submitted state, and
  a failed restore shows a retry banner instead of reopening the wizard. The
  sign-in record is not rewritten for a reused account, so the merge write cannot
  briefly hide the submitted document. App sign-out still keeps the device's
  Firebase session for demo continuity. This identity bridge is demo-only; real
  phone verification remains the production path.
- Explicit sign-out no longer saves the protected page as the next sign-in
  destination. Signing out from Profile or the onboarding wizard and entering the
  OTP returns an approved partner to the dashboard instead of reopening the page
  they left.

### Added

- An already-onboarded partner now returns straight to the dashboard on a fresh
  app launch or new tab. A remembered Firebase session is restored only when
  Firestore confirms a submitted or reviewed application and the partner has not
  signed out; sign-in-only and draft accounts start at login. Reloading the
  running tab keeps the session, and a submitted device-only demo session also
  restores.
- delivery_admin now shows a partner who has only signed in as **KYC pending** in
  the KYC Review queue, with approval disabled until onboarding is submitted.
  Synced partner records refresh automatically every 60 seconds and when the
  window regains focus.
- The active-delivery route preview now uses OpenStreetMap raster tiles instead
  of the illustrative SVG. Pickup and destination coordinates position the two
  markers, and the map carries OpenStreetMap attribution. No API key or new
  dependency is required; routing, distance and ETA remain mock data.
- KYC document uploads are now optional. Aadhaar and PAN numbers remain
  validated, but the Aadhaar, PAN, licence, RC and passbook files do not block
  submission. If Storage is unavailable, the submission stores document
  metadata and the small profile preview inline in Firestore; uploads still run
  when Storage is configured and files are selected. If a file upload fails, the
  review step now offers **Submit without documents** as an explicit retry.
- The profile photo is now optional during onboarding, matching the KYC and bank
  uploads. All required text fields, document numbers and applicable vehicle
  details remain validated, but no upload blocks progress or submission; a
  selected photo still uploads and appears on Home and Profile.
- The KYC step now shows driving-licence and vehicle-RC number fields beside
  their upload controls; both fields share state with the vehicle step. The
  upload tile's hidden file input now has a positioning context, so opening the
  bank-passbook picker no longer jumps the onboarding form to the top.
- Firebase authentication and onboarding persistence. The login screens verify
  the demo OTP (`123456`) — the default path until the project's own OTP API is
  connected — and, when `VITE_FIREBASE_*` is configured, sign the verified
  number in with an anonymous Firebase session so Firestore and Storage enforce
  the UID rules. The retained phone-SMS functions stay in the service layer. On
  submit, the profile photo and KYC files upload to Storage while `partners`,
  `partner_documents`, `vehicles` and `training_progress` records are written to
  Firestore and reloaded on the next sign-in. Added owner-only Firestore and
  Storage rules plus `firebase.json`; the application-status demo switcher is
  hidden when Firebase is active.
- Firebase connection status is now visible. When the anonymous session fails,
  every signed-in screen shows the Firebase error code with a **Retry
  connection** action, and onboarding submission is blocked instead of storing
  a local-only "submitted" state. Submission failures also show the Firebase
  error code (for example `permission-denied` or a `storage/…` code). A Storage
  bucket preflight now reports `storage/bucket-not-found` immediately when the
  project has no default bucket, instead of leaving the submit spinner running
  through the upload retry window.
- A successful demo-OTP sign-in now leaves a visible trace in Firebase: the
  anonymous Auth user's display name is the verified mobile number, and
  `partners/{uid}` is written immediately with `phone`, `authProvider` and
  `lastSignInAt`. Onboarding later merges its fields into the same document.
- Firebase SDK foundation: installed `firebase@13`, added `src/firebase/config.ts`
  and `src/firebase/index.ts` with single-instance `auth`, `db` and `storage`
  exports, and documented the `VITE_FIREBASE_*` template. `.env.local` is
  git-ignored and was never committed. Existing screens still use mock data
  because no service layer is connected yet.
- The KYC step collects the Aadhaar and PAN numbers beside their upload tiles
  and provides upload cards for the driving licence and vehicle RC. For bike
  and scooter partners, the licence and registration numbers are also required
  on the vehicle step.
  The bank account row gains an optional passbook or cancelled-cheque upload.
  All numbers, file names and upload states persist with the draft, validation
  follows the selected language, and earlier drafts migrate their Aadhaar
  number automatically.
- Full app localization: Profile → App language switches every screen, shared
  component, validation message, notification and FAQ immediately between
  English, Hindi and Bengali. The choice persists under `fafo.partner.language`,
  and dates, times and rupee amounts follow the selected `en-IN`, `hi-IN` or
  `bn-IN` locale. Names, addresses, IDs and delivery content stay as entered.
- A slim, brand-tinted scrollbar on the right edge of the app column. The app
  shell now owns vertical scrolling, so the scrollbar sits beside the phone-like
  layout instead of at the browser edge, and each route change resets the
  scroller to the top. Auth screens use the same scroll treatment.
- Application status tracking under Profile → Application status: pending,
  submitted, under review, approved and rejected, with submitted/last-update
  dates and a four-step progress timeline. Home and the submitted screen show
  the current stage, and a labelled demo control previews each verification
  state. The final tracker step stays "Decision" until an outcome exists.
- KYC document uploads are capped at 2 MB per file. Larger images or PDFs are
  rejected with an inline error before the file name is recorded, and the KYC
  step states the limit up front. The profile photo uses the same 2 MB cap and
  shows it in the upload helper.
- Onboarding is now isolated per verified mobile number. A new number starts
  with a blank application instead of inheriting another demo account's
  submission, and draft applications are redirected back to the wizard until
  they are submitted. The wizard header offers Sign out; the demo OTP remains
  `123456`.
- Required profile photo during onboarding. The personal step now blocks
  progress until a photo is uploaded, stores a downscaled 256px preview, shows
  it in review, Home and Profile, and rejects non-images or files over 2 MB.
- On-foot delivery option in onboarding alongside bike, scooter and bicycle.
  Walking partners are not asked for a vehicle model, colour or registration,
  and the profile and review screens show "On foot".
- Drop-arrival milestone in the delivery lifecycle: accepted → pickup arrived →
  picked up → on the way → drop arrived → delivered, each recorded with a
  timestamp.
- Delivery proof step: the active delivery screen asks for the customer's
  delivery OTP at drop arrival and records the verified proof on the job.
- `CHANGELOG.md`, plus delivery implementation status in the requirements
  documents.

### Changed

- Restrained UI polish pass: shared cards use a one-pixel neutral shadow, a new
  `IconTile` primitive gives Home quick actions, Profile contact/document rows
  and onboarding step headings a consistent soft-purple anchor, inputs and
  selects share a 12px radius with explicit disabled styling, and the auth card
  now overlaps the brand header. Palette, layout and flows are unchanged.
- The onboarding wizard now hides the bottom navigation while a draft
  application is being completed, so the KYC form uses the full screen. The
  submitted confirmation and every other section keep the navigation.
- UI pass against AI-template tells: removed the purple hue gradients, decorative
  header blobs and coloured shadows, flattened cards and buttons, replaced the
  dashboard's repeated icon cards with a quiet stat strip and a two-column tool
  list, removed emoji greetings and uppercase tracked labels, and raised the
  smallest labels to 11px. Empty states and the desktop backdrop were flattened
  too. Palette, flows and features are unchanged.
- Every section now has a back control in its header: Orders, History, Earnings
  and Profile gained one, and Support, Active delivery and the 404 screen now
  have deterministic fallbacks (Home, Orders and Home respectively) instead of a
  raw history back. Home stays without one because it is the app root.
- Onboarding rebuilt to the design's five steps (Personal, KYC, Vehicle,
  Training, Review) with a purple stepper header, KYC document status rows,
  vehicle-type tiles and a review screen. Address and bank fields were kept,
  grouped into Personal and KYC.
- Onboarding now renders inside the standard app shell, so the bottom navigation
  stays available on every authenticated screen (including each setup step and
  the submitted-application screen).
- Partner dashboard restyled to the latest design: light header with avatar and
  greeting, compact availability card, three headline stats and a six-tile
  quick-action grid.
- Bottom navigation label "Deliveries" is now "Orders", and the corresponding
  screen heading uses the same wording.
- Renamed the `reached_pickup` status to `pickup_arrived` and introduced
  `drop_arrived`; lifecycle helpers now live in `src/utils/delivery.ts`.
- "On the way" no longer completes a delivery by itself; the job must reach the
  drop and pass the proof check.

### Fixed

- Reloading a restored, submitted session no longer lands in the onboarding
  wizard. The offline location publish now waits for the initial Firestore
  onboarding read, so a merge write cannot make the partner document look like a
  location-only sign-in record.
- A fresh app launch or new tab now starts at the login screen unless Firestore
  confirms a submitted or reviewed application, so a sign-in-only account no
  longer restores the previous Firebase session straight into the dashboard.
  Reloading the running tab still keeps the session. Starting a new sign-in while
  already signed in no longer redirects back to the old session, so a different
  mobile number reaches the OTP screen.
- A late Firebase sign-out callback no longer clears a local demo fallback
  session, so an offline sign-in stays in the onboarding wizard with the
  connection banner instead of dropping back to the login screen.
- Onboarding is now enforced when Firebase is configured but the session falls
  back to the device-only demo account. That session starts as a draft in the
  wizard and no longer reuses a stale locally approved application to reach the
  dashboard.
- Orders no longer lists or allows accepting requests while the partner is
  offline; the Available tab shows an offline state with a "Go online" action,
  matching the dashboard and the availability rule.
- Bicycle onboarding no longer demands a vehicle registration number; the field
  is hidden for bicycles and the review summary shows the vehicle type instead.
- Date of birth is now validated: future dates and partners under 18 are
  rejected with clear messages.
- The profile action now reads "Continue partner setup" for a draft application
  and "View partner details" once submitted, instead of promising an edit that
  the submitted screen does not offer.
- The 404 screen subtitle no longer claims a missing route is "not part of the
  app yet".
- Submitting the onboarding application now shows the "Application submitted"
  confirmation screen instead of jumping straight to the dashboard; the screen
  was previously only reachable by reopening `/onboarding`.

### Notes

- The OTP is compared against the demo constant `DEMO_PROOF_OTP` in
  `src/mock/deliveries.ts`. Real OTP issuing, delivery and verification are not
  implemented.
- No automatic commit or push: changes await the owner's review.
