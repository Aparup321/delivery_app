/**
 * Firebase errors carry a stable `code` field (for example
 * `auth/configuration-not-found` or `permission-denied`) that is safe to show
 * to a developer when a connection is misconfigured. Other thrown values return
 * null so the UI can fall back to its generic message.
 */
export function getFirebaseErrorCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null
  }

  const code = (error as { code?: unknown }).code
  return typeof code === 'string' && code.length > 0 ? code : null
}

/**
 * Maps the Firebase errors an onboarding submission can hit to an actionable
 * English message key. Returns null for codes the caller's generic message
 * already covers.
 */
export function getFirebaseWriteErrorKey(code: string | null): string | null {
  switch (code) {
    case 'firebase/not-connected':
      return 'Firebase is not connected. Reconnect from the banner, then submit again.'
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'Firestore blocked the submission. Deploy the Firestore rules, then try again.'
    case 'storage/unauthorized':
      return 'Storage blocked the upload. Deploy the Storage rules, then try again.'
    case 'storage/unknown':
    case 'storage/bucket-not-found':
    case 'storage/project-not-found':
      return 'Firebase Storage is not set up. Create the default Storage bucket (Firebase requires the Blaze plan), then try again.'
    case 'storage/retry-limit-exceeded':
      return 'The Storage upload timed out. Check your connection and that Firebase Storage is enabled, then try again.'
    case 'unavailable':
      return 'Firebase is unreachable. Check your connection and try again.'
    default:
      return null
  }
}
