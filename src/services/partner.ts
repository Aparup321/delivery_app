import { doc, setDoc } from 'firebase/firestore'
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
      authProvider: 'anonymous',
      lastSignInAt: now,
      updatedAt: now,
    },
    { merge: true },
  )
}
