# Changelog

Notable changes to the PicDrop delivery module. Dates use ISO format, newest
first. Firebase authentication (demo OTP bridge) and onboarding persistence are
connected; delivery, earnings, notification and support data remain mock.

## [Unreleased]

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
