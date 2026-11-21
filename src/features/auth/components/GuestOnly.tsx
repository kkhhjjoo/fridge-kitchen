import type { ReactNode } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import { PageLoader } from '@/components/layout/PageLoader'
import { isSupabaseEnabled } from '@/lib/supabase'
import { useAuthStore } from '../stores/useAuthStore'
import { getSafeRedirect } from '../utils/redirect'

/**
 * 로그인 "안 한" 사람만 볼 화면(로그인·회원가입)을 감싸는 컴포넌트 — RequireAuth의 반대
 * 이미 로그인했거나 데모 모드라면 원래 가려던 곳(또는 홈)으로 보냅니다.
 * 로그인에 성공하면 상태가 바뀌면서 이 컴포넌트가 자동으로 이동시켜 줘요.
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status)
  const [searchParams] = useSearchParams()

  if (!isSupabaseEnabled || status === 'authenticated') {
    return <Navigate to={getSafeRedirect(searchParams.get('redirect'))} replace />
  }
  if (status === 'loading') return <PageLoader />
  return children
}
