import type { ReactNode } from 'react'
import { Bike } from 'lucide-react'

export interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh justify-center bg-canvas">
      <div className="flex min-h-svh w-full max-w-[430px] flex-col bg-canvas">
        <header className="rounded-b-2xl bg-brand-deep px-6 pb-7 pt-8 text-white">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10">
              <Bike className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[18px] font-semibold leading-tight">
                Fafo Delivery
              </p>
              <p className="text-[12px] text-white/70">Delivery partner app</p>
            </div>
          </div>

          <p className="mt-5 max-w-[32ch] text-[12.5px] leading-relaxed text-white/70">
            Grocery and restaurant deliveries across Kolkata.
          </p>
        </header>

        <main className="flex-1 px-4 pb-8 pt-6">{children}</main>
      </div>
    </div>
  )
}
