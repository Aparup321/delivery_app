import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../modules/auth/LoginPage'
import { VerifyOtpPage } from '../modules/auth/VerifyOtpPage'
import { ActiveDeliveryPage } from '../modules/deliveries/ActiveDeliveryPage'
import { DeliveriesPage } from '../modules/deliveries/DeliveriesPage'
import { EarningsPage } from '../modules/earnings/EarningsPage'
import { HistoryPage } from '../modules/history/HistoryPage'
import { HomePage } from '../modules/home/HomePage'
import { NotificationsPage } from '../modules/notifications/NotificationsPage'
import { OnboardingPage } from '../modules/onboarding/OnboardingPage'
import { ApplicationStatusPage } from '../modules/profile/ApplicationStatusPage'
import { ProfilePage } from '../modules/profile/ProfilePage'
import { SupportPage } from '../modules/support/SupportPage'
import { NotFoundPage } from './NotFoundPage'
import { OnboardingGate } from './OnboardingGate'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="verify-otp" element={<VerifyOtpPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route element={<OnboardingGate />}>
            <Route index element={<HomePage />} />
            <Route path="deliveries" element={<DeliveriesPage />} />
            <Route path="deliveries/active" element={<ActiveDeliveryPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="earnings" element={<EarningsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="application-status"
              element={<ApplicationStatusPage />}
            />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
