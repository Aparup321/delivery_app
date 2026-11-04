import type { Faq, SupportTicket } from '../types/support'

export const faqs: Faq[] = [
  {
    id: 'faq-1',
    question: 'When do I receive my weekly payout?',
    answer:
      'Payouts are processed every Monday for the previous Monday to Sunday period. It can take up to two working days for the amount to reach your bank account.',
  },
  {
    id: 'faq-2',
    question: 'Why can I not go online?',
    answer:
      'Going online needs an approved account. Finish your onboarding, KYC and bank details, and wait for the verification team to approve your profile.',
  },
  {
    id: 'faq-3',
    question: 'What should I do if a customer is unreachable?',
    answer:
      'Call the customer twice and wait at the address for five minutes. Then use Report an issue on the active delivery screen so the support team can help.',
  },
  {
    id: 'faq-4',
    question: 'How is my delivery earnings calculated?',
    answer:
      'Earnings combine a base fee, distance pay and any active incentive. The amount offered is shown before you accept a request.',
  },
  {
    id: 'faq-5',
    question: 'Can I update my documents later?',
    answer:
      'Yes. Uploaded documents can be replaced from your profile when they are near expiry or if the review team asks for a clearer copy.',
  },
]

export const initialTickets: SupportTicket[] = [
  {
    id: '#SUP-1042',
    subject: 'Payout not received',
    message:
      'My payout for the week of 20 Oct shows as paid but I have not received it in my bank account.',
    status: 'Open',
    createdAt: '2026-11-02T11:20:00+05:30',
  },
]
