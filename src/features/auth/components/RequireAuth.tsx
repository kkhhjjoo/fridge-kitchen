import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { PageLoader } from '@/components/layout/PageLoader'
import { useAuthStore } from '../stores/useAuthStore'

/**
 * 로그인해야 볼 수 있는 화면을 감싸는 "문지기" 컴포넌트
 * - 확인 중이면 로딩 화면
 * - 로그인 안 했으면 로그인 페이지로 (원래 가려던 주소를 redirect로 기억)
 * - 로그인했으면 그대로 보여 줌
 *
 * ⚠️ 이건 "화면" 보호일 뿐이에요. 진짜 데이터 보호는 DB의 RLS가 합니다.
 *    (브라우저 코드는 사용자가 마음대로 바꿀 수 있으니까요)
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status)
  const location = useLocation()

  if (status === 'loading') return <PageLoader />

  if (status === 'unauthenticated') {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return children
}
