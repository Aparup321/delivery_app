import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../modules/auth/LoginPage'
import { VerifyOtpPage } from '../modules/auth/VerifyOtpPage'
import { NotFoundPage } from './NotFoundPage'
import { OnboardingGate } from './OnboardingGate'
import { ProtectedRoute } from './ProtectedRoute'

const OnboardingPage = lazy(() => import('../modules/onboarding/OnboardingPage').then((module) => ({ default: module.OnboardingPage })))
const HomePage = lazy(() => import('../modules/home/HomePage').then((module) => ({ default: module.HomePage })))
const DeliveriesPage = lazy(() => import('../modules/deliveries/DeliveriesPage').then((module) => ({ default: module.DeliveriesPage })))
const ActiveDeliveryPage = lazy(() => import('../modules/deliveries/ActiveDeliveryPage').then((module) => ({ default: module.ActiveDeliveryPage })))
const HistoryPage = lazy(() => import('../modules/history/HistoryPage').then((module) => ({ default: module.HistoryPage })))
const EarningsPage = lazy(() => import('../modules/earnings/EarningsPage').then((module) => ({ default: module.EarningsPage })))
const ProfilePage = lazy(() => import('../modules/profile/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const EditDetailsPage = lazy(() => import('../modules/profile/EditDetailsPage').then((module) => ({ default: module.EditDetailsPage })))
const ApplicationStatusPage = lazy(() => import('../modules/profile/ApplicationStatusPage').then((module) => ({ default: module.ApplicationStatusPage })))
const NotificationsPage = lazy(() => import('../modules/notifications/NotificationsPage').then((module) => ({ default: module.NotificationsPage })))
const SupportPage = lazy(() => import('../modules/support/SupportPage').then((module) => ({ default: module.SupportPage })))

function RouteFallback() {
  return (
    <div className="grid min-h-[50dvh] place-items-center text-ink-soft" role="status" aria-label="Loading page">
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
    </div>
  )
}

function page(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="verify-otp" element={<VerifyOtpPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="onboarding" element={page(<OnboardingPage />)} />
          <Route element={<OnboardingGate />}>
            <Route index element={page(<HomePage />)} />
            <Route path="deliveries" element={page(<DeliveriesPage />)} />
            <Route path="deliveries/active" element={page(<ActiveDeliveryPage />)} />
            <Route path="history" element={page(<HistoryPage />)} />
            <Route path="earnings" element={page(<EarningsPage />)} />
            <Route path="profile" element={page(<ProfilePage />)} />
            <Route path="profile/edit" element={page(<EditDetailsPage />)} />
            <Route path="application-status" element={page(<ApplicationStatusPage />)} />
            <Route path="notifications" element={page(<NotificationsPage />)} />
            <Route path="support" element={page(<SupportPage />)} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
