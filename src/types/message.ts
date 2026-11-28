/** One text message in the in-app delivery chat. */
export type MessageSender = 'partner' | 'customer'

export interface DeliveryMessage {
  id: string
  sender: MessageSender
  senderUid: string
  text: string
  createdAt: string
}
