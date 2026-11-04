import type { ReactNode } from 'react'
import { Bike } from 'lucide-react'

export interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh justify-center bg-canvas lg:bg-[linear-gradient(150deg,#2a0f5c_0%,#43188f_45%,#5b28c9_100%)]">
      <div className="flex min-h-svh w-full max-w-[430px] flex-col bg-canvas lg:shadow-float">
        <header className="relative overflow-hidden rounded-b-[2rem] bg-brand-gradient px-6 pb-9 pt-10 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-14 size-44 rounded-full bg-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-10 size-56 rounded-full bg-white/5"
          />

          <div className="relative flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
              <Bike className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[19px] font-bold leading-tight tracking-tight">
                Fafo Delivery
              </p>
              <p className="text-[12.5px] text-white/70">Partner App</p>
            </div>
          </div>

          <p className="relative mt-6 max-w-[30ch] text-[13px] leading-relaxed text-white/75">
            Deliver grocery and restaurant orders. Earn on every trip. Grow on
            your own schedule.
          </p>
        </header>

        <main className="flex-1 px-4 pb-8 pt-6">{children}</main>
      </div>
    </div>
  )
}
