import { useCallback, useEffect, useState } from 'react'
import {
  sendDeliveryMessage,
  subscribeDeliveryMessages,
} from '../services/deliveryMessages'
import type { DeliveryMessage } from '../types/message'

export interface UseDeliveryMessagesOptions {
  deliveryId: string
  uid: string
  isLive: boolean
  enabled: boolean
}

/** Live chat thread and send action for one delivery. */
export function useDeliveryMessages({
  deliveryId,
  uid,
  isLive,
  enabled,
}: UseDeliveryMessagesOptions) {
  const [messages, setMessages] = useState<DeliveryMessage[]>([])
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [identity, setIdentity] = useState({ deliveryId, isLive })

  if (identity.deliveryId !== deliveryId || identity.isLive !== isLive) {
    setIdentity({ deliveryId, isLive })
    setMessages([])
    setError('')
  }

  useEffect(() => {
    if (!enabled || !deliveryId) {
      return
    }

    return subscribeDeliveryMessages(
      deliveryId,
      isLive,
      (items) => {
        setMessages(items)
        setError('')
      },
      () => setError('Messages could not be loaded. Check your connection.'),
    )
  }, [deliveryId, enabled, isLive])

  const send = useCallback(
    async (text: string): Promise<boolean> => {
      setError('')

      if (!uid) {
        setError('Sign in again to message the customer.')
        return false
      }

      setIsSending(true)

      try {
        const message = await sendDeliveryMessage({
          deliveryId,
          uid,
          text,
          isLive,
        })

        if (!isLive) {
          setMessages((current) => [...current, message])
        }

        return true
      } catch {
        setError('The message could not be sent. Try again.')
        return false
      } finally {
        setIsSending(false)
      }
    },
    [deliveryId, isLive, uid],
  )

  return { messages, error, isSending, send }
}
