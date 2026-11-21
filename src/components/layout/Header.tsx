import { UserRound } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { cn } from '@/lib/cn'
import { Logo } from './Logo'
import { NAV_ITEMS } from './navItems'

// 데스크톱 상단 메뉴에는 '마이페이지'를 빼고 오른쪽 프로필 버튼으로 따로 둡니다.
const desktopNavItems = NAV_ITEMS.filter((item) => item.to !== '/mypage')

export function Header() {
  return (
    // sticky + backdrop-blur: 스크롤해도 상단에 고정되고, 뒤 콘텐츠가 은은하게 비칩니다.
    // pt-[env(safe-area-inset-top)]: 앱에서 휴대폰 상태 표시줄(시계·배터리)에 헤더가 가려지지 않게 (웹에서는 0)
    <header className="sticky top-0 z-40 border-b border-cream-200/80 bg-cream-100/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo />

        {/* md(768px) 이상에서만 보이는 상단 내비게이션 */}
        <nav aria-label="주요 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {desktopNavItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  // end: '/'가 모든 경로에서 활성화되지 않도록 정확히 일치할 때만 active
                  end={item.to === '/'}
                  // NavLink는 현재 경로면 isActive=true + aria-current="page"를 자동으로 붙여 줍니다.
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-brand-600 text-white'
                        : 'text-ink-700 hover:bg-cream-200 hover:text-ink-900',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* 오른쪽: 🔔 알림 + 마이페이지 (모바일에서도 보임) */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link
            to="/mypage"
            aria-label="마이페이지"
            className="grid size-10 place-items-center rounded-full bg-white text-ink-700 ring-1 ring-cream-300 transition-colors hover:text-brand-700"
          >
            <UserRound aria-hidden className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
