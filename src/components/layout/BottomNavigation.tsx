import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../context/language'
import { primaryNavItems } from '../../routes/navigation'
import { cn } from '../../utils/cn'

export function BottomNavigation() {
  const { t } = useLanguage()

  return (
    <nav
      aria-label={t('Primary')}
      className="sticky bottom-0 z-20 border-t border-line bg-surface pb-[max(0.4rem,env(safe-area-inset-bottom))]"
    >
      <ul className="flex items-stretch justify-between px-2 pt-2">
        {primaryNavItems.map(({ label, to, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group flex flex-col items-center gap-0.5 rounded-xl py-1 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'text-brand-deep'
                    : 'text-ink-soft hover:text-brand',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid size-9 place-items-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-brand-soft text-brand-deep'
                        : 'bg-transparent group-hover:bg-brand-tint',
                    )}
                  >
                    <Icon
                      className="size-[18px]"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                  <span>{t(label)}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
