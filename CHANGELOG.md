# Changelog

Notable changes to the PicDrop delivery module. Dates use ISO format, newest
first. Firebase authentication (demo OTP bridge) and onboarding persistence are
connected; delivery, earnings, notification and support data remain mock.

## [Unreleased]

### Added

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
  error code (for example `permission-denied` or a `storage/…` code). Storage
  retries are capped at about 15 seconds so a missing bucket fails visibly
  instead of leaving the submit spinner running.
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
  and provides upload-only cards for the driving licence and vehicle RC. For
  bike and scooter partners, the licence and registration numbers are now
  entered on the vehicle step instead of in KYC, and both are required there.
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
