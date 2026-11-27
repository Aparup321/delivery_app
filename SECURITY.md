# Security notes

This is the shared security posture of the PicDrop + HopNgo delivery-partner app
and the delivery_admin operations console. It covers what is protected in the
clients, what Firebase enforces, and what still needs a production backend.
Last reviewed: 27 November 2026.

> **Demo authentication is not production authentication.** The fixed login OTP
> (`123456`) and the fixed demo Email/Password credential in
> `src/services/auth.ts` are public. Anyone who knows a partner's mobile number
> can sign in as that partner. Replace this bridge with the project's real OTP
> API before public traffic.

## 1. Summary

| Area | State |
| --- | --- |
| Cross-site scripting (XSS) | React escapes all data. One Leaflet tooltip HTML sink in the admin console was removed in this review; CSV exports neutralise formulas. |
| SQL injection | Not applicable — there is no SQL database. Firestore is a document store queried through the typed SDK. |
| Broken access control | Per-UID Firestore and Storage rules; field allow-lists and nested-value bounds for partner writes. Hardened in this review. |
| Denial of service (DDoS) | Static client, no app server. Firebase/Google absorb volumetric traffic. App Check, quotas and budgets are the practical controls; see §7. |
| Secret handling | `.env*` ignored, only public Firebase web config is shipped. |
| Dependency risk | `npm audit` clean after the `@grpc/grpc-js` override; re-run before each release. |
| Production authentication | **Not ready** — the demo OTP/password bridge must be replaced. |

## 2. XSS

- No `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval`,
  `new Function` or `javascript:` URLs exist in either app's `src/`.
- React renders every Firestore, onboarding and delivery value as text, so
  quotes and angle brackets cannot break out of the DOM.
- The admin console's Leaflet map passed marker labels (partner names and
  free-text addresses) to `bindTooltip()` as strings. Leaflet treats strings as
  HTML, so labels are now passed as a text node instead.
- Admin KYC links are restricted to absolute `http:`/`https:` URLs
  (`delivery_admin/src/utils/url.ts`), blocking `javascript:` and `data:` links
  from Firestore. Admin request diagnostics also redact API-key query values.
- Audit-log CSV export quotes cells and prefixes formula starters (`=`, `+`,
  `-`, `@`, tab) to prevent spreadsheet formula injection.
- External links use `rel="noopener noreferrer"`.
- The customer phone is reduced to digits before it is placed in a `tel:` link.
- Navigation URLs validate coordinates and URL-encode them.
- Oxlint rejects `react/no-danger`, `no-eval`, `no-implied-eval`, `no-new-func`
  and `no-script-url` as errors in the partner app, so a future change cannot
  quietly introduce an injection sink.

If HTML rendering is ever required, sanitise it with a maintained library
(for example DOMPurify) and never feed it raw Firestore data. Remember that
third-party widget APIs (Leaflet, chart tooltips, map popups) may interpret
strings as HTML even when the surrounding app does not.

## 3. Firestore rules (`firestore.rules`)

Rules are the server-side boundary. A client can be modified, so nothing in the
UI is treated as a security control.

- `partners/{uid}` — read/write only by the owner or the administrator UID.
  Partners may update profile and presence fields only; status, review,
  suspension and partner IDs stay administrator-owned. Profile text, pincode,
  bank, presence coordinates and timestamps are length/format/type bounded.
- `deliveries/{id}` — only the assigned partner or the administrator can read.
  Partners cannot create, delete or reassign a delivery. They may update only
  lifecycle fields, and only along the allowed status transitions. The data they
  add (`proof`, `currentLocation`, `events`, `partnerResponse`,
  `cancellationReason`, timestamps, `adminStatus`) is type- and size-bounded; a
  proof can only exist on a delivered job.
- `notifications/{id}` — only the owner reads/writes their feed; title, body,
  translation variables and timestamps are capped.
- `support_tickets/{id}` — only the owner or administrator reads. Creation must
  be `Open`, with bounded subject/message; the partner cannot close a ticket.
- `partner_documents`, `vehicles`, `training_progress` — owner or administrator,
  and only while the application is open. Partners cannot write the
  administrator's `adminDocuments` review map, and every nested document/file
  value is bounded.
- `admin_state` — administrator only.

Deploy after any rule change:

```bash
firebase deploy --only firestore:rules
# After Cloud Storage is initialised in the Firebase console:
firebase deploy --only storage:rules
```

Rules are **not** hot-reloaded from source; the deployed copy is what protects
production. Check the Firebase Console → Firestore → Rules tab after deploying.
On this project Cloud Storage has not been initialised yet, so the storage
command fails until the bucket is created in the Firebase console.

`firebase deploy --only firestore:rules --dry-run` compiles the rules. It does
not exercise read/write scenarios; add a rules unit-test suite with the Firestore
emulator before relying on a rule change for a production release.

## 4. Storage rules (`storage.rules`)

- Each partner can read/write only `partners/{their-uid}/**`, and only the
  documented `profile/` and `documents/{aadhaar|pan|licence|registration|passbook}/`
  paths.
- Writes are limited to 2 MB and images or `application/pdf`.
- `image/svg+xml` is rejected: SVG can contain markup and script and must not be
  opened from Storage as a trusted document.
- Firestore stores metadata and paths, not file contents.
- Download URLs contain Firebase Storage access tokens. Treat them as
  sensitive; anyone holding the URL can read the file even if the Storage rules
  deny direct SDK reads. If that is unacceptable, store only the path and have
  the administrator download through an authenticated backend.

Uploads are currently disabled in the test build (`src/config/media.ts`). When
re-enabled, add a server-side virus scan or image re-encode before treating
uploads as trusted. The Storage rules do not yet stop an owner from overwriting
or deleting a previously reviewed file at the same path; add the cross-service
`firestore.get()` check described in the Firebase docs once cross-service rules
are enabled.

## 5. Authentication and sessions

- Firebase Auth issues the UID used by every rule; the partner app uses the SDK's
  persistence.
- The admin console signs in through the Identity Toolkit REST API. It keeps the
  short-lived ID token in `sessionStorage` and the long-lived refresh token in
  `localStorage` so the console reconnects after a restart. Any script running on
  the console origin can read that refresh token, which is why the strict CSP and
  the absence of third-party scripts matter. The persisted session is rejected
  after 30 days, forcing a fresh sign-in. Signing out clears all sessions and
  the pasted partner token; it does not revoke an already-stolen refresh token.
  Revoke the account's refresh tokens from the Firebase Admin SDK if that
  happens.
- Neither app stores a password in Firestore or logs it.
- The demo bridge derives a stable Email/Password account from the mobile number
  and reuses it across devices. It is convenient for demos and **not secure**:
  - the OTP is fixed in the bundle;
  - the demo account password is fixed in the bundle;
  - there is no rate limit or attempt lockout in the client.

- Administrator roles and section permissions in the console are UI-level RBAC.
  Firestore authorises one hardcoded administrator UID. Adding a second Firebase
  administrator means either adding that UID to the rules (full data access) or
  moving role checks to custom claims/a server-side backend. Do not describe the
  in-console role screen as a server-enforced control.

Before launch:

1. Connect the real OTP API and delete the demo OTP/password path.
2. Disable the Email/Password provider if it is no longer needed.
3. Set Firebase Auth authorised domains and restrict the web API key by HTTP
   referrer in Google Cloud.
4. Enable Firebase Auth email-enumeration protection and a strong password
   policy. If MFA or SSO is required, put the console behind an identity-aware
   proxy or extend the current REST sign-in flow.
5. Review `partners` records created by the demo bridge and remove test accounts.
6. Replace the hardcoded administrator UID with custom claims or a backend that
   enforces the same RBAC as the console.
7. Review the 30-day absolute lifetime for the persisted admin refresh token
   against the organisation's session policy.

## 6. Data exposure

- The partner sees only their own records.
- The admin console caches the shared workflow, partner records and KYC metadata
  in `localStorage`. That cache can contain customer and partner personal data.
  It is scoped to the browser profile; sign out and clear site data when the
  console is used on a shared machine.
- The partner app keeps an onboarding draft in `localStorage`, including the
  entered name, address, bank account details, Aadhaar/PAN numbers and document
  file names. It is device-local and is not sent until submission, but any
  script on the origin (or anyone with the unlocked device) can read it. Clear
  browser data after testing on a shared device.
- `dropOtp` is stored on the delivery document. Firestore rules are
  document-level, so the assigned partner can technically read the field before
  handover. A determined user can therefore bypass the client-side OTP check.
  The real fix is to keep the code in an administrator/server-only collection
  and verify it in a Cloud Function or trusted API. Until then, treat the OTP as
  a workflow guard, not a security control.
- Customer phone numbers are shown only to the assigned partner; the console
  also stores a masked copy for display. Customer names, addresses and phone
  numbers are stored in delivery documents and the shared admin workflow.
- Pickup/drop search and reverse geocoding call the public Nominatim service;
  the delivery app sends coordinates to the public OSRM demo server for route
  geometry. Those requests leave the app and are subject to the providers'
  policies. Use a self-hosted or contracted geocoder/router before handling real
  customer addresses at scale.
- If `VITE_DEMO_DELIVERY_OTP` is set in a production build, a fixed code can
  complete a delivery. Leave it unset in production.
- No customer card or payment credentials are handled in this app. COD amounts
  are display-only. Partner payout bank details are stored on the partner
  document and are visible to the owner and the administrator.

## 7. DDoS and abuse

A static SPA has no app server to flood, and Firestore/Storage/Auth are served by
Google infrastructure. Volumetric attacks are absorbed at that layer; the
remaining risk is **application-level abuse and cost**, for example scripted
account creation or excessive reads/writes.

Do these in the Firebase/Google Cloud console (not in the client):

1. **Enable App Check** for Auth, Firestore and Storage.
   - Create a reCAPTCHA v3 site key.
   - Register it in Firebase Console → App Check.
   - Set `VITE_RECAPTCHA_SITE_KEY` in the deployment environment.
   - Turn on enforcement per service after monitoring looks healthy.
   - The partner app already initialises App Check when that variable is present;
     local debug tokens can be set with `VITE_APP_CHECK_DEBUG_TOKEN`.
   - The admin console uses REST rather than the Firebase SDK and currently does
     not send App Check tokens. If enforcement is turned on, add an App Check
     token to its REST requests first or move the console to the Web SDK.
2. **Set budget alerts and quotas** in Google Cloud Billing so a scripted loop
   cannot run up an unbounded bill. Set Firestore daily read/write/delete limits
   where the plan allows.
3. **Restrict the API key** to the production domains and required Google APIs.
4. **Serve through Firebase Hosting or another CDN** with caching; do not expose
   a single origin server.
5. **Monitor Auth sign-ups** for bursts from one IP/ASN. Real OTP delivery plus
   App Check is the effective mitigation; client-side timers are not.
6. **Keep polling bounded.** The console refreshes every minute, the tracking
   page every 10 seconds only while visible, and pauses until the next Pacific
   reset after a Firestore quota error. Do not lower those intervals without
   checking the project's daily read quota.

## 8. Security headers and CSP

### Admin console

`delivery_admin/firebase.json` now sends the following on every response:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
X-Permitted-Cross-Domain-Policies: none
Content-Security-Policy: default-src 'self'; script-src 'self';
  script-src-attr 'none'; style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://tile.openstreetmap.org https://*.tile.openstreetmap.org;
  connect-src 'self' https://firestore.googleapis.com
  https://identitytoolkit.googleapis.com https://securetoken.googleapis.com
  https://nominatim.openstreetmap.org;
  font-src 'self' data:; object-src 'none'; frame-src 'none';
  frame-ancestors 'none'; base-uri 'none'; form-action 'self';
  manifest-src 'self'; upgrade-insecure-requests
```

`style-src 'unsafe-inline'` is required by Leaflet's positioning styles; it is
not a script-execution path. Verify the CSP after changing map tiles or Firebase
endpoints. The console has no inline scripts, so `script-src 'self'` can stay
strict.

### Delivery-partner app

The partner app has no hosting config in this repository. Add these at the
host/CDN layer (Firebase Hosting `headers`, Vercel, Netlify or a reverse proxy).
A `<meta>` CSP is weaker and must not be the only control, especially because
`frame-ancestors` is ignored in `<meta>`.

Minimum headers:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(self), camera=(), microphone=()
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Content-Security-Policy: frame-ancestors 'none'; object-src 'none'; base-uri 'self'
```

A full CSP must allow Firebase Auth, Firestore, Storage, Google Fonts, the map
tiles, OSRM and the reCAPTCHA/App Check script. The theme bootstrap in
`index.html` is an inline script, so either move it to a small external file or
add its SHA-256 hash before removing `'unsafe-inline'` from `script-src`.
Test sign-in, onboarding, map loading and video playback after enabling a CSP.

## 9. Dependency and build hygiene

- `npm audit --omit=dev` is clean at the time of writing after pinning
  `@grpc/grpc-js` to 1.13.6 (the version Firebase's Firestore SDK pulled was
  below the patched release).
- A full `npm audit` in `delivery_admin` reports Vite/esbuild advisories that
  affect only the local development server (source disclosure / Windows path
  bypass). They are not in the production bundle. Bind the dev server to
  localhost, never expose it to a network, and plan the Vite major upgrade before
  treating `npm audit` as clean.
- Run `npm audit`, `npm run typecheck`, `npm run lint` and `npm run build` before
  each release.
- Production source maps are off by default; do not publish them.
- No secrets are committed. `.env`, `.env.local` and every other `.env.*` file
  are ignored; only `.env.example` is tracked.
- `VITE_*` values are embedded in the browser bundle. Only public Firebase web
  configuration, map URLs and public keys belong there.

## 10. Residual risks — owner decisions before launch

These are known and intentional for the current demo. They are not fixed in the
client because they need a backend, a Firebase console change, or a product
decision:

1. Demo OTP and fixed demo Email/Password credential (public by design).
2. Administrator refresh token in `localStorage` for up to 30 days, until
   sign-out/revocation.
3. One hardcoded administrator UID; console role permissions are UI-only.
4. `dropOtp` is readable by the assigned partner and verified client-side.
5. KYC download URLs carry access tokens and bypass Storage read rules.
6. Storage rules do not stop an owner replacing an already-reviewed file.
7. App Check is optional and not wired into the admin console's REST calls.
8. `admin_state/operations` is a single last-write-wins document approaching the
   Firestore 1 MB limit; it needs archival or a collection/backend redesign.
9. The partner app has no hosting security headers committed in this repo.

## 11. Reporting

Report a vulnerability privately to the project owner. Do not open a public
issue with reproduction steps involving real accounts or customer data.
