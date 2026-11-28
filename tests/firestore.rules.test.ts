import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const PROJECT_ID = 'demo-picdrop-rules'
const ADMIN_UID = 'Xa09IjoJrhPBvuJVWALOuCCHcvZ2'
const OWNER_UID = 'partner-owner-uid'

test('Firestore rules protect partner, KYC and admin-only data', async () => {
  const env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: await readFile('firestore.rules', 'utf8') },
  })
  try {
    const owner = env.authenticatedContext(OWNER_UID).firestore()
    const other = env.authenticatedContext('different-partner').firestore()
    const admin = env.authenticatedContext(ADMIN_UID).firestore()
    const anon = env.unauthenticatedContext().firestore()

    await assert.rejects(() => getDoc(doc(anon, 'partners', OWNER_UID)))

    await assertSucceeds(setDoc(doc(owner, 'partners', OWNER_UID), {
      partnerId: OWNER_UID,
      fullName: 'Rules Test Partner',
      phone: '+919000000001',
      status: 'pending',
      applicationStatus: 'submitted',
      statusUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    await assert.rejects(() => getDoc(doc(other, 'partners', OWNER_UID)))
    await assertSucceeds(getDoc(doc(admin, 'partners', OWNER_UID)))

    await assertFails(setDoc(doc(owner, 'partners', 'not-the-owner'), {
      partnerId: 'not-the-owner',
      fullName: 'Spoofed',
    }))

    await assertSucceeds(setDoc(doc(owner, 'partner_documents', OWNER_UID), {
      partnerId: OWNER_UID,
      documentNumbers: { aadhaar: '123412341234', pan: 'ABCDE1234F', licence: 'WB-123' },
      documents: {},
      updatedAt: new Date().toISOString(),
    }))
    await assertSucceeds(getDoc(doc(admin, 'partner_documents', OWNER_UID)))
    await assert.rejects(() => getDoc(doc(other, 'partner_documents', OWNER_UID)))

    await assertFails(setDoc(doc(owner, 'partner_documents', OWNER_UID), {
      partnerId: OWNER_UID,
      documentNumbers: { aadhaar: '123412341234', pan: 'ABCDE1234F', licence: 'WB-123' },
      documents: {},
      adminDocuments: { aadhaar: { status: 'Verified' } },
      updatedAt: new Date().toISOString(),
    }))

    await assert.rejects(() => getDoc(doc(owner, 'admin_state', 'operations')))
    await assertSucceeds(setDoc(doc(admin, 'admin_state', 'operations'), { payload: '{}', revision: 1 }))

    assert.ok(true)
  } finally {
    await env.cleanup()
  }
})
