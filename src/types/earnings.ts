export type EarningsPeriod = 'today' | 'week' | 'month'

export interface EarningsSummary {
  today: number
  week: number
  month: number
  deliveriesToday: number
  deliveriesWeek: number
  deliveriesMonth: number
  averagePerDelivery: number
  incentive: number
  changePercent: number
}

export interface EarningsPoint {
  label: string
  amount: number
}

export interface Payout {
  id: string
  period: string
  amount: number
  status: 'Paid' | 'Processing'
  paidOn: string
}
