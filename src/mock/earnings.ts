import type {
  EarningsPoint,
  EarningsSummary,
  Payout,
} from '../types/earnings'

/** Demo earnings figures for the signed-in partner. */
export const earningsSummary: EarningsSummary = {
  today: 1240,
  week: 7480,
  month: 26140,
  deliveriesToday: 8,
  deliveriesWeek: 46,
  deliveriesMonth: 172,
  averagePerDelivery: 155,
  incentive: 120,
  changePercent: 12,
}

export const earningsChart: EarningsPoint[] = [
  { label: '9 AM', amount: 320 },
  { label: '11 AM', amount: 480 },
  { label: '1 PM', amount: 760 },
  { label: '3 PM', amount: 540 },
  { label: '5 PM', amount: 890 },
  { label: '7 PM', amount: 1240 },
]

export const payouts: Payout[] = [
  {
    id: '#PAY-2291',
    period: 'Week of 27 Oct',
    amount: 7480,
    status: 'Processing',
    paidOn: 'Expected 05 Nov',
  },
  {
    id: '#PAY-2264',
    period: 'Week of 20 Oct',
    amount: 6915,
    status: 'Paid',
    paidOn: '25 Oct 2026',
  },
  {
    id: '#PAY-2240',
    period: 'Week of 13 Oct',
    amount: 7230,
    status: 'Paid',
    paidOn: '18 Oct 2026',
  },
]

/** Working hours and rating shown on the dashboard. */
export const dashboardStats = {
  workingHours: '6h 20m',
  rating: 4.8,
}
