import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Records a partner sign-in in Firestore as soon as the demo OTP flow creates
 * the Firebase session. This makes the mobile number visible in the Firebase
 * console under `partners/{uid}` before onboarding is submitted; the
 * onboarding write later merges into the same document.
 */
export async function recordPartnerSignIn({
  uid,
  phone,
}: {
  uid: string
  phone: string
}): Promise<void> {
  if (!db) {
    return
  }

  const now = new Date().toISOString()

  await setDoc(
    doc(db, 'partners', uid),
    {
      partnerId: uid,
      phone: `+91${phone}`,
      authProvider: 'demo-otp',
      lastSignInAt: now,
      updatedAt: now,
    },
    { merge: true },
  )
}

/**
 * Returns the demo mobile number recorded on `partners/{uid}`. Recovery uses
 * it when this browser lost the local phone-to-UID key: the Firebase account is
 * still the same partner, so the number signs in without creating a new UID.
 * Returns null when the read itself failed, so the caller never mistakes an
 * unavailable record for a new account and orphans a submitted application.
 */
export async function loadPartnerPhone(uid: string): Promise<string | null> {
  if (!db) {
    return ''
  }

  try {
    const snapshot = await getDoc(doc(db, 'partners', uid))
    if (!snapshot.exists()) {
      return ''
    }

    const phone = snapshot.data().phone
    return typeof phone === 'string' ? phone : ''
  } catch {
    return null
  }
}
