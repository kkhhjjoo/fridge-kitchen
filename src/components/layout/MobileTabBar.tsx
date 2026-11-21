import { NavLink } from 'react-router'
import { cn } from '@/lib/cn'
import { NAV_ITEMS } from './navItems'

/**
 * 모바일 하단 탭바 (md 미만에서만 표시)
 * 엄지손가락이 닿기 쉬운 화면 아래쪽에 핵심 메뉴를 배치하는 모바일 앱 패턴입니다.
 * pb-[env(safe-area-inset-bottom)]: 아이폰 홈 인디케이터 영역만큼 여백 확보
 */
export function MobileTabBar() {
  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {NAV_ITEMS.map(({ to, shortLabel, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors',
                  isActive ? 'text-brand-700' : 'text-ink-500 hover:text-ink-900',
                )
              }
            >
              {/* children도 함수로 받을 수 있어서 활성 상태에 따라 아이콘 굵기를 바꿉니다. */}
              {({ isActive }) => (
                <>
                  <Icon aria-hidden className="size-6" strokeWidth={isActive ? 2.4 : 1.8} />
                  {shortLabel}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
