import { useCallback, useEffect, useState } from 'react'
import {
  loadDemoWithdrawals,
  readLastUpiId,
  requestWithdrawal,
  subscribePartnerWithdrawals,
} from '../services/withdrawals'
import type { WithdrawalRequest } from '../types/withdrawal'

export interface UseWithdrawalsOptions {
  uid: string
  isLive: boolean
}

/**
 * Withdrawal history and submission. Live sessions subscribe to `payments`;
 * demo sessions persist locally so the flow still works without Firebase.
 */
export function useWithdrawals({ uid, isLive }: UseWithdrawalsOptions) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() =>
    isLive ? [] : loadDemoWithdrawals(uid),
  )
  const [lastUpiId, setLastUpiId] = useState(() => readLastUpiId(uid))
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [identity, setIdentity] = useState({ uid, isLive })

  // Reset when the signed-in partner or the connection mode changes. Adjusting
  // state during render avoids a flash of the previous partner's requests.
  if (identity.uid !== uid || identity.isLive !== isLive) {
    setIdentity({ uid, isLive })
    setWithdrawals(isLive ? [] : loadDemoWithdrawals(uid))
    setLastUpiId(readLastUpiId(uid))
  }

  useEffect(() => {
    if (!uid || !isLive) {
      return
    }

    return subscribePartnerWithdrawals(
      uid,
      (items) => {
        setWithdrawals(items)
        setError('')
      },
      () => setError('Withdrawals could not be loaded. Check your connection.'),
    )
  }, [uid, isLive])

  const submit = useCallback(
    async (amount: number, upiId: string): Promise<WithdrawalRequest | null> => {
      setError('')

      if (!uid) {
        setError(
          'The withdrawal request could not be saved. Check your connection and try again.',
        )
        return null
      }

      setIsSubmitting(true)

      try {
        const request = await requestWithdrawal(uid, {
          amount,
          upiId,
          isLive,
        })
        setLastUpiId(upiId)

        if (!isLive) {
          setWithdrawals(loadDemoWithdrawals(uid))
        }

        return request
      } catch {
        setError(
          'The withdrawal request could not be saved. Check your connection and try again.',
        )
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [uid, isLive],
  )

  return {
    withdrawals,
    lastUpiId,
    error,
    isSubmitting,
    submit,
  }
}
