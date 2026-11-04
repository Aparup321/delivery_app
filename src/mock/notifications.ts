import type { AppNotification } from '../types/notification'

export const initialNotifications: AppNotification[] = [
  {
    id: 'NTF-1041',
    type: 'request',
    title: 'New grocery request nearby',
    body: 'FreshMart Grocery to New Town, about 5.1 km. Accept before the timer ends.',
    at: '2026-11-04T10:12:00+05:30',
    isRead: false,
  },
  {
    id: 'NTF-1039',
    type: 'payment',
    title: 'Weekly payout is being processed',
    body: '₹7,480 for the week of 27 Oct is expected in your bank account on 05 Nov.',
    at: '2026-11-04T09:05:00+05:30',
    isRead: false,
  },
  {
    id: 'NTF-1035',
    type: 'account',
    title: 'Complete your onboarding',
    body: 'Add your address, KYC documents and bank details to get approved for deliveries.',
    at: '2026-11-03T18:40:00+05:30',
    isRead: false,
  },
  {
    id: 'NTF-1031',
    type: 'delivery',
    title: 'Delivery #DEL7842 completed',
    body: '₹72 was added to today’s earnings. Thanks for delivering on time.',
    at: '2026-11-04T08:38:00+05:30',
    isRead: true,
  },
  {
    id: 'NTF-1026',
    type: 'request',
    title: 'Restaurant request missed',
    body: 'You did not respond to a request from Spice Villa in time.',
    at: '2026-11-03T13:18:00+05:30',
    isRead: true,
  },
]
