import { NavLink } from 'react-router-dom'
import { primaryNavItems } from '../../routes/navigation'
import { cn } from '../../utils/cn'

export function BottomNavigation() {
  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-20 border-t border-line/80 bg-surface/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-nav backdrop-blur"
    >
      <ul className="flex items-stretch justify-between px-2 pt-2">
        {primaryNavItems.map(({ label, to, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group flex flex-col items-center gap-0.5 rounded-2xl py-1 text-[10.5px] font-semibold transition-colors',
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
                      'grid size-9 place-items-center rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-brand-soft text-brand-deep'
                        : 'bg-transparent group-hover:bg-brand-tint',
                    )}
                  >
                    <Icon
                      className="size-[19px]"
                      strokeWidth={isActive ? 2.4 : 1.9}
                      aria-hidden="true"
                    />
                  </span>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
