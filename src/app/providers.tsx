import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Toaster } from '@/components/ui/Toaster'
import { AuthListener } from '@/features/auth/components/AuthListener'

/**
 * 앱 전역 Provider 모음
 * 라우터 바깥이라 로그인 화면(헤더 없는 레이아웃)에서도 토스트와 인증 감지가 동작합니다.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  // useState로 생성: 컴포넌트가 다시 렌더링돼도 QueryClient(캐시 저장소)가 새로 만들어지지 않도록
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1분 동안은 "신선한 데이터"로 보고 다시 요청하지 않음
            retry: 1, // 실패 시 1번만 재시도
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {/* 로그인 상태 감지 (화면에 아무것도 그리지 않음). QueryClient 캐시를 비워야 해서 Provider 안에 둠 */}
      <AuthListener />
      {children}
      {/* 전역 토스트 알림 영역 — 앱 전체에서 딱 하나 */}
      <Toaster />
    </QueryClientProvider>
  )
}
