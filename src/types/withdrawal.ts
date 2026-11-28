/** A payout request and its settlement state, owned by the partner. */
export type WithdrawalStatus = 'requested' | 'processing' | 'paid' | 'rejected'

export interface WithdrawalRequest {
  /** Display id shown to the partner and on the operations ticket. */
  id: string
  amount: number
  upiId: string
  status: WithdrawalStatus
  requestedAt: string
  updatedAt: string
}
