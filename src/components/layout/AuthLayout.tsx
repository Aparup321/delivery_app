import { memo } from 'react'
import type { ReactNode } from 'react'
import { Bike } from 'lucide-react'
import { useLanguage } from '../../context/language'

export interface AuthLayoutProps {
  children: ReactNode
}

/**
 * The hero is static between language changes, so it is memoized separately
 * from the form. Typing in the mobile-number field then re-renders only the
 * sheet content instead of reconciling the whole artwork on every keystroke.
 */
const AuthHero = memo(function AuthHero() {
  const { t } = useLanguage()

  return (
    <>
      <header className="relative z-10 flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-white/12 text-white">
            <Bike className="size-[18px]" aria-hidden="true" />
          </span>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/60">
            {t('Partner app')}
          </p>
        </div>

        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold text-white/75">
          {t('On demand')}
        </span>
      </header>

      <div className="relative z-10 flex h-[480px] min-h-0 shrink-0 flex-col overflow-hidden px-5 pt-9 lg:h-auto lg:flex-1">
        <HeroRoute />
        <h1 className="relative text-[clamp(48px,15vw,64px)] font-extrabold leading-[0.94] tracking-[-3px] text-white">
          PicDrop
          <br />
          <span className="text-brand-soft">+ HopNgo</span>
        </h1>
        <p className="relative mt-3 max-w-[24ch] text-[14px] font-medium leading-relaxed text-white/65">
          {t('Deliver on your terms.')}
        </p>
      </div>
    </>
  )
})

/**
 * Auth shell: brand hero with the form in a white sheet at the bottom.
 *
 * On phones the hero has a fixed 480px height (rather than `flex: 1`), so the
 * keyboard resizing the viewport never reflows or repaints the artwork. The
 * sheet is absolutely bottom-anchored and gets a short transform-only lift when
 * a field is focused; a surface tail keeps its bottom edge flush. From 1024px
 * the hero fills the available height and the sheet sits over it.
 *
 * The hero is memoized and the phone field is uncontrolled, so typing never
 * re-renders the artwork.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-[100dvh] justify-center overflow-hidden bg-brand-deep">
      <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-brand-deep">
        <AuthHero />

        <main className="auth-sheet sheet-enter app-scrollbar absolute inset-x-0 bottom-0 z-10 max-h-[calc(100dvh-56px)] overflow-y-auto overscroll-contain rounded-t-[30px] bg-surface px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-6 shadow-float">
          {children}
        </main>
        <div className="auth-sheet-tail" aria-hidden="true" />
      </div>
    </div>
  )
}

/** Faint street grid plus the route the whole app is built around. */
function HeroRoute() {
  return (
    <svg
      viewBox="0 0 430 420"
      preserveAspectRatio="xMidYMin slice"
      className="pointer-events-none absolute inset-x-0 top-0 h-[420px] w-full"
      aria-hidden="true"
    >
      <g stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none">
        <path d="M-20 90 H450 M-20 190 H450 M-20 290 H450 M-20 390 H450" />
        <path d="M50 -20 V440 M150 -20 V440 M250 -20 V440 M350 -20 V440" />
        <path d="M-20 390 L150 290 L250 350 L450 230" />
      </g>

      <path
        d="M-30 330 C 60 290, 130 350, 230 300 S 360 235, 460 255"
        stroke="rgba(201,184,242,0.55)"
        strokeWidth="2"
        strokeDasharray="3 9"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="230" cy="300" r="18" fill="none" stroke="rgba(201,184,242,0.28)" strokeWidth="2" />
      <circle cx="230" cy="300" r="7" fill="#C9B8F2" />
      <circle cx="60" cy="316" r="4.5" fill="rgba(255,255,255,0.55)" />
    </svg>
  )
}
