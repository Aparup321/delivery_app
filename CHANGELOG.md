# Changelog

Notable changes to the PicDrop delivery module. Dates use ISO format, newest
first. All current functionality is mock-driven; nothing here is connected to a
backend.

## [Unreleased]

### Added

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
  it in review, Home and Profile, and rejects non-images or files over 5 MB.
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
