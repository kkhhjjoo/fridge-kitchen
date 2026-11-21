import { Outlet, ScrollRestoration } from 'react-router'
import { isSupabaseEnabled } from '@/lib/supabase'
import { DemoModeBanner } from './DemoModeBanner'
import { Footer } from './Footer'
import { Header } from './Header'
import { MobileTabBar } from './MobileTabBar'
import { NavigationProgress } from './NavigationProgress'

/**
 * 모든 페이지가 공유하는 뼈대
 * <Outlet />: 현재 URL에 맞는 페이지 컴포넌트가 이 자리에 렌더링됩니다.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* 본문 바로가기: 평소엔 숨어 있다가 Tab 키를 누르면 나타남 (키보드·스크린리더 사용자용) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
      >
        본문 바로가기
      </a>

      <NavigationProgress />
      {!isSupabaseEnabled && <DemoModeBanner />}
      <Header />

      {/* pb-24: 모바일에서 하단 탭바에 콘텐츠가 가려지지 않도록 여백 */}
      <main id="main-content" tabIndex={-1} className="flex-1 pb-24 outline-none md:pb-12">
        <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8">
          <Outlet />
        </div>
      </main>

      {/* 푸터는 데스크톱에서만 (모바일은 탭바가 하단을 차지) */}
      <div className="hidden md:block">
        <Footer />
      </div>

      <MobileTabBar />

      {/* 페이지 이동 시 스크롤을 맨 위로, 뒤로가기 시 이전 위치로 복원 */}
      <ScrollRestoration />
    </div>
  )
}
