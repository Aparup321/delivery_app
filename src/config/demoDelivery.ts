/**
 * Test-only delivery completion code. The administrator-issued `dropOtp`
 * remains the primary check; this code is accepted only when explicitly
 * enabled through `VITE_DEMO_DELIVERY_OTP` (or the development default).
 *
 * Leave this empty in production builds. It is intentionally not a login code.
 */
const configured = (import.meta.env.VITE_DEMO_DELIVERY_OTP ?? '').trim()

export const demoDeliveryOtp =
  configured || (import.meta.env.DEV ? '4821' : '')

export const demoDeliveryOtpEnabled = /^\d{4}$/.test(demoDeliveryOtp)
