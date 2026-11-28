export interface Faq {
  id: string
  question: string
  answer: string
}

export type TicketStatus = 'Open' | 'Resolved'

/** Operations sorts high-priority tickets (for example withdrawals) first. */
export type TicketPriority = 'High' | 'Normal'

export interface SupportTicket {
  id: string
  subject: string
  message: string
  status: TicketStatus
  priority?: TicketPriority
  createdAt: string
}
