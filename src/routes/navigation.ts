import { History, Home, Package, UserRound, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /** Only match the exact path (used for the home route). */
  end?: boolean
}

/** Bottom navigation items, in display order. */
export const primaryNavItems: NavItem[] = [
  { label: 'Home', to: '/', icon: Home, end: true },
  { label: 'Orders', to: '/deliveries', icon: Package },
  { label: 'History', to: '/history', icon: History },
  { label: 'Earnings', to: '/earnings', icon: Wallet },
  { label: 'Profile', to: '/profile', icon: UserRound },
]
