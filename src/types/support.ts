export interface Faq {
  id: string
  question: string
  answer: string
}

export type TicketStatus = 'Open' | 'Resolved'

export interface SupportTicket {
  id: string
  subject: string
  message: string
  status: TicketStatus
  createdAt: string
}
